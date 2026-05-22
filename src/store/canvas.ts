import { create } from 'zustand'
import { Person, LifeEvent, Intersection } from '@/types'

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
  setVisibleRange: (range: { start: number; end: number }) => void
  setSelectedEvent: (event: LifeEvent | null) => void
  setSelectedIntersection: (intersection: Intersection | null) => void
  zoom: (factor: number, centerYear: number) => void
  pan: (deltaYears: number) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  persons: [],
  events: [],
  loaded: false,
  visibleRange: { start: 1700, end: 2030 },
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
  },

  addPerson: (person) =>
    set((state) =>
      state.persons.some((p) => p.id === person.id)
        ? state
        : { persons: [...state.persons, person] }
    ),

  addEvents: (newEvents) =>
    set((state) => ({ events: [...state.events, ...newEvents] })),

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
