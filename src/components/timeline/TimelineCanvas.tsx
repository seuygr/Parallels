'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useCanvasStore } from '@/store/canvas'
import { computeAllIntersections } from '@/lib/intersection'
import { LifeEvent, Intersection, Person } from '@/types'

const LABEL_WIDTH = 180
const TRACK_HEIGHT = 90
const TRACK_TOP = 48
const RULER_HEIGHT = 40
const DOT_RADIUS = 5
const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  onEventClick: (event: LifeEvent) => void
  onIntersectionClick: (intersection: Intersection) => void
  onAddEvent?: (person: Person) => void
}

export default function TimelineCanvas({ onEventClick, onIntersectionClick, onAddEvent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1000)
  const { persons, events, visibleRange, zoom, pan } = useCanvasStore()
  const intersections = computeAllIntersections(persons)

  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartRange = useRef(visibleRange)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const canvasWidth = width - LABEL_WIDTH

  const yearToX = useCallback((year: number) => {
    const { start, end } = visibleRange
    return LABEL_WIDTH + ((year - start) / (end - start)) * canvasWidth
  }, [visibleRange, canvasWidth])

  const xToYear = useCallback((x: number) => {
    const { start, end } = visibleRange
    return start + ((x - LABEL_WIDTH) / canvasWidth) * (end - start)
  }, [visibleRange, canvasWidth])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left
    const centerYear = xToYear(mouseX)
    const factor = e.deltaY > 0 ? 1.15 : 0.87
    zoom(factor, centerYear)
  }, [xToYear, zoom])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartRange.current = visibleRange
  }, [visibleRange])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const deltaPx = e.clientX - dragStartX.current
    const { start, end } = dragStartRange.current
    const span = end - start
    const deltaYears = -(deltaPx / canvasWidth) * span
    pan(deltaYears)
  }, [canvasWidth, pan])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Year ticks
  const span = visibleRange.end - visibleRange.start
  const tickInterval = span > 200 ? 50 : span > 80 ? 20 : span > 30 ? 10 : 5
  const firstTick = Math.ceil(visibleRange.start / tickInterval) * tickInterval
  const ticks: number[] = []
  for (let y = firstTick; y <= visibleRange.end; y += tickInterval) ticks.push(y)

  const svgHeight = RULER_HEIGHT + TRACK_TOP + persons.length * TRACK_HEIGHT + 40

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none"
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg width="100%" height={svgHeight}>
        {/* Ruler background */}
        <rect x={0} y={0} width="100%" height={RULER_HEIGHT}
          fill="#12121A" />

        {/* Year ticks + labels */}
        {ticks.map((year) => {
          const x = yearToX(year)
          if (x < LABEL_WIDTH || x > width) return null
          return (
            <g key={year}>
              <line x1={x} y1={RULER_HEIGHT - 8} x2={x} y2={RULER_HEIGHT}
                stroke="#2A2A3A" strokeWidth={1} />
              <text x={x} y={RULER_HEIGHT - 12} textAnchor="middle"
                fill="#94A3B8" fontSize={11} fontFamily="Inter, sans-serif">
                {year}
              </text>
            </g>
          )
        })}

        {/* Intersection zones (behind tracks) */}
        {intersections.map((int) => {
          const idxA = persons.findIndex((p) => p.id === int.personA.id)
          const idxB = persons.findIndex((p) => p.id === int.personB.id)
          const x1 = yearToX(int.overlapStartYear)
          const x2 = yearToX(int.overlapEndYear)
          const y1 = RULER_HEIGHT + TRACK_TOP + idxA * TRACK_HEIGHT + 10
          const y2 = RULER_HEIGHT + TRACK_TOP + idxB * TRACK_HEIGHT + 30
          if (x2 < LABEL_WIDTH || x1 > width) return null
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          return (
            <g key={`${int.personA.id}-${int.personB.id}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onIntersectionClick(int)}>
              <rect
                x={Math.max(x1, LABEL_WIDTH)} y={y1}
                width={Math.min(x2, width) - Math.max(x1, LABEL_WIDTH)}
                height={y2 - y1}
                fill="#FCD34D" opacity={0.07} rx={6} />
              {/* Badge */}
              {midX > LABEL_WIDTH && midX < width && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect x={-24} y={-12} width={48} height={24}
                    fill="#FCD34D" rx={12} />
                  <text textAnchor="middle" dominantBaseline="middle"
                    fill="#0A0A0F" fontSize={11} fontWeight="600"
                    fontFamily="Inter, sans-serif">
                    {int.overlapYears}y
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Tracks */}
        {persons.map((person, i) => {
          const trackY = RULER_HEIGHT + TRACK_TOP + i * TRACK_HEIGHT
          const personEnd = person.diedYear ?? CURRENT_YEAR
          const barX1 = Math.max(yearToX(person.bornYear), LABEL_WIDTH)
          const barX2 = Math.min(yearToX(personEnd), width)
          const barWidth = Math.max(0, barX2 - barX1)
          const personEvents = events.filter((e) => e.personId === person.id)
          const isPersonal = person.type === 'personal'

          return (
            <g key={person.id}>
              {/* Person name label */}
              <text x={LABEL_WIDTH - 12} y={trackY + 22}
                textAnchor="end" fill="#F1F1F5" fontSize={13}
                fontFamily="Inter, sans-serif" fontWeight="500">
                {person.name}
              </text>
              <text x={LABEL_WIDTH - 12} y={trackY + 38}
                textAnchor="end" fill="#94A3B8" fontSize={11}
                fontFamily="Inter, sans-serif">
                {person.bornYear} – {person.diedYear ?? 'present'}
              </text>

              {/* + add event (personal tracks only) */}
              {isPersonal && onAddEvent && (
                <text
                  x={LABEL_WIDTH - 12} y={trackY + 54}
                  textAnchor="end" fill={person.color} fontSize={10}
                  fontFamily="Inter, sans-serif"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); onAddEvent(person) }}
                >
                  + add event
                </text>
              )}

              {/* Track background strip */}
              <rect x={LABEL_WIDTH} y={trackY + 16} width={canvasWidth}
                height={4} fill={person.color} opacity={0.08} rx={2} />

              {/* Life bar */}
              {barWidth > 0 && (
                <rect x={barX1} y={trackY + 16} width={barWidth}
                  height={4} fill={person.color} opacity={0.7} rx={2} />
              )}

              {/* Start / end caps */}
              {yearToX(person.bornYear) >= LABEL_WIDTH && (
                <circle cx={yearToX(person.bornYear)} cy={trackY + 18}
                  r={5} fill={person.color} />
              )}
              {yearToX(personEnd) <= width && (
                <circle cx={yearToX(personEnd)} cy={trackY + 18}
                  r={5} fill={person.color} opacity={0.5} />
              )}

              {/* Event dots */}
              {personEvents.map((event) => {
                const ex = yearToX(event.year)
                if (ex < LABEL_WIDTH || ex > width) return null
                return (
                  <g key={event.id} style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event) }}>
                    <circle cx={ex} cy={trackY + 18} r={DOT_RADIUS + 4}
                      fill="transparent" />
                    <circle cx={ex} cy={trackY + 18} r={DOT_RADIUS}
                      fill={person.color} stroke="#0A0A0F" strokeWidth={1.5} />
                    <title>{event.year} — {event.title}</title>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
