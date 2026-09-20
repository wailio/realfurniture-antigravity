export const DEFAULT_SUPABASE_URL = 'https://vhzgasepkcdhnpcinntb.supabase.co'

export function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

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
