'use client'

import { useState, useEffect, useRef } from 'react'
import { useCanvasStore } from '@/store/canvas'
import { Person, LifeEvent } from '@/types'

const COLORS = ['#F59E0B', '#60A5FA', '#A78BFA', '#34D399', '#F87171', '#FB923C', '#E879F9', '#2DD4BF']

interface Props {
  onClose: () => void
}

interface SearchResult {
  id: string
  name: string
  bornYear: number
  diedYear: number | null
  bornCity: string | null
  bornCountry: string | null
  type: string
  color: string
}

export default function AddPersonModal({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { persons, addPerson, addEvents } = useCanvasStore()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/persons/search?q=${encodeURIComponent(query)}`)
        setResults(await res.json())
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const alreadyAdded = (r: SearchResult) =>
    persons.some((p) => p.id === r.id || p.name.toLowerCase() === r.name.toLowerCase())

  const nextColor = () => {
    const used = new Set(persons.map((p) => p.color))
    return COLORS.find((c) => !used.has(c)) ?? COLORS[persons.length % COLORS.length]
  }

  const handleAdd = async (r: SearchResult) => {
    if (alreadyAdded(r)) return
    setAdding(r.id)
    try {
      const res = await fetch(`/api/persons/${r.id}/events`)
      const events: LifeEvent[] = await res.json()
      const person: Person = {
        id: r.id,
        name: r.name,
        bornYear: r.bornYear,
        diedYear: r.diedYear,
        bornCity: r.bornCity ?? '',
        bornCountry: r.bornCountry ?? '',
        type: r.type as 'famous' | 'personal',
        color: r.color || nextColor(),
      }
      addPerson(person)
      addEvents(events)
      onClose()
    } finally {
      setAdding(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        style={{ background: '#1C1C27', border: '1px solid #2A2A3A' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid #2A2A3A' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a person…"
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: '#F1F1F5' }}
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>Searching…</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>No results found.</div>
          )}
          {results.map((r) => {
            const added = alreadyAdded(r)
            const isAdding = adding === r.id
            return (
              <button
                key={r.id}
                onClick={() => handleAdd(r)}
                disabled={added || isAdding}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: 'transparent',
                  borderBottom: '1px solid #2A2A3A22',
                  opacity: added ? 0.4 : 1,
                  cursor: added ? 'default' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = '#2A2A3A' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color || '#94A3B8' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: '#F1F1F5' }}>{r.name}</div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>
                    {r.bornYear}–{r.diedYear ?? 'present'} · {r.bornCountry ?? ''}
                  </div>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>
                  {isAdding ? 'Adding…' : added ? 'Added' : '+ Add'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
