import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('GET /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { name, description, price, sale_price, category, images, in_stock } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'name, price, and category are required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data, error } = await supabase.from('products').insert({
      name,
      slug,
      description: description || '',
      price: Number(price),
      sale_price: sale_price ? Number(sale_price) : null,
      category,
      images: images || [],
      in_stock: in_stock !== false,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, product: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, product: data })
  } catch (err) {
    console.error('PUT /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
