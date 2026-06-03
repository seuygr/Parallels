import { create } from 'zustand'
import { Person, LifeEvent, Intersection } from '@/types'

const CURRENT_YEAR = new Date().getFullYear()

interface CanvasStore {
  persons: Person[]
  events: LifeEvent[]
  loaded: boolean
  visibleRange: { start: number; end: number }
  selectedEvent: LifeEvent | null
  selectedIntersection: Intersection | null
  loadPublicPersons: () => Promise<void>
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

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  persons: [],
  events: [],
  loaded: false,
  visibleRange: DEFAULT_RANGE,
  selectedEvent: null,
  selectedIntersection: null,

  loadPublicPersons: async () => {
    if (get().loaded) return
    const res = await fetch('/api/persons')
    const data = await res.json()
    const persons: Person[] = data.map((p: Person & { events: LifeEvent[] }) => ({
      id: p.id,
      name: p.name,
      bornYear: p.bornYear,
      diedYear: p.diedYear,
      bornCity: p.bornCity,
      bornCountry: p.bornCountry,
      type: p.type,
      color: p.color,
    }))
    const events: LifeEvent[] = data.flatMap((p: Person & { events: LifeEvent[] }) => p.events)
    set({ persons, events, loaded: true })
    get().fitToPersons()
  },

  addPerson: (person) =>
    set((state) =>
      state.persons.some((p) => p.id === person.id)
        ? state
        : { persons: [...state.persons, person] }
    ),

  addEvents: (newEvents) =>
    set((state) => ({ events: [...state.events, ...newEvents] })),

  removePerson: (id) =>
    set((state) => ({
      persons: state.persons.filter((p) => p.id !== id),
      events: state.events.filter((e) => e.personId !== id),
    })),

  setLoaded: (loaded) => set({ loaded }),

  reset: () => set({ persons: [], events: [], loaded: false, visibleRange: DEFAULT_RANGE }),

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
    const { visibleRange } = get()
    const { start, end } = visibleRange
    const span = end - start
    const newSpan = Math.max(20, Math.min(500, span * factor))
    const ratio = (centerYear - start) / span
    const newStart = centerYear - ratio * newSpan
    set({ visibleRange: { start: newStart, end: newStart + newSpan } })
  },

  pan: (deltaYears) => {
    const { visibleRange } = get()
    set({
      visibleRange: {
        start: visibleRange.start + deltaYears,
        end: visibleRange.end + deltaYears,
      },
    })
  },
}))
