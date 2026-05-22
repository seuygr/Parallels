export interface Person {
  id: string
  name: string
  bornYear: number
  diedYear: number | null
  bornCity: string
  bornCountry: string
  type: 'famous' | 'personal'
  color: string
}

export interface LifeEvent {
  id: string
  personId: string
  year: number
  month?: number
  title: string
  description: string
  locationName: string
}

export interface Intersection {
  personA: Person
  personB: Person
  overlapStartYear: number
  overlapEndYear: number
  overlapYears: number
}
