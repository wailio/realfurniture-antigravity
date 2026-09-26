import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'edge'

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getFilePath(today: string) {
  return `analytics/visitors-${today}.json`
}

// GET — return today's unique visitors count
export async function GET() {
  try {
    const today = getTodayKey()
    const supabase = createServerClient()
    const filePath = getFilePath(today)

    const { data, error } = await supabase.storage.from('products').download(filePath)
    if (error || !data) {
      return NextResponse.json({ todayUniqueVisitors: 0, date: today })
    }

    const text = await data.text()
    const parsed = JSON.parse(text)
    const visitors: string[] = Array.isArray(parsed?.visitors) ? parsed.visitors : []

    return NextResponse.json(
      {
        todayUniqueVisitors: visitors.length,
        date: today,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/analytics/visitors error:', err)
    return NextResponse.json(
      { todayUniqueVisitors: 0, date: getTodayKey() },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
        },
      }
    )
  }
}

// POST — register a unique device visitor (1 per device per day)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { visitorId, isAdmin } = body as { visitorId?: string; isAdmin?: boolean }

    // If request explicitly indicates admin
    if (isAdmin) {
      return NextResponse.json({ ignored: true, reason: 'admin' })
    }

    // If admin session cookie exists
    const adminSession = request.cookies.get('admin_session')?.value
    if (adminSession) {
      return NextResponse.json({ ignored: true, reason: 'admin_session' })
    }

    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 80) {
      return NextResponse.json({ error: 'Invalid visitorId' }, { status: 400 })
    }

    const today = getTodayKey()
    const supabase = createServerClient()
    const filePath = getFilePath(today)

    let visitors: string[] = []

    try {
      const { data } = await supabase.storage.from('products').download(filePath)
      if (data) {
        const text = await data.text()
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed?.visitors)) {
          visitors = parsed.visitors
        }
      }
    } catch {}

    // Deduplicate: 1 person per device per day
    if (!visitors.includes(visitorId)) {
      visitors.push(visitorId)

      await supabase.storage.from('products').upload(
        filePath,
        JSON.stringify({ date: today, visitors }),
        { upsert: true, contentType: 'application/json' }
      )
    }

    return NextResponse.json({
      success: true,
      totalToday: visitors.length,
    })
  } catch (err) {
    console.error('POST /api/analytics/visitors error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
