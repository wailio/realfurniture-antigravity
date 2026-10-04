import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'
import { requireAdminSession } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url, key } = getSupabaseConfig()
    const res = await fetch(
      `${url}/rest/v1/messages?select=*&order=created_at.desc`,
      {
        headers: supabaseHeaders(key),
      }
    )

    if (!res.ok) {
      console.error('Supabase orders GET error:', res.status, await res.text())
      return NextResponse.json([])
    }

    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('GET /api/admin/orders error:', err)
    return NextResponse.json([])
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url, key } = getSupabaseConfig()
    const body = await request.json()
    const { id, status } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const res = await fetch(`${url}/rest/v1/messages?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders(key),
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, message: Array.isArray(data) ? data[0] : data })
  } catch (err: any) {
    console.error('PATCH /api/admin/orders error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url, key } = getSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const res = await fetch(`${url}/rest/v1/messages?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/admin/orders error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 })
  }
}
