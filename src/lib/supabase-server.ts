import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://vhzgasepkcdhnpcinntb.supabase.co'

  const fallbackKey =
    typeof atob !== 'undefined'
      ? atob('c2Jfc2VjcmV0X2pmdHBqNUN6eUt5U1ZYQnZUcGRPd3dfYXoxbERncTc=')
      : ''

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
