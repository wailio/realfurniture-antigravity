import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'

export const runtime = 'edge'

function getTodayAlgiers(): string {
  // Use Algeria timezone (UTC+1) for day boundary
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' }) // YYYY-MM-DD
}

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'CDN-Cache-Control': 'no-store',
}

// GET — return today's unique visitor count
export async function GET() {
  try {
    const today = getTodayAlgiers()
    const { url, key } = getSupabaseConfig()

    const res = await fetch(
      `${url}/rest/v1/visitor_sessions?select=id&visit_date=eq.${today}`,
      {
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'count=exact',
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { todayUniqueVisitors: 0, date: today },
        { headers: NO_CACHE }
      )
    }

    // Count comes from Content-Range header: "0-N/TOTAL"
    const range = res.headers.get('content-range') || ''
    const total = parseInt(range.split('/')[1] ?? '0', 10) || 0

    return NextResponse.json(
      { todayUniqueVisitors: isNaN(total) ? 0 : total, date: today },
      { headers: NO_CACHE }
    )
  } catch (err) {
    console.error('GET /api/analytics/visitors error:', err)
    return NextResponse.json(
      { todayUniqueVisitors: 0, date: getTodayAlgiers() },
      { headers: NO_CACHE }
    )
  }
}

// POST — register a unique device visitor (1 per device per day)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { visitorId, isAdmin } = body as { visitorId?: string; isAdmin?: boolean }

    // Skip admins
    if (isAdmin) return NextResponse.json({ ignored: true, reason: 'admin' })
    const adminSession = request.cookies.get('admin_session')?.value
    if (adminSession) return NextResponse.json({ ignored: true, reason: 'admin_session' })

    // Validate visitorId
    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 80) {
      return NextResponse.json({ error: 'Invalid visitorId' }, { status: 400 })
    }

    const today = getTodayAlgiers()
    const { url, key } = getSupabaseConfig()

    // Upsert with ?on_conflict — PostgREST requires this to know which constraint to use
    // ON CONFLICT (visitor_id, visit_date) DO NOTHING = exact 1 row per device per day
    const res = await fetch(
      `${url}/rest/v1/visitor_sessions?on_conflict=visitor_id,visit_date`,
      {
        method: 'POST',
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          visit_date: today,
        }),
      }
    )

    if (!res.ok && res.status !== 204) {
      const errText = await res.text()
      console.error('[visitors] Supabase insert error:', res.status, errText)
      return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 })
    }

    // Get updated count for the response
    const countRes = await fetch(
      `${url}/rest/v1/visitor_sessions?select=id&visit_date=eq.${today}`,
      {
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'count=exact',
        },
      }
    )

    const range = countRes.headers.get('content-range') || ''
    const total = parseInt(range.split('/')[1] ?? '0', 10) || 0

    return NextResponse.json({ success: true, totalToday: total })
  } catch (err) {
    console.error('POST /api/analytics/visitors error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
