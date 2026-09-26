'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Generates a persistent anonymous device ID stored in localStorage
function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem('chateau_visitor_id')
    if (!id) {
      const arr = new Uint8Array(8)
      crypto.getRandomValues(arr)
      const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
      id = `c_${hex}${Date.now().toString(36)}`
      localStorage.setItem('chateau_visitor_id', id)
    }
    return id
  } catch {
    return `c_anon_${Date.now().toString(36)}`
  }
}

export function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Never track admin pages
    if (!pathname || pathname.startsWith('/admin')) {
      return
    }

    try {
      // Clean up any legacy poison flag
      if (localStorage.getItem('chateau_is_admin')) {
        localStorage.removeItem('chateau_is_admin')
      }

      // Check if user has an active admin_session cookie
      const hasAdminCookie = document.cookie.includes('admin_session=')
      if (hasAdminCookie) {
        return
      }

      // Skip on localhost
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
        return
      }

      // 1 person per device per calendar day
      // Checked in localStorage so even multiple visits or tab opens only count 1 time
      const today = new Date().toISOString().slice(0, 10)
      const lastLogged = localStorage.getItem('chateau_last_visit_date')
      if (lastLogged === today) {
        return // Already counted this device today
      }

      const visitorId = getOrCreateVisitorId()

      fetch('/api/analytics/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, isAdmin: false }),
        keepalive: true,
      })
        .then(res => {
          if (res.ok) {
            try {
              localStorage.setItem('chateau_last_visit_date', today)
            } catch {}
          }
        })
        .catch(() => {})
    } catch {
      // Silently handle any browser restrictions
    }
  }, [pathname])

  return null
}
