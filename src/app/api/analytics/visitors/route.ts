import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// In-memory daily visitor registry (per edge node / session window)
const dailyVisitors = new Map<string, Set<string>>()

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayVisitorsSet(): Set<string> {
  const today = getTodayKey()
  if (!dailyVisitors.has(today)) {
    // Keep only today's map to prevent memory growth
    dailyVisitors.clear()
    dailyVisitors.set(today, new Set<string>())
  }
  return dailyVisitors.get(today)!
}

export async function GET(request: NextRequest) {
  try {
    const todaySet = getTodayVisitorsSet()
    const todayCount = todaySet.size

    return NextResponse.json({
      todayUniqueVisitors: todayCount,
      date: getTodayKey(),
      adminFilterActive: true,
    })
  } catch (err) {
    console.error('GET /api/analytics/visitors error:', err)
    return NextResponse.json({ todayUniqueVisitors: 0, adminFilterActive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { visitorId, isAdmin } = body

    // ── STRICT ANTI-ADMIN EXCLUSION ──
    // If flagged as admin or from an admin session, DO NOT COUNT!
    if (isAdmin) {
      return NextResponse.json({ ignored: true, reason: 'admin_excluded' })
    }

    // Check admin cookie or header
    const adminCookie = request.cookies.get('chateau_admin')?.value
    if (adminCookie === '1') {
      return NextResponse.json({ ignored: true, reason: 'admin_cookie_excluded' })
    }

    // Identify unique client by visitorId or CF-Connecting-IP / client IP
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon'
    const uniqueFingerprint = visitorId ? `${visitorId}` : `${clientIp}`

    const todaySet = getTodayVisitorsSet()
    todaySet.add(uniqueFingerprint)

    return NextResponse.json({
      success: true,
      registered: true,
      totalToday: todaySet.size,
    })
  } catch (err) {
    console.error('POST /api/analytics/visitors error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
