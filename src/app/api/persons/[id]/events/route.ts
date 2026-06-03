import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const events = await prisma.lifeEvent.findMany({
      where: { personId: id },
      select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
      orderBy: { year: 'asc' },
    })
    return NextResponse.json(events)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[GET /api/persons/${id}/events]`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { year, month, title, description, locationName } = await req.json()
    if (!year || !title) {
      return NextResponse.json({ error: 'year and title are required' }, { status: 400 })
    }
    const event = await prisma.lifeEvent.create({
      data: {
        personId: id,
        year: parseInt(String(year)),
        month: month ? parseInt(String(month)) : null,
        title,
        description: description || null,
        locationName: locationName || null,
        source: 'user',
      },
      select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
    })
    return NextResponse.json(event)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[POST /api/persons/${id}/events]`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
