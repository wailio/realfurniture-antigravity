import { getSupabaseConfig } from './supabase-config'

export const AUTH_SALT = process.env.AUTH_SALT || 'chateau_art_tower_2026'
export const SESSION_SECRET = process.env.SESSION_SECRET || 'chateau_art_secret_hmac_token_key_2026'
export const SESSION_COOKIE_NAME = 'admin_session'

export interface AdminUser {
  id?: string
  username: string
  role: 'developer' | 'admin'
  displayName: string
  email?: string
  phone?: string
  createdAt?: string
  lastLogin?: string
  status?: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
}

export interface DynamicUserRecord extends AdminUser {
  passwordHash: string
}

export const KNOWN_USERS: Record<string, AdminUser & { passwordHash: string }> = {
  wailio: {
    username: 'wailio',
    role: 'developer',
    displayName: 'Wailio (Developer)',
    // SHA-256("12media34wail56" + "chateau_art_tower_2026")
    passwordHash: '2317b8a7ec208a462af2edeab15ff81479d9edb4ce5d6c16adf1d44e830c75e6',
  },
  toweradmin: {
    username: 'toweradmin',
    role: 'admin',
    displayName: 'Tower Admin',
    // SHA-256("ART@tower01@" + "chateau_art_tower_2026")
    passwordHash: '4b578bed0a8bb6d67590d59b2c05835091c304aab14efccd86b36bd0cba881de',
  },
}

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export interface SessionPayload {
  u: string
  r: string
  iat: number
}

export async function createSessionToken(user: AdminUser): Promise<string> {
  const payload: SessionPayload = {
    u: user.username,
    r: user.role,
    iat: Date.now(),
  }
  const payloadStr = btoa(JSON.stringify(payload))
  const sig = await hmacSign(payloadStr, SESSION_SECRET)
  return `${payloadStr}.${sig}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const raw = token.includes('%') ? decodeURIComponent(token) : token
    const parts = raw.split('.')
    if (parts.length !== 2) return null
    const [payloadStr, sig] = parts
    const expected = await hmacSign(payloadStr, SESSION_SECRET)
    if (!safeEqual(sig, expected)) return null

    const json = atob(payloadStr)
    const payload = JSON.parse(json) as SessionPayload

    // 24 hour expiry
    const MAX_AGE = 24 * 60 * 60 * 1000
    if (Date.now() - payload.iat > MAX_AGE) return null

    return payload
  } catch {
    return null
  }
}

export async function requireAdminSession(request: { cookies: { get: (name: string) => { value?: string } | undefined } }): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return await verifySessionToken(token)
}

// ── Supabase Dynamic Users Storage ──────────────────────────────────────────
export async function loadDynamicUsers(): Promise<DynamicUserRecord[]> {
  try {
    const { url } = getSupabaseConfig()
    const fetchUrl = `${url}/storage/v1/object/public/products/admin-users.json?t=${Date.now()}`
    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data.users) ? data.users : []
    }
  } catch (err) {
    console.error('Failed to load dynamic admin users:', err)
  }
  return []
}

export async function saveDynamicUsers(users: DynamicUserRecord[]): Promise<boolean> {
  try {
    const { url, key } = getSupabaseConfig()
    if (!key) return false
    const uploadUrl = `${url}/storage/v1/object/products/admin-users.json`
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        'x-upsert': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users, updatedAt: new Date().toISOString() }, null, 2),
    })
    return res.ok
  } catch (err) {
    console.error('Failed to save dynamic admin users:', err)
    return false
  }
}

export async function findUser(username: string): Promise<(AdminUser & { passwordHash: string }) | null> {
  const clean = username.toLowerCase().trim()
  if (KNOWN_USERS[clean]) {
    return KNOWN_USERS[clean]
  }
  const dynamicUsers = await loadDynamicUsers()
  const found = dynamicUsers.find((u) => u.username.toLowerCase().trim() === clean)
  return found || null
}
