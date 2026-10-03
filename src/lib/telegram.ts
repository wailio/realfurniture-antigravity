/**
 * Telegram Admin Notifications — server-side only utility
 * Called from API routes (edge runtime). Never imported by client components.
 * Credentials live in .env.local without NEXT_PUBLIC_ so they NEVER reach the browser bundle.
 * Uses plain text mode — no markdown escaping needed, works perfectly with emojis.
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
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const lines: string[] = [
    `${emoji} ${label}`,
    `──────────────────`,
    `👤 Nom: ${data.name}`,
    `📞 Tel: ${data.phone}`,
  ]

  if (data.type === 'cold_lead') {
    if (data.category) lines.push(`🛋 Categorie: ${data.category}`)
    if (data.budget)   lines.push(`💰 Budget: ${data.budget}`)
  } else {
    if (data.product)  lines.push(`🪑 Modele: ${data.product}`)
    if (data.subject && !data.product) lines.push(`📋 Sujet: ${data.subject}`)
  }

  lines.push(`──────────────────`)
  lines.push(`🕒 ${now}`)
  lines.push(``)
  lines.push(`➡ https://chateau-art.pages.dev/admin/orders`)

  return lines.join('\n')
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
        // Plain text — no parse_mode needed, no escaping issues, emojis work fine
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
