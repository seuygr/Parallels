import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWikidataPerson } from '@/lib/wikidata'

export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      where: { isPublic: true },
      include: {
        events: {
          select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
          orderBy: { year: 'asc' },
        },
      },
      orderBy: { bornYear: 'asc' },
    })
    return NextResponse.json(persons)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/persons]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wikidataId, name, color } = await req.json()
    if (!wikidataId || !name) {
      return NextResponse.json({ error: 'wikidataId and name are required' }, { status: 400 })
    }

    // Return existing person if already in DB
    const existing = await prisma.person.findUnique({
      where: { wikidataId },
      include: {
        events: {
          select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
          orderBy: { year: 'asc' },
        },
      },
    })
    if (existing) return NextResponse.json(existing)

    // Fetch from Wikidata
    const data = await fetchWikidataPerson(wikidataId, name)
    if (!data) {
      return NextResponse.json({ error: 'Could not fetch person data from Wikidata' }, { status: 404 })
    }

    // Save person + events to DB
    const person = await prisma.person.create({
      data: {
        name: data.name,
        bornYear: data.bornYear,
        diedYear: data.diedYear,
        bornCity: data.bornCity,
        bornCountry: data.bornCountry,
        type: 'famous',
        wikidataId: data.wikidataId,
        isPublic: true,
        color: color ?? '#94A3B8',
        events: {
          create: data.events.map((e) => ({
            year: e.year,
            title: e.title,
            source: 'wikidata',
          })),
        },
      },
      include: {
        events: {
          select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
          orderBy: { year: 'asc' },
        },
      },
    })

    return NextResponse.json(person)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/persons]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
