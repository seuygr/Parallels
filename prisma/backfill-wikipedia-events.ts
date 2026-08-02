import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { fetchWikipediaLifeEvents } from '../src/lib/wikipediaEvents'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Limit how many persons to process in one run, e.g. `npx tsx prisma/backfill-wikipedia-events.ts 5`
const LIMIT = process.argv[2] ? parseInt(process.argv[2]) : undefined

async function main() {
  const persons = await prisma.person.findMany({
    where: {
      wikidataId: { not: null },
      NOT: { wikidataId: { startsWith: 'seed_' } },
    },
    take: LIMIT,
  })

  console.log(`Pulling Wikipedia life events for ${persons.length} persons...\n`)

  for (const person of persons) {
    try {
      const events = await fetchWikipediaLifeEvents(person.wikidataId!, person.bornYear, person.diedYear)

      if (events.length === 0) {
        console.log(`  - ${person.name}: no year-anchored sentences found`)
        await sleep(300)
        continue
      }

      await prisma.lifeEvent.deleteMany({
        where: { personId: person.id, source: 'wikipedia' },
      })

      await prisma.lifeEvent.createMany({
        data: events.map((e) => ({
          personId: person.id,
          year: e.year,
          title: e.title,
          titleZh: e.titleZh,
          source: 'wikipedia',
          importance: 3,
        })),
      })

      const withZh = events.filter((e) => e.titleZh).length
      console.log(`  ✓ ${person.name}: ${events.length} events (${withZh} with zh text)`)
    } catch (err) {
      console.error(`  ✗ ${person.name}:`, err)
    }

    await sleep(400)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
