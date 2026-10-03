/**
 * Telegram Admin Notifications — server-side only utility
 * Called from API routes (edge runtime). Never imported by client components.
 * Credentials live in .env.local without NEXT_PUBLIC_ so they NEVER reach the browser bundle.
 */

interface TelegramMessage {
  type: 'order' | 'cold_lead'
  name: string
  phone: string
  product?: string
  subject?: string
  budget?: string
  category?: string
}

function buildMessage(data: TelegramMessage): string {
  const emoji = data.type === 'cold_lead' ? '🪑' : '📩'
  const label = data.type === 'cold_lead' ? 'Nouveau Cold Lead' : 'Nouvelle Demande Client'
  const now = new Date().toLocaleString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  let msg = `${emoji} *${label}*\n`
  msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`
  msg += `👤 *Nom:* ${escapeMarkdown(data.name)}\n`
  msg += `📞 *Tél:* ${escapeMarkdown(data.phone)}\n`

  if (data.type === 'cold_lead') {
    if (data.category) msg += `🛋 *Catégorie:* ${escapeMarkdown(data.category)}\n`
    if (data.budget)   msg += `💰 *Budget:* ${escapeMarkdown(data.budget)}\n`
  } else {
    if (data.subject)  msg += `📋 *Sujet:* ${escapeMarkdown(data.subject)}\n`
    if (data.product)  msg += `🪑 *Modèle:* ${escapeMarkdown(data.product)}\n`
  }

  msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`
  msg += `🕒 ${now}`
  return msg
}

/** Escape special chars for Telegram MarkdownV2 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}

/**
 * Sends a Telegram notification to the admin.
 * Fails silently — never blocks the main API response.
 */
export async function sendTelegramAlert(data: TelegramMessage): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in env')
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(data),
        parse_mode: 'MarkdownV2',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] Failed to send alert:', err)
    }
  } catch (err) {
    // Never crash the main request if Telegram is unreachable
    console.error('[Telegram] Network error:', err)
  }
}
