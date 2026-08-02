import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SPARQL = 'https://query.wikidata.org/sparql'
const SEARCH = 'https://www.wikidata.org/w/api.php'
const UA = 'Parallels/1.0 (seu.ygr@gmail.com)'

async function sparql(query: string) {
  const url = new URL(SPARQL)
  url.searchParams.set('query', query)
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
  })
  return res.json()
}

async function fetchZhLabels(wikidataId: string) {
  // Name in zh via wbgetentities
  const url = new URL(SEARCH)
  url.searchParams.set('action', 'wbgetentities')
  url.searchParams.set('ids', wikidataId)
  url.searchParams.set('languages', 'zh|zh-hans|zh-hant')
  url.searchParams.set('props', 'labels')
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } })
  const data = await res.json()
  const labels = data.entities?.[wikidataId]?.labels
  const nameZh = labels?.['zh']?.value ?? labels?.['zh-hans']?.value ?? labels?.['zh-hant']?.value ?? null

  // Birth city + country in zh via SPARQL
  const detailsQuery = `
    SELECT ?birthPlaceLabel ?countryLabel WHERE {
      OPTIONAL { wd:${wikidataId} wdt:P19 ?birthPlace }
      OPTIONAL { wd:${wikidataId} wdt:P27 ?country }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "zh" }
    } LIMIT 1`

  // Events in zh via SPARQL
  const eventsQuery = `
    SELECT ?eventLabel ?year WHERE {
      wd:${wikidataId} p:P39 ?stmt .
      ?stmt ps:P39 ?event .
      ?stmt pq:P580 ?startDate .
      BIND(YEAR(?startDate) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "zh" }
    } ORDER BY ?year LIMIT 12`

  const [detailsData, eventsData] = await Promise.all([
    sparql(detailsQuery),
    sparql(eventsQuery),
  ])

  const d = detailsData.results?.bindings?.[0]
  const bornCityZh = d?.birthPlaceLabel?.value ?? null
  const bornCountryZh = d?.countryLabel?.value ?? null

  type EventBinding = { eventLabel?: { value: string }; year?: { value: string } }
  const events: { year: number; titleZh: string }[] =
    (eventsData.results?.bindings ?? [] as EventBinding[])
      .filter((b: EventBinding) => b.year?.value && b.eventLabel?.value)
      .map((b: EventBinding) => ({
        year: parseInt(b.year!.value),
        titleZh: b.eventLabel!.value,
      }))

  return { nameZh, bornCityZh, bornCountryZh, events }
}

// Rate limit: wait ms between requests to avoid hitting Wikidata limits
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const persons = await prisma.person.findMany({
    where: {
      wikidataId: { not: null },
      nameZh: null, // only backfill missing ones
    },
    include: {
      events: { select: { id: true, year: true, titleZh: true } },
    },
  })

  console.log(`Found ${persons.length} persons to backfill.\n`)

  for (const person of persons) {
    const id = person.wikidataId!
    try {
      const zh = await fetchZhLabels(id)

      // Update person
      await prisma.person.update({
        where: { id: person.id },
        data: {
          nameZh: zh.nameZh,
          bornCityZh: zh.bornCityZh,
          bornCountryZh: zh.bornCountryZh,
        },
      })

      // Update matching events by year
      for (const zhEvent of zh.events) {
        const match = person.events.find((e) => e.year === zhEvent.year && !e.titleZh)
        if (match) {
          await prisma.lifeEvent.update({
            where: { id: match.id },
            data: { titleZh: zhEvent.titleZh },
          })
        }
      }

      console.log(`  ✓ ${person.name} → ${zh.nameZh ?? '(no zh name)'}`)
    } catch (err) {
      console.error(`  ✗ ${person.name} (${id}):`, err)
    }

    // 300ms between persons to stay within Wikidata rate limits
    await sleep(300)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
