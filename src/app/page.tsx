'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useCanvasStore } from '@/store/canvas'
import { Person, LifeEvent } from '@/types'

const TRACK_BG = [
  { y: 62, color: '#F59E0B', opacity: 0.22, label: 'Winston Churchill  1874 – 1965' },
  { y: 72, color: '#60A5FA', opacity: 0.18, label: 'Michael Jackson  1958 – 2009' },
  { y: 82, color: '#34D399', opacity: 0.15, label: 'Grandmother  1928 –' },
  { y: 92, color: '#A78BFA', opacity: 0.12, label: '乾隆皇帝  1711 – 1799' },
]

const COLORS = ['#F59E0B', '#60A5FA', '#A78BFA', '#34D399']

interface LocalResult {
  source: 'local'
  id: string
  name: string
  bornYear: number
  diedYear: number | null
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

function PersonSearchInput({
  value,
  onChange,
  placeholder,
  color,
}: {
  value: SearchResult | null
  onChange: (r: SearchResult | null) => void
  placeholder: string
  color: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/persons/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const local: LocalResult[] = (data.local ?? []).map((p: Omit<LocalResult, 'source'>) => ({ ...p, source: 'local' as const }))
      const wikidata: WikidataResult[] = (data.wikidata ?? []).map((p: Omit<WikidataResult, 'source'>) => ({ ...p, source: 'wikidata' as const }))
      setResults([...local, ...wikidata])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (value) return
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, value, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (r: SearchResult) => {
    onChange(r)
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setResults([])
  }

  const displayName = value
    ? (value.source === 'local' ? value.name : value.name)
    : null

  return (
    <div ref={containerRef} className="relative w-72">
      <div
        className="flex items-center gap-2 px-4 rounded-xl"
        style={{ background: '#16161F', border: `1px solid ${value ? color + '66' : '#2A2A3A'}`, height: '52px' }}
      >
        {value && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />}
        {value ? (
          <>
            <span className="flex-1 text-sm truncate" style={{ color: '#F1F1F5' }}>{displayName}</span>
            <button onClick={handleClear} style={{ color: '#94A3B8', fontSize: '18px', lineHeight: 1 }}>×</button>
          </>
        ) : (
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#F1F1F5' }}
          />
        )}
      </div>

      {open && !value && (query.length >= 2) && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: '#1C1C27', border: '1px solid #2A2A3A', top: '100%' }}
        >
          {loading && (
            <div className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>No results found.</div>
          )}
          {results.map((r) => {
            const key = r.source === 'local' ? r.id : r.wikidataId
            return (
              <button
                key={key}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ borderBottom: '1px solid #2A2A3A22' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#2A2A3A' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.source === 'local' ? r.color : '#94A3B8' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: '#F1F1F5' }}>{r.name}</div>
                  <div className="text-xs truncate" style={{ color: '#94A3B8' }}>
                    {r.source === 'local'
                      ? `${r.bornYear}–${r.diedYear ?? 'present'} · ${r.bornCountry ?? ''}`
                      : r.description}
                  </div>
                </div>
                {r.source === 'wikidata' && (
                  <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: '#2A2A3A', color: '#94A3B8' }}>
                    Wikidata
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const store = useCanvasStore()
  const [person1, setPerson1] = useState<SearchResult | null>(null)
  const [person2, setPerson2] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importPerson = async (r: SearchResult, color: string): Promise<{ person: Person; events: LifeEvent[] } | null> => {
    if (r.source === 'local') {
      const res = await fetch(`/api/persons/${r.id}/events`)
      const events: LifeEvent[] = await res.json()
      return {
        person: { id: r.id, name: r.name, bornYear: r.bornYear, diedYear: r.diedYear, bornCity: '', bornCountry: r.bornCountry ?? '', type: r.type as 'famous' | 'personal', color: r.color || color },
        events,
      }
    } else {
      const res = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wikidataId: r.wikidataId, name: r.name, color }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to import')
      return {
        person: { id: data.id, name: data.name, bornYear: data.bornYear, diedYear: data.diedYear, bornCity: data.bornCity ?? '', bornCountry: data.bornCountry ?? '', type: data.type, color: data.color },
        events: data.events ?? [],
      }
    }
  }

  const handleExplore = async () => {
    if (!person1 || !person2) {
      router.push('/canvas')
      return
    }
    setLoading(true)
    setError(null)
    try {
      store.reset()
      const [a, b] = await Promise.all([
        importPerson(person1, COLORS[0]),
        importPerson(person2, COLORS[1]),
      ])
      if (a) { store.addPerson(a.person); store.addEvents(a.events) }
      if (b) { store.addPerson(b.person); store.addEvents(b.events) }
      store.setLoaded(true)
      store.fitToPersons()
      router.push('/canvas')
    } catch {
      setError('Could not load one of the people. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>

      {/* Background decorative tracks */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {TRACK_BG.map((t) => (
            <g key={t.label}>
              <line x1="0" y1={`${t.y}%`} x2="100%" y2={`${t.y}%`}
                stroke={t.color} strokeWidth="1" opacity={t.opacity} />
            </g>
          ))}
          <ellipse cx="56%" cy="67%" rx="8%" ry="12%" fill="#FCD34D" opacity="0.04" />
        </svg>
        <div className="absolute left-16" style={{ top: '58%' }}>
          {TRACK_BG.map((t) => (
            <p key={t.label} className="text-xs mb-3 tracking-wide"
              style={{ color: t.color, opacity: t.opacity + 0.25 }}>
              {t.label}
            </p>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-16 py-5"
        style={{ borderBottom: '1px solid #2A2A3A33' }}>
        <span className="text-base font-semibold tracking-[0.12em]" style={{ color: '#F1F1F5' }}>
          PARALLELS
        </span>
        <Link href="/signin"
          className="px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          style={{ color: '#94A3B8', border: '1px solid #2A2A3A' }}>
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6" style={{ paddingTop: '10vh' }}>
        <h1 className="font-semibold mb-6"
          style={{ fontSize: 'clamp(48px, 6vw, 80px)', color: '#F1F1F5', lineHeight: 1.1 }}>
          Did their lives<br />ever cross?
        </h1>

        <p className="mb-12 max-w-xl" style={{ fontSize: '18px', color: '#94A3B8', fontWeight: 300, lineHeight: 1.7 }}>
          Place any two lives side by side across time and space.<br />
          See where they overlapped — and where they almost met.
        </p>

        {/* Search row */}
        <div className="flex items-center gap-3 mb-4">
          <PersonSearchInput
            value={person1}
            onChange={setPerson1}
            placeholder="Person 1…"
            color={COLORS[0]}
          />
          <span style={{ color: '#94A3B8', fontSize: '22px', fontWeight: 300 }}>+</span>
          <PersonSearchInput
            value={person2}
            onChange={setPerson2}
            placeholder="Person 2…"
            color={COLORS[1]}
          />
          <button
            onClick={handleExplore}
            disabled={loading}
            className="flex items-center justify-center rounded-xl text-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: '#F59E0B', color: '#0A0A0F', width: '52px', height: '52px', flexShrink: 0 }}
          >
            {loading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            ) : '→'}
          </button>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: '#F87171' }}>{error}</p>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mt-2">
          <button onClick={() => router.push('/canvas')}
            className="px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
            style={{ border: '1px solid #2A2A3A', color: '#94A3B8' }}>
            Explore famous lives
          </button>
          <Link href="/signup"
            className="px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}>
            Add your family
          </Link>
        </div>
      </main>
    </div>
  )
}
