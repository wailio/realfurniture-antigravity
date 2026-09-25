'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Globe,
  ShoppingBag,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const NAV = [
  {
    group: null,
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Structure',
    items: [
      { label: 'Produits', href: '/admin/products', icon: Package },
      { label: 'Infos site', href: '/admin/website-info', icon: Globe },
    ],
  },
  {
    group: 'Suivi',
    items: [
      { label: 'Commandes', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Ventes', href: '/admin/sales', icon: TrendingUp },
    ],
  },
]

// Shared frosted glass hover state for all sidebar items
const HOVER_STYLE = {
  border: '1px solid rgba(255, 255, 255, 0.14)',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  color: '#FFFFFF',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 12px rgba(0,0,0,0.3)',
}

const REST_STYLE = {
  border: '1px solid transparent',
  background: 'transparent',
  color: '#8E929B',
  boxShadow: 'none',
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; displayName: string }>({
    username: 'admin',
    role: 'admin',
    displayName: 'Admin',
  })

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_user')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch {}

    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user)
          try {
            sessionStorage.setItem('admin_user', JSON.stringify(data.user))
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('admin_auth')
        sessionStorage.removeItem('admin_user')
      } catch {}
      window.location.href = '/admin/login'
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const isSettingsActive = pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')

  function applyHover(el: HTMLElement) {
    el.style.border = HOVER_STYLE.border
    el.style.background = HOVER_STYLE.background
    el.style.color = HOVER_STYLE.color
    el.style.boxShadow = HOVER_STYLE.boxShadow
  }
  function removeHover(el: HTMLElement, keepActive: boolean) {
    if (keepActive) return
    el.style.border = REST_STYLE.border
    el.style.background = REST_STYLE.background
    el.style.color = REST_STYLE.color
    el.style.boxShadow = REST_STYLE.boxShadow
  }

  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 72 : 248,
        background: '#0A0B0C',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo / Collapse */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 72,
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              borderRadius: 10,
              border: '1px solid transparent',
              background: 'transparent',
              color: '#8E929B',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => applyHover(e.currentTarget as HTMLElement)}
            onMouseLeave={e => removeHover(e.currentTarget as HTMLElement, false)}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Image
              src="/bigtower.png"
              alt="Château d'art"
              width={120}
              height={29}
              className="h-7 w-auto object-contain"
              priority
            />
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid transparent',
                background: 'transparent',
                color: '#8E929B',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
              }}
              onMouseEnter={e => applyHover(e.currentTarget as HTMLElement)}
              onMouseLeave={e => removeHover(e.currentTarget as HTMLElement, false)}
            >
              <ChevronRight style={{ width: 14, height: 14, transform: 'rotate(180deg)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '16px 0' }}>
        {NAV.map((section, si) => (
          <div key={si}>
            {section.group && !collapsed && (
              <p
                style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
                  color: '#4A4D55', textTransform: 'uppercase', padding: '16px 20px 6px',
                }}
              >
                {section.group}
              </p>
            )}
            {section.group && collapsed && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 10px' }} />
            )}
            {section.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className="flex items-center gap-3 transition-all duration-200 group"
                  style={{
                    padding: collapsed ? '9px 0' : '9px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    margin: '3px 10px',
                    borderRadius: 10,
                    border: active ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                    background: active
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
                      : 'transparent',
                    color: active ? '#FFFFFF' : '#8E929B',
                    boxShadow: active
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4)'
                      : 'none',
                    transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                  }}
                  onMouseEnter={(e) => { if (!active) applyHover(e.currentTarget as HTMLElement) }}
                  onMouseLeave={(e) => { if (!active) removeHover(e.currentTarget as HTMLElement, false) }}
                >
                  <item.icon
                    className="shrink-0"
                    style={{ width: 17, height: 17, color: active ? '#FFFFFF' : 'inherit', transition: 'color 0.15s' }}
                  />
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: 13.5, fontWeight: active ? 500 : 400,
                        letterSpacing: '0.01em', transition: 'color 0.15s',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                  {!collapsed && (
                    <div
                      className={`ml-auto transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      style={{ width: 4, height: 4, borderRadius: 99, background: '#FFFFFF' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Block */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 10px' }}>
        {/* Settings */}
        <Link
          href="/admin/settings"
          title={collapsed ? 'Paramètres' : undefined}
          className="flex items-center gap-3"
          style={{
            padding: collapsed ? '9px 0' : '9px 16px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10,
            border: isSettingsActive ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
            background: isSettingsActive
              ? 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
              : 'transparent',
            color: isSettingsActive ? '#FFFFFF' : '#8E929B',
            boxShadow: isSettingsActive ? 'inset 0 1px 0 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
            textDecoration: 'none',
            margin: '2px 0',
          }}
          onMouseEnter={(e) => { if (!isSettingsActive) applyHover(e.currentTarget as HTMLElement) }}
          onMouseLeave={(e) => { if (!isSettingsActive) removeHover(e.currentTarget as HTMLElement, false) }}
        >
          <Settings style={{ width: 17, height: 17, flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 13.5, fontWeight: isSettingsActive ? 500 : 400, letterSpacing: '0.01em' }}>Paramètres</span>}
        </Link>

        {/* Account row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            padding: collapsed ? '9px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            marginTop: 6,
            borderRadius: 10,
            border: '1px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
          }}
          onMouseEnter={(e) => applyHover(e.currentTarget as HTMLElement)}
          onMouseLeave={(e) => removeHover(e.currentTarget as HTMLElement, false)}
          onClick={handleLogout}
          title="Se déconnecter"
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 99, flexShrink: 0,
              background: currentUser.role === 'developer'
                ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                : 'linear-gradient(135deg, #2A2B2E 0%, #1A1B1E 100%)',
              border: currentUser.role === 'developer'
                ? '1px solid rgba(209, 170, 92, 0.35)'
                : '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: currentUser.role === 'developer' ? '#d1aa5c' : '#C7CBD1', fontWeight: 600,
            }}
          >
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.92)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.displayName || 'Admin'}
                </p>
                <p style={{ fontSize: 11, color: currentUser.role === 'developer' ? '#d1aa5c' : 'rgba(255,255,255,0.4)', marginTop: 1, fontWeight: 500 }}>
                  {currentUser.role === 'developer' ? 'Développeur (Accès Total)' : 'Administrateur'}
                </p>
              </div>
              <LogOut style={{ width: 14, height: 14, color: loggingOut ? '#f87171' : 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'color 0.2s' }} />
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
