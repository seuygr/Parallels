'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCanvasStore } from '@/store/canvas'
import TimelineCanvas from '@/components/timeline/TimelineCanvas'
import StoryCard from '@/components/StoryCard'
import IntersectionPanel from '@/components/IntersectionPanel'
import AddPersonModal from '@/components/AddPersonModal'
import AddEventModal from '@/components/AddEventModal'
import { LifeEvent, Intersection, Person } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { tr } from '@/lib/i18n'

export default function CanvasPage() {
  const router = useRouter()
  const { persons, events, visibleRange, setVisibleRange, loadCanvas, removePerson, language, setLanguage } = useCanvasStore()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const t = tr(language)

  useEffect(() => { loadCanvas() }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserEmail(null)
    router.refresh()
  }

  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [addEventPerson, setAddEventPerson] = useState<Person | null>(null)

  const selectedPerson = selectedEvent
    ? persons.find((p) => p.id === selectedEvent.personId) ?? null
    : null

  const MAX_SPAN = 5100
  const MIN_SPAN = 20
  const span = visibleRange.end - visibleRange.start
  const sliderValue = Math.max(0, Math.min(100, ((MAX_SPAN - span) / (MAX_SPAN - MIN_SPAN)) * 100))

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const newSpan = MAX_SPAN - (v / 100) * (MAX_SPAN - MIN_SPAN)
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
            {t.back}
          </button>
          <button
            onClick={() => setShowAddPerson(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: '#2A2A3A', color: '#F1F1F5' }}>
            {t.addPerson}
          </button>
        </div>

        {/* Timeline / Map toggle */}
        <div className="flex items-center rounded-lg p-0.5" style={{ background: '#2A2A3A' }}>
          <button className="px-4 py-1.5 rounded-md text-xs font-medium"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}>
            {t.timeline}
          </button>
          <button className="px-4 py-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
            {t.map}
          </button>
        </div>

        {/* Language toggle */}
        <div className="flex items-center rounded-lg p-0.5" style={{ background: '#2A2A3A' }}>
          {(['en', 'zh'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: language === lang ? '#F59E0B' : 'transparent',
                color: language === lang ? '#0A0A0F' : '#94A3B8',
              }}>
              {lang === 'en' ? 'EN' : '中文'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#2A2A3A', color: '#F1F1F5' }}>
                {t.signOut}
              </button>
            </>
          ) : (
            <Link href="/signin" className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#2A2A3A', color: '#F1F1F5' }}>
              {t.signIn}
            </Link>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #2A2A3A22' }}>
        {persons.map((p) => (
          <div key={p.id} className="flex items-center gap-2 group">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              {(language === 'zh' && p.nameZh) ? p.nameZh : p.name}
            </span>
            <button
              onClick={() => removePerson(p.id)}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#64748B' }}
              title="Remove from canvas"
            >
              ×
            </button>
          </div>
        ))}
        <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>{t.scrollHint}</span>
      </div>

      {/* Timeline canvas */}
      <div className="flex-1 overflow-hidden relative">
        {persons.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-sm" style={{ color: '#94A3B8' }}>{t.emptyCanvas}</p>
            <button
              onClick={() => setShowAddPerson(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: '#F59E0B', color: '#0A0A0F' }}>
              {t.addPerson}
            </button>
          </div>
        ) : (
          <TimelineCanvas
            onEventClick={setSelectedEvent}
            onIntersectionClick={setSelectedIntersection}
            onAddEvent={setAddEventPerson}
            language={language}
          />
        )}
      </div>

      {/* Zoom slider */}
      <div className="flex items-center justify-center gap-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid #2A2A3A22' }}>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          {Math.round(visibleRange.start)} – {Math.round(visibleRange.end)}
        </span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>{t.zoom}</span>
        <input
          type="range" min={0} max={100} value={sliderValue}
          onChange={handleSliderChange}
          className="w-48"
          style={{ accentColor: '#F59E0B' }}
        />
      </div>

      {/* Modals */}
      {showAddPerson && <AddPersonModal onClose={() => setShowAddPerson(false)} />}
      {addEventPerson && (
        <AddEventModal person={addEventPerson} onClose={() => setAddEventPerson(null)} />
      )}
      <StoryCard
        event={selectedEvent}
        person={selectedPerson}
        contemporaries={persons}
        allEvents={events}
        language={language}
        onClose={() => setSelectedEvent(null)}
      />
      <IntersectionPanel
        intersection={selectedIntersection}
        language={language}
        onClose={() => setSelectedIntersection(null)}
      />
    </div>
  )
}
