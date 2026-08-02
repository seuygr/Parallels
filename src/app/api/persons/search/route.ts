import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchWikidata } from '@/lib/wikidata'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ local: [], wikidata: [] })

  try {
    // Catch DB errors so Wikidata results still return when DB is unavailable
    const dbPersonsQuery = prisma.person.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, bornYear: true, diedYear: true, bornCity: true, bornCountry: true, type: true, color: true, wikidataId: true },
      take: 5,
    })

    const [dbPersons, wikidataResults] = await Promise.all([
      dbPersonsQuery.catch(() => [] as Awaited<typeof dbPersonsQuery>),
      searchWikidata(q),
    ])

    // Remove Wikidata results already in our DB
    const existingIds = new Set(dbPersons.map((p) => p.wikidataId).filter(Boolean))
    const newWikidata = wikidataResults.filter((r) => !existingIds.has(r.wikidataId))

    return NextResponse.json({ local: dbPersons, wikidata: newWikidata })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/persons/search]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
