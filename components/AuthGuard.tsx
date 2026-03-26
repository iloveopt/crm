'use client'

import { useState, useEffect } from 'react'

const PASSWORD_HASH = '0beb4c5bb056918ee6bb6fc6a71ec313195edf22f2a629d5da1c28c2649ce7d4'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('noa_dash_auth')
    setAuthed(stored === '1')
  }, [])

  if (authed === null) return null

  if (authed) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hash = await sha256(input)
    if (hash === PASSWORD_HASH) {
      localStorage.setItem('noa_dash_auth', '1')
      setAuthed(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Steve CRM</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>输入密码访问</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="密码"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
            style={{
              background: 'var(--card)',
              border: error ? '1px solid #ef4444' : '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          {error && <p className="text-red-400 text-sm text-center">密码错误</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity active:opacity-80"
            style={{ background: 'var(--primary)' }}
          >
            进入
          </button>
        </form>
      </div>
    </div>
  )
}
