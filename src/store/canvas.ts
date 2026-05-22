import { create } from 'zustand'
import { Person, LifeEvent, Intersection } from '@/types'
import { PERSONS, EVENTS } from '@/data/mock'

interface CanvasStore {
  persons: Person[]
  events: LifeEvent[]
  visibleRange: { start: number; end: number }
  selectedEvent: LifeEvent | null
  selectedIntersection: Intersection | null
  addPerson: (person: Person) => void
  setVisibleRange: (range: { start: number; end: number }) => void
  setSelectedEvent: (event: LifeEvent | null) => void
  setSelectedIntersection: (intersection: Intersection | null) => void
  zoom: (factor: number, centerYear: number) => void
  pan: (deltaYears: number) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  persons: PERSONS,
  events: EVENTS,
  visibleRange: { start: 1700, end: 2030 },
  selectedEvent: null,
  selectedIntersection: null,

  addPerson: (person) =>
    set((state) => ({ persons: [...state.persons, person] })),

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
