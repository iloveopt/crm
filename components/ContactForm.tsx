'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Contact, ContactType, ContactStatus, Project } from '@/lib/types'

const ALL_PROJECTS: Project[] = ['Sitesfy', 'AIYOU', 'ARTI', 'BotEarn', '通用']
const CONTACT_TYPES: ContactType[] = ['投资人', '合作伙伴', '客户', '项目相关人', '朋友', '其他']
const STATUSES: ContactStatus[] = ['活跃', '冷线', '已合作', '暂停']

type FormData = Omit<Contact, 'id' | 'created_at'>

export default function ContactForm({ initial, contactId }: { initial?: Partial<Contact>; contactId?: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: initial?.name || '',
    nickname: initial?.nickname || '',
    contact_type: initial?.contact_type,
    projects: initial?.projects || [],
    company: initial?.company || '',
    role: initial?.role || '',
    next_followup: initial?.next_followup || '',
    status: initial?.status || '活跃',
    wechat: initial?.wechat || '',
    telegram: initial?.telegram || '',
    email: initial?.email || '',
    location: initial?.location || '',
    intro: initial?.intro || '',
    source: initial?.source || '',
    avatar_url: initial?.avatar_url || '',
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleProject(p: Project) {
    const curr = form.projects || []
    if (curr.includes(p)) set('projects', curr.filter(x => x !== p))
    else set('projects', [...curr, p])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
    )
    let id = contactId
    if (contactId) {
      await supabase.from('contacts').update(payload).eq('id', contactId)
    } else {
      const { data } = await supabase.from('contacts').insert(payload).select('id').single()
      id = data?.id
    }
    setSaving(false)
    router.push(id ? `/contacts/${id}` : '/')
  }

  const inputCls = "w-full px-4 py-3 rounded-xl outline-none"
  const inputStyle = { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 pt-4 pb-24">
      {/* Name */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>
          姓名 <span style={{ color: 'var(--primary)' }}>*</span>
        </label>
        <input
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="联系人姓名"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Nickname */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>昵称</label>
        <input
          value={form.nickname || ''}
          onChange={e => set('nickname', e.target.value)}
          placeholder="微信昵称或常用名"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Contact Type */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>类型</label>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('contact_type', form.contact_type === t ? undefined : t)}
              className="px-3 py-1.5 rounded-full text-sm transition-colors"
              style={{
                background: form.contact_type === t ? 'var(--primary)' : 'var(--card)',
                color: form.contact_type === t ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>关联项目</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PROJECTS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => toggleProject(p)}
              className="px-3 py-1.5 rounded-full text-sm transition-colors"
              style={{
                background: (form.projects || []).includes(p) ? 'var(--primary)' : 'var(--card)',
                color: (form.projects || []).includes(p) ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Company & Role */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>公司</label>
          <input
            value={form.company || ''}
            onChange={e => set('company', e.target.value)}
            placeholder="公司名称"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>职位</label>
          <input
            value={form.role || ''}
            onChange={e => set('role', e.target.value)}
            placeholder="职位/角色"
            className={inputCls}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>状态</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set('status', s)}
              className="px-3 py-1.5 rounded-full text-sm transition-colors"
              style={{
                background: form.status === s ? 'var(--primary)' : 'var(--card)',
                color: form.status === s ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Next Followup */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>下次跟进日期</label>
        <input
          type="date"
          value={form.next_followup || ''}
          onChange={e => set('next_followup', e.target.value)}
          className={inputCls}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
      </div>

      {/* Contact Info */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>微信</label>
        <input
          value={form.wechat || ''}
          onChange={e => set('wechat', e.target.value)}
          placeholder="微信号"
          className={inputCls}
          style={inputStyle}
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Telegram</label>
        <input
          value={form.telegram || ''}
          onChange={e => set('telegram', e.target.value)}
          placeholder="@username"
          className={inputCls}
          style={inputStyle}
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
        <input
          type="email"
          value={form.email || ''}
          onChange={e => set('email', e.target.value)}
          placeholder="email@example.com"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>地点</label>
        <input
          value={form.location || ''}
          onChange={e => set('location', e.target.value)}
          placeholder="城市/国家"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Source */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>来源</label>
        <input
          value={form.source || ''}
          onChange={e => set('source', e.target.value)}
          placeholder="如何认识的"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Intro */}
      <div>
        <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>简介备注</label>
        <textarea
          value={form.intro || ''}
          onChange={e => set('intro', e.target.value)}
          placeholder="关于这个人的备注..."
          rows={3}
          className={inputCls}
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: 'var(--primary)' }}
        >
          {saving ? '保存中...' : contactId ? '保存修改' : '添加联系人'}
        </button>
      </div>
    </form>
  )
}
