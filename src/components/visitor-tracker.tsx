'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Generates a persistent anonymous device ID stored in localStorage
function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem('chateau_visitor_id')
    if (!id) {
      // Crypto-quality random ID: 'c_' + 16 random hex chars + timestamp base36
      const arr = new Uint8Array(8)
      crypto.getRandomValues(arr)
      const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
      id = `c_${hex}${Date.now().toString(36)}`
      localStorage.setItem('chateau_visitor_id', id)
    }
    return id
  } catch {
    // Fallback if localStorage blocked (private mode etc.)
    return `c_anon_${Date.now().toString(36)}`
  }
}

export function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Never run on admin pages
    if (!pathname || pathname.startsWith('/admin')) {
      // When visiting admin, flag this browser as admin so visitor count won't be inflated
      try {
        localStorage.setItem('chateau_is_admin', 'true')
      } catch {}
      return
    }

    try {
      // Skip if flagged as admin
      const isAdmin = localStorage.getItem('chateau_is_admin') === 'true'
      if (isAdmin) return

      // Skip on localhost / dev
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return

      // Only ping once per device per calendar day
      // We store 'YYYY-MM-DD' in localStorage (persists across tabs & sessions)
      const today = new Date().toISOString().slice(0, 10)
      const lastLogged = localStorage.getItem('chateau_last_visit_date')
      if (lastLogged === today) return // Already counted this device today

      const visitorId = getOrCreateVisitorId()

      fetch('/api/analytics/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, isAdmin: false }),
        // Don't block page rendering
        keepalive: true,
      })
        .then(res => {
          if (res.ok) {
            // Mark today as logged so we don't re-ping on next page navigation
            try { localStorage.setItem('chateau_last_visit_date', today) } catch {}
          }
        })
        .catch(() => {})
    } catch {
      // Silently handle any localStorage / fetch errors
    }
  }, [pathname])

  return null
}
