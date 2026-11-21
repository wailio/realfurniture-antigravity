'use client'

import { useState, useEffect } from 'react'
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  PUBLIC_SITE_CONFIG_STORAGE_URL,
  getSafeMapEmbedUrl,
} from '@/lib/site-config'

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)

  useEffect(() => {
    let isMounted = true

    // 1. Instant local storage cache if available
    try {
      localStorage.removeItem('chateau_site_config') // Clear legacy rental cache
      const cached = localStorage.getItem('mf_site_config')
      if (cached) {
        const parsed = JSON.parse(cached)
        parsed.maps_embed_url = getSafeMapEmbedUrl(parsed.maps_embed_url)
        setConfig({ ...DEFAULT_SITE_CONFIG, ...parsed })
      }
    } catch {}

    // 2. Fetch live config from Supabase Storage
    fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          const merged = { ...DEFAULT_SITE_CONFIG, ...data }
          merged.maps_embed_url = getSafeMapEmbedUrl(merged.maps_embed_url)
          setConfig(merged)
          try {
            localStorage.setItem('mf_site_config', JSON.stringify(merged))
          } catch {}
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  return config
}

export type { SiteConfig }
export { DEFAULT_SITE_CONFIG, PUBLIC_SITE_CONFIG_STORAGE_URL }
