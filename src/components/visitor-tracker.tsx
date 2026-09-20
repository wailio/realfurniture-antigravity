'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      // 1. If currently visiting any /admin route, permanently flag this browser as Admin
      if (pathname?.startsWith('/admin')) {
        localStorage.setItem('chateau_is_admin', 'true')
        document.cookie = 'chateau_admin=1; path=/; max-age=31536000; SameSite=Lax'
        return
      }

      // 2. If this browser is flagged as Admin or localhost, DO NOT COUNT!
      const isAdmin = localStorage.getItem('chateau_is_admin') === 'true'
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      if (isAdmin || isLocalhost) {
        return // Owner/Admin testing designs — excluded from visitor metrics!
      }

      // 3. For real external visitors: count unique session once per day
      const today = new Date().toISOString().slice(0, 10)
      const lastPing = sessionStorage.getItem('chateau_visit_logged')

      if (lastPing === today) {
        return // Already counted this visitor today
      }

      // Get or create persistent anonymous visitor ID
      let visitorId = localStorage.getItem('chateau_visitor_id')
      if (!visitorId) {
        visitorId = 'c_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
        localStorage.setItem('chateau_visitor_id', visitorId)
      }

      // Send lightweight heartbeat
      fetch('/api/analytics/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, isAdmin: false }),
      })
        .then(() => {
          sessionStorage.setItem('chateau_visit_logged', today)
        })
        .catch(() => {})
    } catch {
      // Silently fail if localStorage or fetch is disabled
    }
  }, [pathname])

  return null
}
