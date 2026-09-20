import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'edge'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, messages(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('GET /api/admin/sales error:', err)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { customer_name, phone, product_id, amount, source_message_id, notes } = body

    const { data, error } = await supabase.from('orders').insert({
      customer_name,
      phone,
      product_id: product_id || null,
      amount: amount ? Number(amount) : null,
      source_message_id: source_message_id || null,
      funnel_stage: 'cold',
      notes: notes || '',
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, order: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/sales error:', err)
    return NextResponse.json({ error: 'Failed to create sale lead' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id, funnel_stage, notes } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updates: Record<string, string> = {}
    if (funnel_stage) updates.funnel_stage = funnel_stage
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, order: data })
  } catch (err) {
    console.error('PATCH /api/admin/sales error:', err)
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/sales error:', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
