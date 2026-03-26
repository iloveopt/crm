'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import ContactCard from '@/components/ContactCard'
import { supabase } from '@/lib/supabase'
import type { Contact, Project } from '@/lib/types'

const ALL_PROJECTS: Project[] = ['Sitesfy', 'AIYOU', 'ARTI', 'BotEarn', '通用']

export default function HomePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('contacts')
      .select('*')
      .order('next_followup', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setContacts((data as Contact[]) || [])
        setLoading(false)
      })
  }, [])

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      (c.nickname || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      (c.intro || '').toLowerCase().includes(q)
    const matchProject = !projectFilter || (c.projects || []).includes(projectFilter)
    return matchSearch && matchProject
  })

  return (
    <AuthGuard>
      <div className="min-h-dvh pb-24" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Steve CRM</h1>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{filtered.length} 人</span>
          </div>
          <input
            type="search"
            placeholder="搜索姓名、公司、备注..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          {/* Project filters */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setProjectFilter(null)}
              className="shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={{
                background: !projectFilter ? 'var(--primary)' : 'var(--card)',
                color: !projectFilter ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              全部
            </button>
            {ALL_PROJECTS.map(p => (
              <button
                key={p}
                onClick={() => setProjectFilter(projectFilter === p ? null : p)}
                className="shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: projectFilter === p ? 'var(--primary)' : 'var(--card)',
                  color: projectFilter === p ? 'white' : 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Contact List */}
        <div className="px-4 pt-4 space-y-3">
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              {search || projectFilter ? '没有匹配的联系人' : '还没有联系人，点击右下角添加'}
            </div>
          ) : (
            filtered.map(c => <ContactCard key={c.id} contact={c} />)
          )}
        </div>

        {/* FAB */}
        <Link href="/contacts/new">
          <button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center active:scale-90 transition-transform z-20"
            style={{ background: 'var(--primary)' }}
          >
            +
          </button>
        </Link>
      </div>
    </AuthGuard>
  )
}
