'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import type { Contact, Interaction, Reminder } from '@/lib/types'

function isOverdue(date?: string): boolean {
  if (!date) return false
  return new Date(date) < new Date(new Date().toDateString())
}

function addDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')
  const [savingReminder, setSavingReminder] = useState(false)
  const [editFollowup, setEditFollowup] = useState(false)
  const [followupDate, setFollowupDate] = useState('')
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: i }, { data: r }] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', id).single(),
        supabase.from('interactions').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('contact_id', id).order('remind_at', { ascending: true }),
      ])
      setContact(c as unknown as Contact)
      setInteractions((i as unknown as Interaction[]) || [])
      setReminders((r as unknown as Reminder[]) || [])
      setFollowupDate((c as unknown as Contact)?.next_followup || '')
      setLoading(false)
    }
    load()
  }, [id])

  async function addInteraction() {
    if (!newNote.trim()) return
    setSavingNote(true)
    const { data } = await supabase
      .from('interactions')
      .insert({ contact_id: id, content: newNote.trim() })
      .select()
      .single()
    if (data) setInteractions(prev => [data as Interaction, ...prev])
    setNewNote('')
    setSavingNote(false)
  }

  async function saveFollowup(date: string) {
    await supabase.from('contacts').update({ next_followup: date || null }).eq('id', id)
    setContact(c => c ? { ...c, next_followup: date || undefined } : c)
    setEditFollowup(false)
  }

  async function createReminder() {
    if (!reminderDate) return
    setSavingReminder(true)
    // Save to DB
    const { data } = await supabase
      .from('reminders')
      .insert({ contact_id: id, remind_at: new Date(reminderDate).toISOString(), note: reminderNote || null })
      .select()
      .single()
    if (data) setReminders(prev => [...prev, data as Reminder])
    // Send Telegram notification
    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contact?.name,
          remindAt: reminderDate,
          note: reminderNote,
        }),
      })
    } catch {}
    setShowReminderModal(false)
    setReminderDate('')
    setReminderNote('')
    setSavingReminder(false)
  }

  async function deleteContact() {
    if (!confirm(`确定删除 ${contact?.name}？此操作不可撤销。`)) return
    await supabase.from('contacts').delete().eq('id', id)
    router.push('/')
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--bg)' }}>
          <div style={{ color: 'var(--muted)' }}>加载中...</div>
        </div>
      </AuthGuard>
    )
  }

  if (!contact) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center min-h-dvh gap-4" style={{ background: 'var(--bg)' }}>
          <p style={{ color: 'var(--muted)' }}>联系人不存在</p>
          <Link href="/" style={{ color: 'var(--primary)' }}>返回首页</Link>
        </div>
      </AuthGuard>
    )
  }

  const overdue = isOverdue(contact.next_followup)

  return (
    <AuthGuard>
      <div className="min-h-dvh pb-24" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" className="p-1 -ml-1 rounded-lg active:opacity-60" style={{ color: 'var(--muted)' }}>
            ← 返回
          </Link>
          <div className="flex gap-3">
            <Link href={`/contacts/${id}/edit`} style={{ color: 'var(--primary)' }} className="font-medium">
              编辑
            </Link>
            <button onClick={deleteContact} className="text-red-400 font-medium">删除</button>
          </div>
        </div>

        {/* Profile */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ background: 'var(--primary)22', color: 'var(--primary)' }}
            >
              {contact.avatar_url ? (
                <img src={contact.avatar_url} alt={contact.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                contact.name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {contact.name}
                {contact.nickname && <span className="text-base font-normal ml-2" style={{ color: 'var(--muted)' }}>({contact.nickname})</span>}
              </h1>
              {(contact.role || contact.company) && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                  {[contact.role, contact.company].filter(Boolean).join(' @ ')}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {contact.contact_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                    {contact.contact_type}
                  </span>
                )}
                {contact.status && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: contact.status === '活跃' ? '#22c55e22' : '#6b728022',
                      color: contact.status === '活跃' ? '#22c55e' : 'var(--muted)',
                    }}
                  >
                    {contact.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          {contact.projects && contact.projects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {contact.projects.map(p => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--primary)22', color: 'var(--primary)' }}>
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-4 rounded-2xl p-4 space-y-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {contact.wechat && (
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--muted)' }} className="text-sm w-14 shrink-0">微信</span>
                <span className="text-sm">{contact.wechat}</span>
              </div>
            )}
            {contact.telegram && (
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--muted)' }} className="text-sm w-14 shrink-0">TG</span>
                <span className="text-sm">{contact.telegram}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--muted)' }} className="text-sm w-14 shrink-0">Email</span>
                <a href={`mailto:${contact.email}`} className="text-sm" style={{ color: 'var(--primary)' }}>{contact.email}</a>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--muted)' }} className="text-sm w-14 shrink-0">地点</span>
                <span className="text-sm">{contact.location}</span>
              </div>
            )}
            {contact.source && (
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--muted)' }} className="text-sm w-14 shrink-0">来源</span>
                <span className="text-sm">{contact.source}</span>
              </div>
            )}
          </div>

          {contact.intro && (
            <div className="mt-3 rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{contact.intro}</p>
            </div>
          )}
        </div>

        {/* Follow-up */}
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">跟进提醒</h2>
              <button
                onClick={() => setShowReminderModal(true)}
                className="text-sm px-3 py-1 rounded-full"
                style={{ background: 'var(--primary)22', color: 'var(--primary)' }}
              >
                + 设置
              </button>
            </div>
            <div className="mt-2">
              {editFollowup ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={followupDate}
                    onChange={e => setFollowupDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
                    autoFocus
                  />
                  <button onClick={() => saveFollowup(followupDate)} className="px-3 py-2 rounded-xl text-sm text-white" style={{ background: 'var(--primary)' }}>
                    保存
                  </button>
                  <button onClick={() => setEditFollowup(false)} className="px-3 py-2 rounded-xl text-sm" style={{ color: 'var(--muted)' }}>
                    取消
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditFollowup(true)} className="w-full text-left mt-1">
                  {contact.next_followup ? (
                    <span className={`text-sm font-medium ${overdue ? 'text-red-400' : ''}`} style={!overdue ? { color: 'var(--primary)' } : undefined}>
                      {overdue ? '⚠️ ' : '📅 '}{contact.next_followup}{overdue ? ' (已过期)' : ''}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>点击设置跟进日期</span>
                  )}
                </button>
              )}
            </div>
            {/* Quick day buttons */}
            <div className="flex gap-2 mt-3">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => saveFollowup(addDays(d))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors active:opacity-70"
                  style={{ background: 'var(--border)', color: 'var(--muted)' }}
                >
                  {d}天后
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Interaction */}
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-3">记录互动</h2>
            <textarea
              ref={noteInputRef}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="记录一次交流、会议或想法..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl outline-none text-sm"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addInteraction() }}
            />
            <button
              onClick={addInteraction}
              disabled={savingNote || !newNote.trim()}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: 'var(--primary)' }}
            >
              {savingNote ? '保存中...' : '添加记录'}
            </button>
          </div>
        </div>

        {/* Interactions */}
        {interactions.length > 0 && (
          <div className="px-4 mb-4">
            <h2 className="font-semibold mb-3 px-1">互动记录 ({interactions.length})</h2>
            <div className="space-y-2">
              {interactions.map(i => (
                <div key={i.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm whitespace-pre-wrap">{i.content}</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                    {new Date(i.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Reminders */}
        {reminders.length > 0 && (
          <div className="px-4 mb-4">
            <h2 className="font-semibold mb-3 px-1">提醒</h2>
            <div className="space-y-2">
              {reminders.map(r => (
                <div key={r.id} className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span className="text-sm">{r.is_sent ? '✅' : '🔔'}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: r.is_sent ? 'var(--muted)' : 'var(--primary)' }}>
                      {new Date(r.remind_at).toLocaleDateString('zh-CN')}
                    </p>
                    {r.note && <p className="text-sm mt-0.5">{r.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: '#00000088' }} onClick={() => setShowReminderModal(false)}>
          <div
            className="w-full rounded-t-3xl p-6 space-y-4"
            style={{ background: 'var(--card)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg">设置提醒</h3>
            <div className="flex gap-2">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setReminderDate(addDays(d))}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: reminderDate === addDays(d) ? 'var(--primary)' : 'var(--border)',
                    color: reminderDate === addDays(d) ? 'white' : 'var(--muted)',
                  }}
                >
                  {d}天后
                </button>
              ))}
            </div>
            <input
              type="date"
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
            />
            <textarea
              value={reminderNote}
              onChange={e => setReminderNote(e.target.value)}
              placeholder="提醒备注（可选）"
              rows={2}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'none' }}
            />
            <button
              onClick={createReminder}
              disabled={savingReminder || !reminderDate}
              className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40"
              style={{ background: 'var(--primary)' }}
            >
              {savingReminder ? '设置中...' : '确认提醒'}
            </button>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
