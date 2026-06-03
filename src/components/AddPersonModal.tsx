'use client'

import { useState, useEffect, useRef } from 'react'
import { useCanvasStore } from '@/store/canvas'
import { Person, LifeEvent } from '@/types'

const COLORS = ['#F59E0B', '#60A5FA', '#A78BFA', '#34D399', '#F87171', '#FB923C', '#E879F9', '#2DD4BF']

interface Props {
  onClose: () => void
}

interface LocalResult {
  source: 'local'
  id: string
  name: string
  bornYear: number
  diedYear: number | null
  bornCity: string | null
  bornCountry: string | null
  type: string
  color: string
}

interface WikidataResult {
  source: 'wikidata'
  wikidataId: string
  name: string
  description: string
}

type SearchResult = LocalResult | WikidataResult

export default function AddPersonModal({ onClose }: Props) {
  const [tab, setTab] = useState<'search' | 'create'>('search')

  // Search tab state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  // Create tab state
  const [createName, setCreateName] = useState('')
  const [createBornYear, setCreateBornYear] = useState('')
  const [createDiedYear, setCreateDiedYear] = useState('')
  const [createBornCity, setCreateBornCity] = useState('')
  const [stillAlive, setStillAlive] = useState(true)
  const [creating, setCreating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const { persons, addPerson, addEvents } = useCanvasStore()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (tab !== 'search' || query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/persons/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        const local: LocalResult[] = (data.local ?? []).map((p: Omit<LocalResult, 'source'>) => ({ ...p, source: 'local' as const }))
        const wikidata: WikidataResult[] = (data.wikidata ?? []).map((p: Omit<WikidataResult, 'source'>) => ({ ...p, source: 'wikidata' as const }))
        setResults([...local, ...wikidata])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query, tab])

  const nextColor = () => {
    const used = new Set(persons.map((p) => p.color))
    return COLORS.find((c) => !used.has(c)) ?? COLORS[persons.length % COLORS.length]
  }

  const isAdded = (r: SearchResult) => {
    if (r.source === 'local') return persons.some((p) => p.id === r.id)
    return persons.some((p) => p.name.toLowerCase() === r.name.toLowerCase())
  }

  const handleAdd = async (r: SearchResult) => {
    if (isAdded(r)) return
    const key = r.source === 'local' ? r.id : r.wikidataId
    setAdding(key)
    const color = nextColor()

    try {
      if (r.source === 'local') {
        const res = await fetch(`/api/persons/${r.id}/events`)
        const events: LifeEvent[] = await res.json()
        addPerson({ id: r.id, name: r.name, bornYear: r.bornYear, diedYear: r.diedYear, bornCity: r.bornCity ?? '', bornCountry: r.bornCountry ?? '', type: r.type as 'famous' | 'personal', color: r.color || color })
        addEvents(events)
      } else {
        const res = await fetch('/api/persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wikidataId: r.wikidataId, name: r.name, color }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to add person')
        const person: Person = {
          id: data.id,
          name: data.name,
          bornYear: data.bornYear,
          diedYear: data.diedYear,
          bornCity: data.bornCity ?? '',
          bornCountry: data.bornCountry ?? '',
          type: data.type,
          color: data.color,
        }
        addPerson(person)
        addEvents(data.events ?? [])
      }
      onClose()
    } catch (err) {
      console.error('Failed to add person:', err)
    } finally {
      setAdding(null)
    }
  }

  const handleCreate = async () => {
    if (!createName.trim() || !createBornYear) return
    setCreating(true)
    const color = nextColor()
    try {
      const res = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'personal',
          name: createName.trim(),
          bornYear: parseInt(createBornYear),
          diedYear: !stillAlive && createDiedYear ? parseInt(createDiedYear) : null,
          bornCity: createBornCity.trim() || null,
          color,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create profile')
      addPerson({
        id: data.id,
        name: data.name,
        bornYear: data.bornYear,
        diedYear: data.diedYear,
        bornCity: data.bornCity ?? '',
        bornCountry: '',
        type: 'personal',
        color: data.color,
      })
      addEvents(data.events ?? [])
      onClose()
    } catch (err) {
      console.error('Failed to create profile:', err)
    } finally {
      setCreating(false)
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
        {/* Tab header */}
        <div className="flex" style={{ borderBottom: '1px solid #2A2A3A' }}>
          {(['search', 'create'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-xs font-medium transition-colors"
              style={{
                color: tab === t ? '#F1F1F5' : '#94A3B8',
                borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {t === 'search' ? '🔍 Search' : '+ Create profile'}
            </button>
          ))}
        </div>

        {/* Search tab */}
        {tab === 'search' && (
          <>
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
              {!loading && query.length < 2 && (
                <div className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>Type at least 2 characters to search.</div>
              )}
              {results.map((r) => {
                const key = r.source === 'local' ? r.id : r.wikidataId
                const added = isAdded(r)
                const isAdding = adding === key
                return (
                  <button
                    key={key}
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
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.source === 'local' ? r.color : '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm truncate" style={{ color: '#F1F1F5' }}>{r.name}</span>
                        {r.source === 'wikidata' && (
                          <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: '#2A2A3A', color: '#94A3B8' }}>
                            Wikidata
                          </span>
                        )}
                      </div>
                      <div className="text-xs truncate" style={{ color: '#94A3B8' }}>
                        {r.source === 'local'
                          ? `${r.bornYear}–${r.diedYear ?? 'present'} · ${r.bornCountry ?? ''}`
                          : r.description}
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>
                      {isAdding ? 'Adding…' : added ? 'Added' : '+ Add'}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Create tab */}
        {tab === 'create' && (
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>Name *</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Grandmother Wei"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>Born *</label>
                <input
                  value={createBornYear}
                  onChange={(e) => setCreateBornYear(e.target.value)}
                  placeholder="e.g. 1928"
                  type="number"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>Birthplace</label>
                <input
                  value={createBornCity}
                  onChange={(e) => setCreateBornCity(e.target.value)}
                  placeholder="e.g. Shanghai"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: '#94A3B8' }}>Still alive?</label>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setStillAlive(v)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: stillAlive === v ? '#F59E0B22' : '#2A2A3A',
                      color: stillAlive === v ? '#F59E0B' : '#94A3B8',
                      border: `1px solid ${stillAlive === v ? '#F59E0B44' : '#3A3A4A'}`,
                    }}
                  >
                    {v ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>

            {!stillAlive && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>Passed away</label>
                <input
                  value={createDiedYear}
                  onChange={(e) => setCreateDiedYear(e.target.value)}
                  placeholder="e.g. 2005"
                  type="number"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
                />
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={creating || !createName.trim() || !createBornYear}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#F59E0B', color: '#0A0A0F' }}
            >
              {creating ? 'Creating…' : 'Add to canvas →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
