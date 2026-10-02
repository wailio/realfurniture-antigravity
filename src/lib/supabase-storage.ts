import { getSupabaseConfig, supabaseHeaders } from './supabase-config'

/**
 * Extracts the storage object file name / path from a Supabase storage URL.
 * Handles both public and authenticated URLs, e.g.:
 * https://vhzgasepkcdhnpcinntb.supabase.co/storage/v1/object/public/products/1790268128804-bt6qei-apr.jpg
 * Returns: "1790268128804-bt6qei-apr.jpg"
 */
export function extractSupabaseStorageKey(imageUrl: string, bucket = 'products'): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null
  try {
    const regex = new RegExp(`/storage/v1/object/(?:public/|authenticated/)?${bucket}/([^?#]+)`)
    const match = imageUrl.match(regex)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
  } catch {
    // Ignore regex errors
  }
  return null
}

/**
 * Permanently deletes one or more files from a Supabase Storage bucket.
 * This physically destroys the files from Supabase/S3 storage and immediately frees up space.
 */
export async function deleteSupabaseStorageFiles(fileNames: string[], bucket = 'products'): Promise<number> {
  if (!fileNames || fileNames.length === 0) return 0
  const uniqueNames = Array.from(new Set(fileNames.filter(Boolean)))
  if (uniqueNames.length === 0) return 0

  const { url, key } = getSupabaseConfig()
  if (!url || !key) return 0

  try {
    const res = await fetch(`${url}/storage/v1/object/${bucket}`, {
      method: 'DELETE',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: uniqueNames }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`Failed to delete storage objects from ${bucket}:`, res.status, errText)
      return 0
    }

    const data = await res.json()
    return Array.isArray(data) ? data.length : uniqueNames.length
  } catch (err) {
    console.error(`Error deleting storage objects from ${bucket}:`, err)
    return 0
  }
}

export interface StorageObjectItem {
  name: string
  id?: string
  size?: number
  formattedSize: string
  created_at?: string
  updated_at?: string
  isOrphan?: boolean
  isSystem?: boolean
}

/**
 * Lists all objects stored in a Supabase Storage bucket.
 */
export async function listSupabaseStorageFiles(bucket = 'products'): Promise<any[]> {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) return []

  try {
    const res = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: '', limit: 1000 }),
    })

    if (!res.ok) {
      console.error(`Failed to list storage objects in ${bucket}:`, res.status)
      return []
    }

    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error(`Error listing storage objects in ${bucket}:`, err)
    return []
  }
}
