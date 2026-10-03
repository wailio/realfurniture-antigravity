import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '@/lib/telegram'

export const runtime = 'edge'

// Temporary debug endpoint — DELETE after confirming Telegram works
export async function GET() {
  let result: any = null
  let error: any = null

  try {
    await sendTelegramAlert({
      type: 'order',
      name: 'DEBUG TEST',
      phone: '0555-DEBUG',
      product: 'Test depuis debug endpoint',
    })
    result = 'sendTelegramAlert completed without throwing'
  } catch (err: any) {
    error = err.message
  }

  return NextResponse.json({
    envCheck: {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET via env' : 'using hardcoded fallback',
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? 'SET via env' : 'using hardcoded fallback',
    },
    telegramCallResult: result,
    telegramCallError: error,
  })
}
