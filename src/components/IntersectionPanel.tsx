'use client'

import { useEffect, useState } from 'react'
import { Intersection } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface WorldEvent {
  year: number
  label: string
}

interface IntersectionPanelProps {
  intersection: Intersection | null
  onClose: () => void
}

export default function IntersectionPanel({ intersection, onClose }: IntersectionPanelProps) {
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!intersection) { setWorldEvents([]); return }
    setEventsLoading(true)
    const { overlapStartYear, overlapEndYear } = intersection
    fetch(`/api/events/world?start=${overlapStartYear}&end=${overlapEndYear}`)
      .then((r) => r.json())
      .then((data: WorldEvent[]) => setWorldEvents(Array.isArray(data) ? data : []))
      .catch(() => setWorldEvents([]))
      .finally(() => setEventsLoading(false))
  }, [intersection?.personA.id, intersection?.personB.id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select and copy manually
    }
  }

  if (!intersection) return null

  const { personA, personB, overlapStartYear, overlapEndYear, overlapYears } = intersection

  return (
    <Dialog open={!!intersection} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden max-w-md border-0"
        style={{ background: '#16161F', borderRadius: '16px' }}
      >
        {/* Top gradient */}
        <div
          className="h-16 w-full flex items-end px-6 pb-3"
          style={{
            background: `linear-gradient(to bottom, ${personA.color}22, transparent)`,
          }}
        >
          <h2 className="font-semibold text-lg" style={{ color: '#F1F1F5' }}>
            {personA.name} × {personB.name}
          </h2>
        </div>

        <div className="px-6 pb-6">
          <div className="mb-5" style={{ borderTop: '1px solid #2A2A3A' }} />

          {/* Overlap highlight */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ border: '2px solid #FCD34D' }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#FCD34D' }} />
            </div>
            <span className="font-semibold text-4xl mb-1" style={{ color: '#FCD34D' }}>
              {overlapYears} years
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              {overlapStartYear} – {overlapEndYear}
            </span>
          </div>

          {/* Age context */}
          <div className="mb-5" style={{ borderTop: '1px solid #2A2A3A', paddingTop: '16px' }}>
            <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>
              {personA.name} was {overlapStartYear - personA.bornYear}–{overlapEndYear - personA.bornYear} years old.
            </p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {personB.name} was {overlapStartYear - personB.bornYear}–{overlapEndYear - personB.bornYear} years old.
            </p>
          </div>

          {/* Geographic overlap */}
          <div className="mb-5" style={{ borderTop: '1px solid #2A2A3A', paddingTop: '16px' }}>
            <p className="text-xs font-semibold tracking-wider mb-2" style={{ color: '#94A3B8' }}>
              GEOGRAPHIC OVERLAP
            </p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              No shared city found in this period.
            </p>
          </div>

          {/* World events */}
          <div className="mb-6" style={{ borderTop: '1px solid #2A2A3A', paddingTop: '16px' }}>
            <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: '#94A3B8' }}>
              DURING THIS TIME
            </p>
            {eventsLoading && (
              <p className="text-sm" style={{ color: '#64748B' }}>Loading events…</p>
            )}
            {!eventsLoading && worldEvents.length === 0 && (
              <p className="text-sm" style={{ color: '#64748B' }}>No notable events found.</p>
            )}
            {!eventsLoading && worldEvents.map((e, idx) => (
              <p key={idx} className="text-sm mb-1.5" style={{ color: '#F1F1F5' }}>
                · {e.year} — {e.label}
              </p>
            ))}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}
          >
            {copied ? '✓ Link copied!' : 'Share this moment'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
