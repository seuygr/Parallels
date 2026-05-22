import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
}
