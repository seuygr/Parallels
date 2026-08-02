export interface Person {
  id: string
  name: string
  nameZh?: string | null
  bornYear: number
  diedYear: number | null
  bornCity: string
  bornCityZh?: string | null
  bornCountry: string
  bornCountryZh?: string | null
  type: 'famous' | 'personal'
  color: string
}

export interface LifeEvent {
  id: string
  personId: string
  year: number
  month?: number
  title: string
  titleZh?: string | null
  description: string
  descriptionZh?: string | null
  locationName: string
  locationNameZh?: string | null
  importance: number
}

export interface Intersection {
  personA: Person
  personB: Person
  overlapStartYear: number
  overlapEndYear: number
  overlapYears: number
}

export type Language = 'en' | 'zh'
