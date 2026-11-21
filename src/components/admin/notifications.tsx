'use client'

/**
 * AdminNotifications — in-app live alert system
 * Uses the browser's native Supabase anon key (public, read-only scoped via RLS).
 * Listens for INSERT on the `messages` table → shows a toast.
 * Mounts inside AdminLayout so it runs on every admin page.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Phone, MessageSquare } from 'lucide-react'
import { useAdminTheme } from '@/contexts/theme-context'

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
  const { isDark } = useAdminTheme()
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

      const client = createClient(supabaseUrl, supabaseKey)
      const channel = client
        .channel('admin-realtime-orders')
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload: any) => {
            const row = payload.new
            if (!row) return

            // Audio ping if browser allows
            try {
              const audio = new Audio('/sounds/notification.mp3')
              audio.volume = 0.4
              audio.play().catch(() => {})
            } catch {}

            addToast({
              id: row.id || String(Date.now()),
              name: row.name || 'Client Showroom',
              phone: row.phone || '',
              product: row.product || row.subject || undefined,
              subject: row.subject,
              type: row.product ? 'cold_lead' : 'order',
              at: new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
            })
          }
        )
        .subscribe()

      channelRef.current = { client, channel }
    }).catch(() => {})

    return () => {
      mountedRef.current = false
      if (channelRef.current) {
        channelRef.current.client.removeChannel(channelRef.current.channel)
      }
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'all',
            background: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '14px 16px',
            width: 330,
            boxShadow: isDark
              ? '0 16px 40px -8px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0,0,0,0.3)'
              : '0 16px 40px -8px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
            animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isDark ? '#2C2C2E' : '#F1F5F9',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <MessageSquare style={{ width: 16, height: 16, color: isDark ? '#FFFFFF' : '#0F172A' }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#30D158' : '#047857', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Nouvelle Demande
              </p>
              <span style={{ fontSize: 10, color: isDark ? 'rgba(235, 235, 245, 0.4)' : '#94A3B8', flexShrink: 0 }}>{toast.at}</span>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: '4px 0 2px' }}>
              {toast.name}
            </p>

            {toast.phone && (
              <p style={{ fontSize: 12, color: isDark ? 'rgba(235, 235, 245, 0.6)' : '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Phone style={{ width: 11, height: 11, color: isDark ? 'rgba(235, 235, 245, 0.4)' : '#94A3B8' }} />
                {toast.phone}
              </p>
            )}

            {toast.product && (
              <p style={{ fontSize: 12, color: isDark ? 'rgba(235, 235, 245, 0.6)' : '#475569', margin: '4px 0 0', lineHeight: 1.4 }}>
                Modèle :{' '}
                <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 600 }}>
                  {toast.product}
                </strong>
              </p>
            )}

            <a
              href="/admin/orders"
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 11.5,
                fontWeight: 600,
                color: isDark ? '#FFFFFF' : '#0F172A',
                textDecoration: 'none',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #CBD5E1',
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
              color: isDark ? 'rgba(235, 235, 245, 0.4)' : '#94A3B8',
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
