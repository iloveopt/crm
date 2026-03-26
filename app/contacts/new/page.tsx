'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ContactForm from '@/components/ContactForm'

export default function NewContactPage() {
  return (
    <AuthGuard>
      <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" className="p-1 -ml-1 rounded-lg active:opacity-60" style={{ color: 'var(--muted)' }}>
            ← 返回
          </Link>
          <h1 className="font-semibold text-lg">添加联系人</h1>
        </div>
        <ContactForm />
      </div>
    </AuthGuard>
  )
}
