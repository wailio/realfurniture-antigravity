import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'
import { listSupabaseStorageFiles, deleteSupabaseStorageFiles, extractSupabaseStorageKey } from '@/lib/supabase-storage'

export const runtime = 'edge'

const PROTECTED_SYSTEM_FILES = new Set([
  'site-config.json',
  'cold-leads.json',
  'admin-users.json',
  'analytics',
])

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Ko'
  const k = 1024
  const sizes = ['Octets', 'Ko', 'Mo', 'Go']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

async function getStorageAudit() {
  const { url, key } = getSupabaseConfig()

  // 1. List all files in Supabase storage bucket `products`
  const storageFiles = await listSupabaseStorageFiles('products')

  // 2. Fetch all products from DB to extract referenced images
  let activeImageKeys = new Set<string>()
  try {
    const res = await fetch(`${url}/rest/v1/products?select=id,name,images,image`, {
      headers: supabaseHeaders(key),
    })
    if (res.ok) {
      const prods = await res.json()
      if (Array.isArray(prods)) {
        for (const p of prods) {
          const imgs: string[] = []
          if (Array.isArray(p.images)) imgs.push(...p.images)
          if (typeof p.image === 'string') imgs.push(p.image)

          for (const img of imgs) {
            const storageKey = extractSupabaseStorageKey(img, 'products')
            if (storageKey) activeImageKeys.add(storageKey)
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to query products for storage audit:', err)
  }

  // 3. Check site-config.json if possible to protect branding images
  try {
    const configRes = await fetch(`${url}/storage/v1/object/public/products/site-config.json?t=${Date.now()}`)
    if (configRes.ok) {
      const config = await configRes.json()
      const jsonStr = JSON.stringify(config)
      // Any storage file names mentioned in site-config.json
      for (const f of storageFiles) {
        if (f.name && jsonStr.includes(f.name)) {
          activeImageKeys.add(f.name)
        }
      }
    }
  } catch {
    // Ignore site-config read error
  }

  let totalSizeBytes = 0
  let orphanSizeBytes = 0
  const orphanFiles: { name: string; size: number; formattedSize: string; createdAt?: string }[] = []
  const activeFiles: { name: string; size: number; formattedSize: string }[] = []

  for (const item of storageFiles) {
    const name = item.name
    if (!name || name === '.emptyFolderPlaceholder') continue

    const size = item.metadata?.size || item.metadata?.contentLength || 0
    totalSizeBytes += size

    // If system file or active image, keep safe
    if (PROTECTED_SYSTEM_FILES.has(name) || name.startsWith('analytics/')) {
      activeFiles.push({ name, size, formattedSize: formatBytes(size) })
    } else if (activeImageKeys.has(name)) {
      activeFiles.push({ name, size, formattedSize: formatBytes(size) })
    } else {
      // Orphan file (taking space without being attached to any active product)
      orphanSizeBytes += size
      orphanFiles.push({
        name,
        size,
        formattedSize: formatBytes(size),
        createdAt: item.created_at || item.updated_at,
      })
    }
  }

  return {
    totalFiles: storageFiles.length,
    totalSizeBytes,
    totalSizeFormatted: formatBytes(totalSizeBytes),
    activeCount: activeFiles.length,
    orphanCount: orphanFiles.length,
    orphanSizeBytes,
    orphanSizeFormatted: formatBytes(orphanSizeBytes),
    orphanFiles,
  }
}

export async function GET() {
  try {
    const audit = await getStorageAudit()
    return NextResponse.json({
      success: true,
      ...audit,
    })
  } catch (err: any) {
    console.error('GET /api/admin/storage-cleanup error:', err)
    return NextResponse.json({ error: err.message || 'Audit failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'clean-orphans'

    if (action === 'clean-orphans') {
      const audit = await getStorageAudit()
      const orphanNames = audit.orphanFiles.map((f) => f.name)

      if (orphanNames.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Aucun fichier orphelin détecté. Le stockage est déjà propre.',
          deletedCount: 0,
          freedBytes: 0,
          freedFormatted: '0 Ko',
        })
      }

      const deletedCount = await deleteSupabaseStorageFiles(orphanNames, 'products')
      const freedBytes = audit.orphanSizeBytes

      return NextResponse.json({
        success: true,
        message: `${deletedCount} fichier(s) orphelin(s) supprimé(s) avec succès. Espace libéré !`,
        deletedCount,
        freedBytes,
        freedFormatted: formatBytes(freedBytes),
      })
    }

    if (action === 'delete-file') {
      const fileName = body.fileName
      if (!fileName || typeof fileName !== 'string') {
        return NextResponse.json({ error: 'fileName requis' }, { status: 400 })
      }
      if (PROTECTED_SYSTEM_FILES.has(fileName)) {
        return NextResponse.json({ error: 'Ce fichier système est protégé' }, { status: 403 })
      }

      const deleted = await deleteSupabaseStorageFiles([fileName], 'products')
      return NextResponse.json({
        success: true,
        deleted: deleted > 0,
        message: `Fichier ${fileName} supprimé définitivement du stockage`,
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (err: any) {
    console.error('POST /api/admin/storage-cleanup error:', err)
    return NextResponse.json({ error: err.message || 'Échec du nettoyage' }, { status: 500 })
  }
}
