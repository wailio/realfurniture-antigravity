import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'
import { products as staticCatalog } from '@/lib/products'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = `${url}/rest/v1/products?select=*&order=created_at.desc`
    if (category && category !== 'all') {
      query += `&category=eq.${encodeURIComponent(category)}`
    }

    const res = await fetch(query, {
      headers: supabaseHeaders(key),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase products GET error:', res.status, errText)
      // Return empty array instead of crashing so UI works cleanly
      return NextResponse.json([])
    }

    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (err: any) {
    console.error('GET /api/admin/products error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // ── Optional Seed Action to populate Supabase with initial catalog ──
    if (action === 'seed') {
      const formatted = staticCatalog.map(p => ({
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: p.description || '',
        price: Number(p.price),
        sale_price: p.originalPrice ? Number(p.originalPrice) : null,
        category: p.category,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        in_stock: true,
      }))

      const res = await fetch(`${url}/rest/v1/products`, {
        method: 'POST',
        headers: supabaseHeaders(key),
        body: JSON.stringify(formatted),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Erreur Supabase (${res.status}): ${errText}`)
      }

      const data = await res.json()
      return NextResponse.json({ success: true, count: Array.isArray(data) ? data.length : 0 })
    }

    const body = await request.json()
    const { name, description, price, sale_price, category, images, in_stock } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'name, price, and category are required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const res = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: supabaseHeaders(key),
      body: JSON.stringify({
        name,
        slug,
        description: description || '',
        price: Number(price),
        sale_price: sale_price ? Number(sale_price) : null,
        category,
        images: images || [],
        in_stock: in_stock !== false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, product: Array.isArray(data) ? data[0] : data }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/products error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const res = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders(key),
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, product: Array.isArray(data) ? data[0] : data })
  } catch (err: any) {
    console.error('PUT /api/admin/products error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url, key } = getSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const res = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Supabase error (${res.status}): ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/admin/products error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 })
  }
}
