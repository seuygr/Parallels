import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWikidataPerson } from '@/lib/wikidata'

const EVENT_SELECT = {
  id: true, personId: true, year: true, month: true,
  title: true, titleZh: true,
  description: true, descriptionZh: true,
  locationName: true, locationNameZh: true,
  importance: true,
} as const

function loc(city: string | null | undefined, country: string | null | undefined) {
  if (city && country) return `${city}, ${country}`
  return city ?? country ?? null
}

function bornDiedEvents(p: {
  bornYear: number; diedYear?: number | null
  bornCity?: string | null; bornCityZh?: string | null
  bornCountry?: string | null; bornCountryZh?: string | null
}) {
  const events = [
    {
      year: p.bornYear,
      title: 'Born',
      titleZh: '出生',
      locationName: loc(p.bornCity, p.bornCountry),
      locationNameZh: loc(p.bornCityZh, p.bornCountryZh),
      importance: 1,
      source: 'wikidata',
    },
  ]
  if (p.diedYear) {
    events.push({
      year: p.diedYear,
      title: 'Died',
      titleZh: '逝世',
      locationName: null,
      locationNameZh: null,
      importance: 1,
      source: 'wikidata',
    })
  }
  return events
}

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')
  try {
    if (ids) {
      const idList = ids.split(',').filter(Boolean)
      const persons = await prisma.person.findMany({
        where: { id: { in: idList } },
        include: { events: { select: EVENT_SELECT, orderBy: { year: 'asc' } } },
      })
      const ordered = idList.map((id) => persons.find((p) => p.id === id)).filter(Boolean)
      return NextResponse.json(ordered)
    }

    const persons = await prisma.person.findMany({
      where: { isPublic: true },
      include: { events: { select: EVENT_SELECT, orderBy: { year: 'asc' } } },
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
    const body = await req.json()
    const { color } = body

    // Personal profile creation (no Wikidata)
    if (body.type === 'personal') {
      const { name, bornYear, diedYear, bornCity } = body
      if (!name || !bornYear) {
        return NextResponse.json({ error: 'name and bornYear are required' }, { status: 400 })
      }
      const parsedBorn = parseInt(String(bornYear))
      const parsedDied = diedYear ? parseInt(String(diedYear)) : null
      const person = await prisma.person.create({
        data: {
          name,
          bornYear: parsedBorn,
          diedYear: parsedDied,
          bornCity: bornCity ?? null,
          type: 'personal',
          isPublic: false,
          color: color ?? '#94A3B8',
          events: {
            create: bornDiedEvents({ bornYear: parsedBorn, diedYear: parsedDied, bornCity }),
          },
        },
        include: { events: { select: EVENT_SELECT, orderBy: { year: 'asc' } } },
      })
      return NextResponse.json(person)
    }

    const { wikidataId, name } = body
    if (!wikidataId || !name) {
      return NextResponse.json({ error: 'wikidataId and name are required' }, { status: 400 })
    }

    // Return existing person if already in DB
    const existing = await prisma.person.findUnique({
      where: { wikidataId },
      include: { events: { select: EVENT_SELECT, orderBy: { year: 'asc' } } },
    })
    if (existing) return NextResponse.json(existing)

    // Fetch from Wikidata
    const data = await fetchWikidataPerson(wikidataId, name)
    if (!data) {
      return NextResponse.json({ error: 'Could not fetch person data from Wikidata' }, { status: 404 })
    }

    const person = await prisma.person.create({
      data: {
        name: data.name,
        nameZh: data.nameZh,
        bornYear: data.bornYear,
        diedYear: data.diedYear,
        bornCity: data.bornCity,
        bornCityZh: data.bornCityZh,
        bornCountry: data.bornCountry,
        bornCountryZh: data.bornCountryZh,
        type: 'famous',
        wikidataId: data.wikidataId,
        isPublic: true,
        color: color ?? '#94A3B8',
        events: {
          create: [
            ...bornDiedEvents(data),
            ...data.events.map((e) => ({
              year: e.year,
              title: e.title,
              titleZh: e.titleZh,
              locationName: null,
              locationNameZh: null,
              source: 'wikipedia',
              importance: 3,
            })),
          ],
        },
      },
      include: { events: { select: EVENT_SELECT, orderBy: { year: 'asc' } } },
    })

    return NextResponse.json(person)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/persons]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
