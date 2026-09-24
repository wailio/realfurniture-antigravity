import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Generate safe unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const fileName = `${timestamp}-${random}-${cleanName}`

    const { url, key } = getSupabaseConfig()

    // Upload buffer to Supabase Storage bucket 'products'
    const arrayBuffer = await file.arrayBuffer()
    const uploadRes = await fetch(`${url}/storage/v1/object/products/${fileName}`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(key),
        'Content-Type': file.type || 'image/jpeg',
      },
      body: arrayBuffer,
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Supabase upload error:', uploadRes.status, errText)
      throw new Error(`Erreur lors du téléversement (${uploadRes.status}): ${errText}`)
    }

    // Public URL for Supabase storage object
    const publicUrl = `${url}/storage/v1/object/public/products/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    })
  } catch (error: any) {
    console.error('POST /api/admin/upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Échec du téléversement' },
      { status: 500 }
    )
  }
}
