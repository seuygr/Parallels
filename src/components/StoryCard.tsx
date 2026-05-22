'use client'

import { LifeEvent, Person } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface StoryCardProps {
  event: LifeEvent | null
  person: Person | null
  onClose: () => void
}

export default function StoryCard({ event, person, onClose }: StoryCardProps) {
  if (!event || !person) return null

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden max-w-sm border-0"
        style={{ background: '#16161F', borderRadius: '16px' }}
      >
        {/* Top color band */}
        <div className="h-1 w-full" style={{ background: person.color }} />

        <div className="p-6">
          {/* Location + date */}
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              📍 {event.locationName}
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              📅 {event.year}{event.month ? `, month ${event.month}` : ''}
            </span>
          </div>

          {/* Photo placeholder */}
          <div
            className="w-full rounded-xl mb-5 flex items-center justify-center"
            style={{ height: '140px', background: '#2A2A3A' }}
          >
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>No photo</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base mb-2" style={{ color: '#F1F1F5' }}>
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
            {event.description}
          </p>

          {/* Also in section */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2A2A3A' }}>
            <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: '#94A3B8' }}>
              ALSO IN {event.locationName.split(',')[0].toUpperCase()} · {event.year}
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: '#2A2A3A', color: '#F1F1F5' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: person.color }}
              />
              Historical context available in v2
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
