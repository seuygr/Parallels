'use client'

import { Intersection } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface IntersectionPanelProps {
  intersection: Intersection | null
  onClose: () => void
}

const WORLD_EVENTS: Record<string, { year: number; label: string }[]> = {
  'churchill-mj': [
    { year: 1962, label: 'Cuban Missile Crisis' },
    { year: 1963, label: 'JFK Assassination' },
    { year: 1964, label: 'Civil Rights Act (USA)' },
    { year: 1965, label: 'Churchill passes away' },
  ],
}

function getWorldEvents(intersection: Intersection) {
  const key = `${intersection.personA.id}-${intersection.personB.id}`
  return WORLD_EVENTS[key] ?? []
}

export default function IntersectionPanel({ intersection, onClose }: IntersectionPanelProps) {
  if (!intersection) return null

  const worldEvents = getWorldEvents(intersection)
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
          {/* Divider */}
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
          {worldEvents.length > 0 && (
            <div className="mb-6" style={{ borderTop: '1px solid #2A2A3A', paddingTop: '16px' }}>
              <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                DURING THIS TIME
              </p>
              {worldEvents.map((e) => (
                <p key={e.year} className="text-sm mb-1.5" style={{ color: '#F1F1F5' }}>
                  · {e.year} — {e.label}
                </p>
              ))}
            </div>
          )}

          {/* Share button */}
          <button
            className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}
          >
            Share this moment
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
