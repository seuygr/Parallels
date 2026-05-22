import { Person, Intersection } from '@/types'

const CURRENT_YEAR = new Date().getFullYear()

export function computeIntersection(a: Person, b: Person): Intersection | null {
  const aEnd = a.diedYear ?? CURRENT_YEAR
  const bEnd = b.diedYear ?? CURRENT_YEAR

  const overlapStart = Math.max(a.bornYear, b.bornYear)
  const overlapEnd = Math.min(aEnd, bEnd)

  if (overlapStart >= overlapEnd) return null

  return {
    personA: a,
    personB: b,
    overlapStartYear: overlapStart,
    overlapEndYear: overlapEnd,
    overlapYears: overlapEnd - overlapStart,
  }
}

export function computeAllIntersections(persons: Person[]): Intersection[] {
  const intersections: Intersection[] = []
  for (let i = 0; i < persons.length; i++) {
    for (let j = i + 1; j < persons.length; j++) {
      const result = computeIntersection(persons[i], persons[j])
      if (result) intersections.push(result)
    }
  }
  return intersections
}
