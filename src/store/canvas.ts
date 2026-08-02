import { create } from 'zustand'
import { Person, LifeEvent, Intersection, Language } from '@/types'

const CURRENT_YEAR = new Date().getFullYear()
const CANVAS_KEY = 'parallels_canvas'
const BUFFER = 50 // years of padding beyond the earliest/latest person

function getBounds(persons: Person[]) {
  if (persons.length === 0) return { min: -3000, max: CURRENT_YEAR + 20 }
  const minYear = Math.min(...persons.map((p) => p.bornYear))
  const maxYear = Math.max(...persons.map((p) => p.diedYear ?? CURRENT_YEAR))
  return { min: minYear - BUFFER, max: maxYear + BUFFER }
}

interface CanvasStore {
  persons: Person[]
  events: LifeEvent[]
  loaded: boolean
  language: Language
  setLanguage: (lang: Language) => void
  visibleRange: { start: number; end: number }
  selectedEvent: LifeEvent | null
  selectedIntersection: Intersection | null
  loadCanvas: () => Promise<void>
  addPerson: (person: Person) => void
  addEvents: (events: LifeEvent[]) => void
  removePerson: (id: string) => void
  setLoaded: (loaded: boolean) => void
  reset: () => void
  fitToPersons: () => void
  setVisibleRange: (range: { start: number; end: number }) => void
  setSelectedEvent: (event: LifeEvent | null) => void
  setSelectedIntersection: (intersection: Intersection | null) => void
  zoom: (factor: number, centerYear: number) => void
  pan: (deltaYears: number) => void
}

const DEFAULT_RANGE = { start: 1700, end: 2030 }

function persistCanvas(persons: Person[], language: Language) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CANVAS_KEY, JSON.stringify({ personIds: persons.map((p) => p.id), language }))
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  persons: [],
  events: [],
  loaded: false,
  language: 'en',
  visibleRange: DEFAULT_RANGE,
  selectedEvent: null,
  selectedIntersection: null,

  setLanguage: (lang) => {
    const { persons } = get()
    persistCanvas(persons, lang)
    set({ language: lang })
  },

  loadCanvas: async () => {
    if (get().loaded) return

    const raw = typeof window !== 'undefined' ? localStorage.getItem(CANVAS_KEY) : null
    const parsed = raw ? JSON.parse(raw) : {}
    const personIds: string[] = parsed.personIds ?? []
    const language: Language = parsed.language === 'zh' ? 'zh' : 'en'
    set({ language })

    if (personIds.length === 0) {
      set({ loaded: true })
      return
    }

    try {
      const res = await fetch(`/api/persons?ids=${personIds.join(',')}`)
      const data = await res.json()
      if (!Array.isArray(data)) return
      const persons: Person[] = data.map((p: Person & { events: LifeEvent[] }) => ({
        id: p.id, name: p.name, nameZh: p.nameZh,
        bornYear: p.bornYear, diedYear: p.diedYear,
        bornCity: p.bornCity, bornCityZh: p.bornCityZh,
        bornCountry: p.bornCountry, bornCountryZh: p.bornCountryZh,
        type: p.type, color: p.color,
      }))
      const events: LifeEvent[] = data.flatMap((p: Person & { events: LifeEvent[] }) => p.events)
      set({ persons, events, loaded: true })
      get().fitToPersons()
    } catch (err) {
      console.error('[loadCanvas]', err)
      set({ loaded: true })
    }
  },

  addPerson: (person) => {
    set((state) => {
      if (state.persons.some((p) => p.id === person.id)) return state
      const persons = [...state.persons, person]
      persistCanvas(persons, state.language)
      return { persons }
    })
    get().fitToPersons()
  },

  addEvents: (newEvents) =>
    set((state) => ({ events: [...state.events, ...(Array.isArray(newEvents) ? newEvents : [])] })),

  removePerson: (id) =>
    set((state) => {
      const persons = state.persons.filter((p) => p.id !== id)
      persistCanvas(persons, state.language)
      return {
        persons,
        events: state.events.filter((e) => e.personId !== id),
      }
    }),

  setLoaded: (loaded) => set({ loaded }),

  reset: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(CANVAS_KEY)
    set({ persons: [], events: [], loaded: false, visibleRange: DEFAULT_RANGE })
  },

  fitToPersons: () => {
    const { persons } = get()
    if (persons.length === 0) return
    const minYear = Math.min(...persons.map((p) => p.bornYear))
    const maxYear = Math.max(...persons.map((p) => p.diedYear ?? CURRENT_YEAR))
    const span = maxYear - minYear
    const padding = Math.max(span * 0.15, 10)
    set({ visibleRange: { start: minYear - padding, end: maxYear + padding } })
  },

  setVisibleRange: (range) => set({ visibleRange: range }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedIntersection: (intersection) => set({ selectedIntersection: intersection }),

  zoom: (factor, centerYear) => {
    const { visibleRange, persons } = get()
    const { start, end } = visibleRange
    const span = end - start
    const { min, max } = getBounds(persons)
    const newSpan = Math.max(20, Math.min(max - min, span * factor))
    const ratio = (centerYear - start) / span
    let newStart = centerYear - ratio * newSpan
    let newEnd = newStart + newSpan
    if (newStart < min) { newStart = min; newEnd = min + newSpan }
    if (newEnd > max) { newEnd = max; newStart = max - newSpan }
    set({ visibleRange: { start: newStart, end: newEnd } })
  },

  pan: (deltaYears) => {
    const { visibleRange, persons } = get()
    const { min, max } = getBounds(persons)
    const span = visibleRange.end - visibleRange.start
    let newStart = visibleRange.start + deltaYears
    let newEnd = visibleRange.end + deltaYears
    if (newStart < min) { newStart = min; newEnd = min + span }
    if (newEnd > max) { newEnd = max; newStart = max - span }
    set({ visibleRange: { start: newStart, end: newEnd } })
  },
}))
