import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const persons = await prisma.person.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    select: { id: true, name: true, bornYear: true, diedYear: true, bornCity: true, bornCountry: true, type: true, color: true },
    take: 10,
  })

  return NextResponse.json(persons)
}
