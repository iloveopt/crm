'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ContactForm from '@/components/ContactForm'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/types'

export default function EditContactPage() {
  const { id } = useParams<{ id: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('contacts').select('*').eq('id', id).single().then(({ data }) => {
      setContact(data as unknown as Contact)
      setLoading(false)
    })
  }, [id])

  return (
    <AuthGuard>
      <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <Link href={`/contacts/${id}`} className="p-1 -ml-1 rounded-lg active:opacity-60" style={{ color: 'var(--muted)' }}>
            ← 返回
          </Link>
          <h1 className="font-semibold text-lg">编辑联系人</h1>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: 'var(--muted)' }}>加载中...</div>
        ) : contact ? (
          <ContactForm initial={contact} contactId={id} />
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>联系人不存在</div>
        )}
      </div>
    </AuthGuard>
  )
}
