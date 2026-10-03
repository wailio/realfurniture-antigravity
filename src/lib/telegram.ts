/**
 * Telegram Admin Notifications — server-side only utility
 * On Cloudflare Pages edge runtime, process.env vars from wrangler.toml [vars]
 * are not reliably available at runtime (only at build time). We use the same
 * hardcoded fallback pattern as supabase-config.ts to guarantee delivery.
 * The credentials are already committed in wrangler.toml so this adds no extra exposure.
 */

// Hardcoded fallbacks — same pattern as FALLBACK_ENC in supabase-config.ts
const DEFAULT_TOKEN = '8932270049:AAGnDS3MkIXODT9Kk857Xcb5ZDjFpYHSCAg'
const DEFAULT_CHAT_ID = '6525113983'

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
  const path = data.type === 'cold_lead' ? 'cold-leads' : 'orders'

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
    `Nom: ${data.name}`,
    `Tel: ${data.phone}`,
  ]

  if (data.type === 'cold_lead') {
    if (data.category) lines.push(`Categorie: ${data.category}`)
    if (data.budget)   lines.push(`Budget: ${data.budget}`)
  } else {
    if (data.product)  lines.push(`Modele: ${data.product}`)
    else if (data.subject) lines.push(`Sujet: ${data.subject}`)
  }

  lines.push(`──────────────────`)
  lines.push(`${now}`)
  lines.push(``)
  lines.push(`https://realfurniture-antigravity.pages.dev/admin/${path}`)

  return lines.join('\n')
}

/**
 * Sends a Telegram notification to the admin.
 * Fails silently — never blocks the main API response.
 */
export async function sendTelegramAlert(data: TelegramMessage): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(data),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] Failed to send alert:', err)
    }
  } catch (err) {
    console.error('[Telegram] Network error:', err)
  }
}
