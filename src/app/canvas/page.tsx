'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCanvasStore } from '@/store/canvas'
import TimelineCanvas from '@/components/timeline/TimelineCanvas'
import StoryCard from '@/components/StoryCard'
import IntersectionPanel from '@/components/IntersectionPanel'
import { LifeEvent, Intersection } from '@/types'

export default function CanvasPage() {
  const router = useRouter()
  const { persons, visibleRange, setVisibleRange } = useCanvasStore()
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null)

  const selectedPerson = selectedEvent
    ? persons.find((p) => p.id === selectedEvent.personId) ?? null
    : null

  const span = visibleRange.end - visibleRange.start
  const sliderValue = Math.max(0, Math.min(100, ((330 - span) / 310) * 100))

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const newSpan = 330 - (v / 100) * 310
    const center = (visibleRange.start + visibleRange.end) / 2
    setVisibleRange({ start: center - newSpan / 2, end: center + newSpan / 2 })
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0A0A0F' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 flex-shrink-0"
        style={{ background: '#16161F', borderBottom: '1px solid #2A2A3A' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: '#94A3B8' }}>
            ← Back
          </button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: '#2A2A3A', color: '#F1F1F5' }}>
            + Add person
          </button>
        </div>

        {/* Timeline / Map toggle */}
        <div className="flex items-center rounded-lg p-0.5"
          style={{ background: '#2A2A3A' }}>
          <button className="px-4 py-1.5 rounded-md text-xs font-medium"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}>
            Timeline
          </button>
          <button className="px-4 py-1.5 text-xs font-medium"
            style={{ color: '#94A3B8' }}>
            Map
          </button>
        </div>

        <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: '#2A2A3A', color: '#F1F1F5' }}>
          Share
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #2A2A3A22' }}>
        {persons.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{p.name}</span>
          </div>
        ))}
        <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>
          Scroll or pinch to zoom · Drag to pan
        </span>
      </div>

      {/* Timeline canvas */}
      <div className="flex-1 overflow-hidden">
        <TimelineCanvas
          onEventClick={setSelectedEvent}
          onIntersectionClick={setSelectedIntersection}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center justify-center gap-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid #2A2A3A22' }}>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          {Math.round(visibleRange.start)} – {Math.round(visibleRange.end)}
        </span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>zoom</span>
        <input
          type="range" min={0} max={100} value={sliderValue}
          onChange={handleSliderChange}
          className="w-48 accent-amber-400"
          style={{ accentColor: '#F59E0B' }}
        />
      </div>

      {/* Modals */}
      <StoryCard
        event={selectedEvent}
        person={selectedPerson}
        onClose={() => setSelectedEvent(null)}
      />
      <IntersectionPanel
        intersection={selectedIntersection}
        onClose={() => setSelectedIntersection(null)}
      />
    </div>
  )
}
