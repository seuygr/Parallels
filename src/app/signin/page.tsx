'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return }
      router.push('/canvas')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-2xl font-bold tracking-widest mb-8" style={{ color: '#F59E0B', letterSpacing: '0.2em' }}>
          PARALLELS
        </Link>

        <div className="rounded-xl p-8" style={{ background: '#16161F', border: '1px solid #2A2A3A' }}>
          <h1 className="text-lg font-semibold mb-6" style={{ color: '#F1F1F5' }}>Sign in</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: '#94A3B8' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', color: '#F1F1F5' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: '#94A3B8' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', color: '#F1F1F5' }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 rounded-lg text-sm font-medium mt-2 transition-opacity"
              style={{ background: '#F59E0B', color: '#0A0A0F', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: '#94A3B8' }}>
            No account?{' '}
            <Link href="/signup" className="hover:opacity-80" style={{ color: '#F59E0B' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
