import { NextResponse } from 'next/server'
import { getSupabaseConfig } from '@/lib/supabase-config'
import { loadDynamicUsers, findUser } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET() {
  const { url, key } = getSupabaseConfig()
  const fetchUrl = `${url}/storage/v1/object/public/products/admin-users.json?t=${Date.now()}`

  let rawStatus = 0
  let rawText = ''
  let fetchError = ''

  try {
    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
    rawStatus = res.status
    rawText = await res.text()
  } catch (e: any) {
    fetchError = e.message
  }

  // Also test authenticated fetch
  let authStatus = 0
  let authText = ''
  try {
    const resAuth = await fetch(`${url}/storage/v1/object/authenticated/products/admin-users.json`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      }
    })
    authStatus = resAuth.status
    authText = await resAuth.text()
  } catch (e: any) {
    authText = 'Error: ' + e.message
  }

  const dynamicUsers = await loadDynamicUsers()
  const foundWail2 = await findUser('wail2')

  return NextResponse.json({
    supabaseUrl: url,
    hasKey: Boolean(key && key.length > 20),
    keyPrefix: key ? key.slice(0, 10) : 'none',
    publicFetch: {
      status: rawStatus,
      error: fetchError,
      bodyPreview: rawText.slice(0, 200),
    },
    authFetch: {
      status: authStatus,
      bodyPreview: authText.slice(0, 200),
    },
    dynamicUsersCount: dynamicUsers.length,
    foundWail2: Boolean(foundWail2),
  })
}
