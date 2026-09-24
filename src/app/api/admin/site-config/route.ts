import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_SITE_CONFIG, PUBLIC_SITE_CONFIG_STORAGE_URL, SiteConfig } from '@/lib/site-config'

export const runtime = 'edge'

export async function GET() {
  try {
    const res = await fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ ...DEFAULT_SITE_CONFIG, ...data })
    }

    return NextResponse.json(DEFAULT_SITE_CONFIG)
  } catch (err) {
    console.error('GET /api/admin/site-config error:', err)
    return NextResponse.json(DEFAULT_SITE_CONFIG)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://vhzgasepkcdhnpcinntb.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    // 1. Fetch current config to merge
    let currentConfig: Record<string, any> = { ...DEFAULT_SITE_CONFIG }
    try {
      const res = await fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const existing = await res.json()
        currentConfig = { ...currentConfig, ...existing }
      }
    } catch {
      // ignore, fall back to default
    }

    // 2. Merge updates
    const mergedConfig: SiteConfig = {
      ...currentConfig,
      ...updates,
    } as SiteConfig

    // 3. Upload to Supabase storage bucket `products` as `site-config.json`
    const uploadUrl = `${supabaseUrl}/storage/v1/object/products/site-config.json`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'x-upsert': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mergedConfig, null, 2),
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Supabase storage upload failed:', uploadRes.status, errText)
      return NextResponse.json(
        { error: 'Échec de la sauvegarde dans le stockage', details: errText },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration du site mise à jour avec succès',
      config: mergedConfig,
    })
  } catch (err: any) {
    console.error('PUT /api/admin/site-config error:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    )
  }
}
