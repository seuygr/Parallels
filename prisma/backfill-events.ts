import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SPARQL = 'https://query.wikidata.org/sparql'
const UA = 'Parallels/1.0 (seu.ygr@gmail.com)'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function sparql(query: string) {
  const url = new URL(SPARQL)
  url.searchParams.set('query', query)
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
  })
  return res.json()
}

function eventsQuery(wikidataId: string, lang: string) {
  return `
    SELECT DISTINCT ?year ?eventLabel WHERE {
      {
        wd:${wikidataId} p:P39 ?s . ?s ps:P39 ?v . ?s pq:P580 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      } UNION {
        wd:${wikidataId} p:P793 ?s . ?s ps:P793 ?v . ?s pq:P585 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      } UNION {
        wd:${wikidataId} p:P166 ?s . ?s ps:P166 ?v . ?s pq:P585 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      } UNION {
        wd:${wikidataId} p:P1344 ?s . ?s ps:P1344 ?v . ?s pq:P585 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      } UNION {
        wd:${wikidataId} p:P607 ?s . ?s ps:P607 ?v . ?s pq:P580 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      } UNION {
        wd:${wikidataId} p:P69 ?s . ?s ps:P69 ?v . ?s pq:P580 ?d .
        BIND(YEAR(?d) AS ?year) . ?v rdfs:label ?eventLabel . FILTER(LANG(?eventLabel)="${lang}")
      }
    } ORDER BY ?year LIMIT 30`
}

type Binding = { eventLabel?: { value: string }; year?: { value: string } }

async function fetchRichEvents(wikidataId: string) {
  const [enData, zhData] = await Promise.all([
    sparql(eventsQuery(wikidataId, 'en')),
    sparql(eventsQuery(wikidataId, 'zh')),
  ])

  const enBindings: Binding[] = enData.results?.bindings ?? []
  const zhBindings: Binding[] = zhData.results?.bindings ?? []

  const zhByYear = new Map<number, string>()
  for (const b of zhBindings) {
    if (b.year?.value && b.eventLabel?.value) {
      zhByYear.set(parseInt(b.year.value), b.eventLabel.value)
    }
  }

  return enBindings
    .filter((b) => b.year?.value && b.eventLabel?.value)
    .map((b) => ({
      year: parseInt(b.year!.value),
      title: b.eventLabel!.value,
      titleZh: zhByYear.get(parseInt(b.year!.value)) ?? null,
    }))
}

async function main() {
  const persons = await prisma.person.findMany({
    where: {
      wikidataId: { not: null },
      NOT: { wikidataId: { startsWith: 'seed_' } },
    },
    include: {
      events: { select: { id: true, title: true, source: true } },
    },
  })

  console.log(`Enriching events for ${persons.length} persons...\n`)

  for (const person of persons) {
    try {
      const richEvents = await fetchRichEvents(person.wikidataId!)

      if (richEvents.length === 0) {
        console.log(`  - ${person.name}: no additional events found`)
        await sleep(400)
        continue
      }

      // Delete existing wikidata-sourced events (except Born/Died which we keep)
      await prisma.lifeEvent.deleteMany({
        where: {
          personId: person.id,
          source: 'wikidata',
          title: { notIn: ['Born', 'Died'] },
        },
      })

      // Re-insert with richer data
      await prisma.lifeEvent.createMany({
        data: richEvents.map((e) => ({
          personId: person.id,
          year: e.year,
          title: e.title,
          titleZh: e.titleZh,
          source: 'wikidata',
          importance: 1,
        })),
        skipDuplicates: true,
      })

      console.log(`  ✓ ${person.name}: ${richEvents.length} events`)
    } catch (err) {
      console.error(`  ✗ ${person.name}:`, err)
    }

    // 400ms between requests to stay within Wikidata rate limits
    await sleep(400)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
