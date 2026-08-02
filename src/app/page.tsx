'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRACK_BG = [
  { y: 62, color: '#F59E0B', opacity: 0.22, label: 'Winston Churchill  1874 – 1965' },
  { y: 72, color: '#60A5FA', opacity: 0.18, label: 'Michael Jackson  1958 – 2009' },
  { y: 82, color: '#34D399', opacity: 0.15, label: 'Grandmother  1928 –' },
  { y: 92, color: '#A78BFA', opacity: 0.12, label: '乾隆皇帝  1711 – 1799' },
]

export default function LandingPage() {
  const router = useRouter()

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

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/canvas')}
            className="px-8 py-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}>
            Explore
          </button>
          <Link href="/signup"
            className="px-8 py-4 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
            style={{ border: '1px solid #2A2A3A', color: '#94A3B8' }}>
            Add your family
          </Link>
        </div>
      </main>
    </div>
  )
}
