import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { contactName, remindAt, note } = await req.json()

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 })
  }

  const date = new Date(remindAt).toLocaleDateString('zh-CN')
  const text = `🔔 CRM 提醒设置成功\n\n👤 联系人：${contactName}\n📅 提醒时间：${date}${note ? `\n📝 备注：${note}` : ''}`

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.description)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
