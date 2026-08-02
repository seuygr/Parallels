'use client'

import { LifeEvent, Person, Language } from '@/types'
import { tr } from '@/lib/i18n'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface StoryCardProps {
  event: LifeEvent | null
  person: Person | null
  contemporaries?: Person[]
  allEvents?: LifeEvent[]
  language?: Language
  onClose: () => void
}

interface ContemporaryStatus {
  person: Person
  kind: 'exact' | 'approx' | 'none' | 'notYetBorn' | 'alreadyPassed'
  title?: string
  titleZh?: string | null
  deltaYears?: number
  direction?: 'earlier' | 'later'
}

function findContemporaryStatus(target: Person, year: number, events: LifeEvent[]): ContemporaryStatus {
  if (year < target.bornYear) return { person: target, kind: 'notYetBorn' }
  if (target.diedYear != null && year > target.diedYear) return { person: target, kind: 'alreadyPassed' }

  const personEvents = events.filter((e) => e.personId === target.id)
  if (personEvents.length === 0) return { person: target, kind: 'none' }

  let nearest = personEvents[0]
  for (const e of personEvents) {
    if (Math.abs(e.year - year) < Math.abs(nearest.year - year)) nearest = e
  }

  if (nearest.year === year) {
    return { person: target, kind: 'exact', title: nearest.title, titleZh: nearest.titleZh }
  }
  return {
    person: target,
    kind: 'approx',
    title: nearest.title,
    titleZh: nearest.titleZh,
    deltaYears: Math.abs(nearest.year - year),
    direction: nearest.year < year ? 'earlier' : 'later',
  }
}

export default function StoryCard({ event, person, contemporaries = [], allEvents = [], language = 'en', onClose }: StoryCardProps) {
  if (!event || !person) return null

  const zh = language === 'zh'
  const t = tr(language)
  const title = (zh && event.titleZh) ? event.titleZh : event.title
  const description = (zh && event.descriptionZh) ? event.descriptionZh : event.description
  const location = (zh && event.locationNameZh) ? event.locationNameZh : event.locationName
  const city = location ? location.split(',')[0].toUpperCase() : null

  const others = contemporaries.filter((p) => p.id !== person.id)
  const statuses = others.map((p) => findContemporaryStatus(p, event.year, allEvents))

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
            {location ? (
              <span className="text-sm" style={{ color: '#94A3B8' }}>
                📍 {location}
              </span>
            ) : null}
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              📅 {event.year}{event.month ? `, month ${event.month}` : ''}
            </span>
          </div>

          {/* Photo placeholder */}
          <div
            className="w-full rounded-xl mb-5 flex items-center justify-center"
            style={{ height: '140px', background: '#2A2A3A' }}
          >
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>{t.noPhoto}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base mb-2" style={{ color: '#F1F1F5' }}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
              {description}
            </p>
          )}

          {/* Also in section */}
          {city && (
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2A2A3A' }}>
              <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                {city ? t.alsoIn(city, event.year) : ''}
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{ background: '#2A2A3A', color: '#F1F1F5' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: person.color }} />
                {t.geoV2}
              </div>
            </div>
          )}

          {/* Meanwhile: what other canvas persons were doing at this same year */}
          {statuses.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2A2A3A' }}>
              <p className="text-xs font-semibold tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                {t.meanwhile}
              </p>
              <div className="flex flex-col gap-2.5">
                {statuses.map((s) => {
                  const name = (zh && s.person.nameZh) ? s.person.nameZh : s.person.name
                  const eventTitle = (zh && s.titleZh) ? s.titleZh : s.title

                  let line: string
                  if (s.kind === 'notYetBorn') line = t.notYetBorn(name)
                  else if (s.kind === 'alreadyPassed') line = t.alreadyPassed(name)
                  else if (s.kind === 'none') line = t.noNearbyRecord(name)
                  else if (s.kind === 'exact') line = eventTitle!
                  else line = `${eventTitle} ${t.approxNote(s.deltaYears!, s.direction!)}`

                  return (
                    <div key={s.person.id} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: s.person.color }} />
                      <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                        <span style={{ color: '#F1F1F5' }}>{name}</span> — {line}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
