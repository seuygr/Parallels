import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        events: {
          select: { id: true, personId: true, year: true, month: true, title: true, description: true, locationName: true },
          orderBy: { year: 'asc' },
        },
      },
    })
    if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(person)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[GET /api/persons/${id}]`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
