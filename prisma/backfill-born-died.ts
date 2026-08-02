import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function loc(city: string | null, country: string | null): string | null {
  if (city && country) return `${city}, ${country}`
  return city ?? country ?? null
}

async function main() {
  const persons = await prisma.person.findMany({
    include: {
      events: { select: { year: true, title: true } },
    },
  })

  console.log(`Processing ${persons.length} persons...\n`)

  let added = 0

  for (const person of persons) {
    const hasBorn = person.events.some((e) => e.year === person.bornYear && e.title === 'Born')
    const hasDied = person.diedYear
      ? person.events.some((e) => e.year === person.diedYear && e.title === 'Died')
      : true // no died year = nothing to add

    if (hasBorn && hasDied) continue

    const toCreate = []

    if (!hasBorn) {
      toCreate.push({
        personId: person.id,
        year: person.bornYear,
        title: 'Born',
        titleZh: '出生',
        locationName: loc(person.bornCity, person.bornCountry),
        locationNameZh: loc(person.bornCityZh, person.bornCountryZh),
        importance: 1,
        source: 'wikidata',
      })
    }

    if (!hasDied && person.diedYear) {
      toCreate.push({
        personId: person.id,
        year: person.diedYear,
        title: 'Died',
        titleZh: '逝世',
        locationName: null,
        locationNameZh: null,
        importance: 1,
        source: 'wikidata',
      })
    }

    await prisma.lifeEvent.createMany({ data: toCreate, skipDuplicates: true })
    added += toCreate.length
    console.log(`  ✓ ${person.name} — added: ${toCreate.map((e) => e.title).join(', ')}`)
  }

  console.log(`\nDone — ${added} events added.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
