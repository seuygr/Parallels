import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const UA = 'Parallels/1.0 (seu.ygr@gmail.com)'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function searchWikidataId(name: string): Promise<string | null> {
  const url = new URL('https://www.wikidata.org/w/api.php')
  url.searchParams.set('action', 'wbsearchentities')
  url.searchParams.set('search', name)
  url.searchParams.set('language', 'en')
  url.searchParams.set('type', 'item')
  url.searchParams.set('limit', '5')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } })
  const data = await res.json()

  // Pick first result whose description looks like a person (has a year or person-related term)
  const PERSON_TERMS = ['politician', 'leader', 'actor', 'actress', 'musician', 'singer',
    'businessman', 'president', 'prime minister', 'princess', 'queen', 'director',
    'athlete', 'boxer', 'activist', 'writer', 'author', 'artist']

  for (const r of data.search ?? []) {
    const desc = (r.description ?? '').toLowerCase()
    if (/\b\d{3,4}\b/.test(desc) || PERSON_TERMS.some(t => desc.includes(t))) {
      return r.id
    }
  }

  // Fall back to first result if none match heuristics
  return data.search?.[0]?.id ?? null
}

async function main() {
  const seedPersons = await prisma.person.findMany({
    where: { wikidataId: { startsWith: 'seed_' } },
    select: { id: true, name: true, wikidataId: true },
  })

  console.log(`Found ${seedPersons.length} persons with placeholder IDs.\n`)

  for (const person of seedPersons) {
    try {
      const realId = await searchWikidataId(person.name)
      if (!realId) {
        console.log(`  ? ${person.name} → no match found, skipping`)
        await sleep(300)
        continue
      }

      // Check if another person already has this wikidataId
      const existing = await prisma.person.findUnique({ where: { wikidataId: realId } })
      if (existing && existing.id !== person.id) {
        console.log(`  ! ${person.name} → ${realId} already used by "${existing.name}", skipping`)
        await sleep(300)
        continue
      }

      await prisma.person.update({
        where: { id: person.id },
        data: { wikidataId: realId },
      })

      console.log(`  ✓ ${person.name}: ${person.wikidataId} → ${realId}`)
    } catch (err) {
      console.error(`  ✗ ${person.name}:`, err)
    }

    await sleep(300)
  }

  console.log('\nDone. Now run: npx tsx prisma/backfill-zh.ts')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
