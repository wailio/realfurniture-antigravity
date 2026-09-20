import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  // Use server-only vars first (runtime), fall back to NEXT_PUBLIC_ (build-time embed)
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages → Settings → Environment variables.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
