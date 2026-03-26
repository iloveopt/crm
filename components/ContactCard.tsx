'use client'

import Link from 'next/link'
import type { Contact } from '@/lib/types'

function isOverdue(date?: string): boolean {
  if (!date) return false
  return new Date(date) < new Date(new Date().toDateString())
}

export default function ContactCard({ contact }: { contact: Contact }) {
  const overdue = isOverdue(contact.next_followup)

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div
        className="rounded-2xl p-4 active:scale-95 transition-transform cursor-pointer"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: 'var(--primary)22', color: 'var(--primary)' }}
          >
            {contact.avatar_url ? (
              <img src={contact.avatar_url} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              contact.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                {contact.name}
              </span>
              {contact.nickname && (
                <span className="text-sm" style={{ color: 'var(--muted)' }}>({contact.nickname})</span>
              )}
              {contact.status && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: contact.status === '活跃' ? '#22c55e22' : contact.status === '已合作' ? '#3b82f622' : '#6b728022',
                    color: contact.status === '活跃' ? '#22c55e' : contact.status === '已合作' ? '#60a5fa' : 'var(--muted)',
                  }}
                >
                  {contact.status}
                </span>
              )}
            </div>
            {(contact.company || contact.role) && (
              <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {[contact.role, contact.company].filter(Boolean).join(' @ ')}
              </p>
            )}
            {contact.projects && contact.projects.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {contact.projects.map(p => (
                  <span
                    key={p}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary)22', color: 'var(--primary)' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
            {contact.next_followup && (
              <p className={`text-xs mt-2 font-medium ${overdue ? 'text-red-400' : ''}`}
                style={!overdue ? { color: 'var(--muted)' } : undefined}>
                {overdue ? '⚠️' : '📅'} 跟进: {contact.next_followup}
                {overdue && ' (已过期)'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
