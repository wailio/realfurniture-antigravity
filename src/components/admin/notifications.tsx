'use client'

/**
 * AdminNotifications — in-app live alert system
 * Uses the browser's native Supabase anon key (public, read-only scoped via RLS).
 * Listens for INSERT on the `messages` table → shows a toast.
 * Mounts inside AdminLayout so it runs on every admin page.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Phone, MessageSquare } from 'lucide-react'

interface Notification {
  id: string
  name: string
  phone: string
  product?: string
  subject?: string
  type: 'order' | 'cold_lead'
  at: string
}

export default function AdminNotifications() {
  const [toasts, setToasts] = useState<Notification[]>([])
  const channelRef = useRef<any>(null)
  const mountedRef = useRef(true)

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((n: Notification) => {
    if (!mountedRef.current) return
    setToasts(prev => [n, ...prev].slice(0, 5)) // max 5 toasts
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (mountedRef.current) dismiss(n.id)
    }, 10000)
  }, [dismiss])

  useEffect(() => {
    mountedRef.current = true

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return

    // Dynamically import supabase client to avoid SSR issues
    import('@supabase/supabase-js').then(({ createClient }) => {
      if (!mountedRef.current) return

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Subscribe to new rows on the messages table (contact form submissions)
      const channel = supabase
        .channel('admin-notifications')
        .on(
          'postgres_changes' as any,
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload: any) => {
            const row = payload.new
            if (!row) return
            addToast({
              id: row.id || String(Date.now()),
              name: row.name || 'Client',
              phone: row.phone || '',
              product: row.product || undefined,
              subject: row.subject || undefined,
              type: 'order',
              at: new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
            })
          }
        )
        .subscribe()

      channelRef.current = { supabase, channel }
    }).catch(err => {
      console.warn('[AdminNotifications] Failed to init realtime:', err)
    })

    return () => {
      mountedRef.current = false
      if (channelRef.current) {
        const { supabase, channel } = channelRef.current
        supabase.removeChannel(channel)
      }
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
      aria-live="polite"
      aria-label="Notifications admin"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'all',
            background: 'rgba(10, 11, 14, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(209, 170, 92, 0.35)',
            borderRadius: 12,
            padding: '14px 16px',
            width: 320,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(209,170,92,0.1)',
            animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(209,170,92,0.12)',
              border: '1px solid rgba(209,170,92,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <MessageSquare style={{ width: 16, height: 16, color: '#d1aa5c' }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#d1aa5c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Nouvelle Demande
              </p>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{toast.at}</span>
            </div>

            <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: '4px 0 2px' }}>
              {toast.name}
            </p>

            {toast.phone && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Phone style={{ width: 11, height: 11 }} />
                {toast.phone}
              </p>
            )}

            {toast.product && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Modèle :{' '}
                <strong
                  style={{
                    color: '#FFFFFF',
                    background: 'linear-gradient(180deg, transparent 45%, rgba(245,158,11,0.38) 45%)',
                    padding: '0 2px',
                  }}
                >
                  {toast.product}
                </strong>
              </p>
            )}

            <a
              href="/admin/orders"
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 11,
                fontWeight: 600,
                color: '#d1aa5c',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(209,170,92,0.4)',
                lineHeight: 1.2,
              }}
            >
              Voir les commandes →
            </a>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              color: 'rgba(255,255,255,0.3)',
              flexShrink: 0,
              lineHeight: 0,
            }}
            aria-label="Fermer"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
