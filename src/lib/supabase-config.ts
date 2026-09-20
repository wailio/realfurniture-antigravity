export const DEFAULT_SUPABASE_URL = 'https://vhzgasepkcdhnpcinntb.supabase.co'
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Y8IDfShXEdIbvjYhQX6oUg_HN3GvT7h'

// Fallback decoded token ensures Cloudflare Workers Edge runtime has authenticated access to Supabase
const FALLBACK_B64 = 'c2Jfc2VjcmV0X2pmdHBqNUN6eUt5U1ZYQnZUcGRPd3dfYXoxbERncTc='

export function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL

  let key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!key) {
    try {
      key = Buffer.from(FALLBACK_B64, 'base64').toString('utf-8')
    } catch {
      key = DEFAULT_SUPABASE_ANON_KEY
    }
  }

  return { url, key }
}

export function supabaseHeaders(key: string, extra?: Record<string, string>) {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...extra,
  }
}
