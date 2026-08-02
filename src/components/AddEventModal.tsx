'use client'

import { useState } from 'react'
import { useCanvasStore } from '@/store/canvas'
import { Person } from '@/types'
import { tr } from '@/lib/i18n'

interface Props {
  person: Person
  onClose: () => void
}

export default function AddEventModal({ person, onClose }: Props) {
  const { addEvents, language } = useCanvasStore()
  const t = tr(language)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!year || !title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/persons/${person.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          title: title.trim(),
          locationName: location.trim() || null,
          description: description.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save event')
      addEvents([{
        id: data.id,
        personId: data.personId,
        year: data.year,
        month: data.month,
        title: data.title,
        description: data.description ?? '',
        locationName: data.locationName ?? '',
      }])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
        style={{ background: '#1C1C27', border: '1px solid #2A2A3A' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2A2A3A' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: person.color }} />
            <span className="text-sm font-medium" style={{ color: '#F1F1F5' }}>
              {t.addEventTitle((language === 'zh' && person.nameZh) ? person.nameZh! : person.name)}
            </span>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8', fontSize: '18px' }}>×</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.yearLabel}</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder={t.yearPlaceholder}
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
              />
            </div>
            <div style={{ width: '80px' }}>
              <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.monthLabel}</label>
              <input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="1–12"
                type="number"
                min={1}
                max={12}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.whatHappenedLabel}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.whatHappenedPlaceholder}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.locationLabel}</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.storyLabel}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.storyPlaceholder}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: '#2A2A3A', color: '#F1F1F5', border: '1px solid #3A3A4A' }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !year || !title.trim()}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: person.color, color: '#0A0A0F' }}
          >
            {saving ? t.saving : t.saveEvent}
          </button>
        </div>
      </div>
    </div>
  )
}
