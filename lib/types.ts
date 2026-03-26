export type ContactType =
  | '投资人'
  | '合作伙伴'
  | '客户'
  | '项目相关人'
  | '朋友'
  | '其他'

export type ContactStatus = '活跃' | '冷线' | '已合作' | '暂停'

export type Project = 'Sitesfy' | 'AIYOU' | 'ARTI' | 'BotEarn' | '通用'

export interface Contact {
  id: string
  created_at: string
  name: string
  nickname?: string
  contact_type?: ContactType
  projects?: Project[]
  company?: string
  role?: string
  next_followup?: string
  status?: ContactStatus
  wechat?: string
  telegram?: string
  email?: string
  location?: string
  intro?: string
  source?: string
  avatar_url?: string
}

export interface Interaction {
  id: string
  contact_id: string
  content: string
  created_at: string
}

export interface Reminder {
  id: string
  contact_id: string
  remind_at: string
  note?: string
  is_sent: boolean
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at'>
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>
      }
      interactions: {
        Row: Interaction
        Insert: Omit<Interaction, 'id' | 'created_at'>
        Update: Partial<Omit<Interaction, 'id' | 'created_at'>>
      }
      reminders: {
        Row: Reminder
        Insert: Omit<Reminder, 'id' | 'created_at'>
        Update: Partial<Omit<Reminder, 'id' | 'created_at'>>
      }
    }
  }
}
