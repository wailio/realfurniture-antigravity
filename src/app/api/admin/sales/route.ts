import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'

export const runtime = 'edge'

export async function GET() {
  try {
    const { url, key } = getSupabaseConfig()
    const res = await fetch(
      `${url}/rest/v1/orders?select=*,messages(*)&order=created_at.desc`,
      {
        headers: supabaseHeaders(key),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('Supabase sales GET error:', res.status, await res.text())
      return NextResponse.json([])
    }

    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('GET /api/admin/sales error:', err)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const body = await request.json()
    const { customer_name, phone, product_id, amount, source_message_id, notes } = body

    const res = await fetch(`${url}/rest/v1/orders`, {
      method: 'POST',
      headers: supabaseHeaders(key),
      body: JSON.stringify({
        customer_name,
        phone,
        product_id: product_id || null,
        amount: amount ? Number(amount) : null,
        source_message_id: source_message_id || null,
        funnel_stage: 'cold',
        notes: notes || '',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, order: Array.isArray(data) ? data[0] : data }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/sales error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create sale lead' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const body = await request.json()
    const { id, funnel_stage, notes } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updates: Record<string, any> = {}
    if (funnel_stage) updates.funnel_stage = funnel_stage
    if (notes !== undefined) updates.notes = notes

    const res = await fetch(`${url}/rest/v1/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders(key),
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, order: Array.isArray(data) ? data[0] : data })
  } catch (err: any) {
    console.error('PATCH /api/admin/sales error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update sale' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const res = await fetch(`${url}/rest/v1/orders?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/admin/sales error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 })
  }
}
