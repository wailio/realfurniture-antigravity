import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Temporary debug endpoint — DELETE after confirming Telegram works
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  const hasToken = !!token
  const hasChat = !!chatId
  const tokenPreview = token ? token.substring(0, 10) + '...' : 'NOT SET'
  const chatPreview = chatId ? chatId.substring(0, 4) + '...' : 'NOT SET'

  // Actually try to send a Telegram message and return the result
  let telegramResult: any = null
  if (token && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🔧 Debug test depuis Cloudflare Edge — connexion OK!',
        }),
      })
      telegramResult = await res.json()
    } catch (err: any) {
      telegramResult = { error: err.message }
    }
  }

  return NextResponse.json({
    env: {
      TELEGRAM_BOT_TOKEN: { set: hasToken, preview: tokenPreview },
      TELEGRAM_CHAT_ID: { set: hasChat, preview: chatPreview },
    },
    telegramResult,
  })
}
