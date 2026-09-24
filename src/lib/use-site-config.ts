'use client'

import { useState, useEffect } from 'react'
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
  PUBLIC_SITE_CONFIG_STORAGE_URL,
} from '@/lib/site-config'

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)

  useEffect(() => {
    let isMounted = true

    // 1. Instant local storage cache if available
    try {
      const cached = localStorage.getItem('chateau_site_config')
      if (cached) {
        setConfig({ ...DEFAULT_SITE_CONFIG, ...JSON.parse(cached) })
      }
    } catch {}

    // 2. Fetch live config from Supabase Storage
    fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          const merged = { ...DEFAULT_SITE_CONFIG, ...data }
          setConfig(merged)
          try {
            localStorage.setItem('chateau_site_config', JSON.stringify(merged))
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
