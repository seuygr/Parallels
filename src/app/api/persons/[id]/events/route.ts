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
