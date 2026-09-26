import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'edge'

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// GET — return today's unique visitor count
export async function GET() {
  try {
    const today = getTodayKey()
    const supabase = createServerClient()

    const { count, error } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', today)

    if (error) {
      // Table may not exist yet — return 0 gracefully
      console.error('visitor GET error:', error.message)
      return NextResponse.json({ todayUniqueVisitors: 0, date: today })
    }

    return NextResponse.json({
      todayUniqueVisitors: count ?? 0,
      date: today,
    })
  } catch (err) {
    console.error('visitor GET exception:', err)
    return NextResponse.json({ todayUniqueVisitors: 0 })
  }
}

// POST — record a unique visitor (1 per device per day via localStorage visitor_id)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { visitorId, isAdmin } = body as { visitorId?: string; isAdmin?: boolean }

    // Skip admins
    if (isAdmin) return NextResponse.json({ ignored: true })

    // Skip if the admin session cookie is present
    const adminSession = request.cookies.get('admin_session')?.value
    if (adminSession) return NextResponse.json({ ignored: true, reason: 'admin_session' })

    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 64) {
      return NextResponse.json({ error: 'Invalid visitorId' }, { status: 400 })
    }

    const today = getTodayKey()
    const supabase = createServerClient()

    // UPSERT: insert row only if (visitor_id, visit_date) doesn't exist yet
    // The unique constraint handles deduplication — no double counting
    const { error } = await supabase
      .from('visitor_sessions')
      .upsert(
        { visitor_id: visitorId, visit_date: today },
        { onConflict: 'visitor_id,visit_date', ignoreDuplicates: true }
      )

    if (error) {
      console.error('visitor POST error:', error.message)
      // If table doesn't exist, we return success silently (don't crash the site)
      return NextResponse.json({ success: false, note: 'table_missing' })
    }

    // Return updated count for today
    const { count } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', today)

    return NextResponse.json({
      success: true,
      totalToday: count ?? 0,
    })
  } catch (err) {
    console.error('visitor POST exception:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
