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
  Menu,
  X,
  Users2,
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
  {
    group: 'Accès',
    items: [
      { label: 'Utilisateurs', href: '/admin/users', icon: Users2, adminOnly: true },
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; displayName: string }>({
    username: 'admin',
    role: 'admin',
    displayName: 'Admin',
  })

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent background scrolling when mobile drawer is open OR confirm is shown
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileOpen || showLogoutConfirm) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen, showLogoutConfirm])

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

  // Show iOS action-sheet confirm instead of logging out immediately
  function confirmLogout() {
    setMobileOpen(false)
    setTimeout(() => setShowLogoutConfirm(true), 50)
  }

  async function handleLogout() {
    setShowLogoutConfirm(false)
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
    <>
      {/* ─────────────────────────────────────────────────────────────────
          MOBILE TOP BAR (Visible only on small screens < md)
         ───────────────────────────────────────────────────────────────── */}
      <header
        className="flex md:hidden items-center justify-between px-4 h-14 shrink-0 sticky top-0 z-40"
        style={{
          background: 'rgba(10, 11, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg active:scale-95 transition-all text-[#C7CBD1] hover:text-white hover:bg-white/5 border border-white/5"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src="/bigtower.png"
            alt="Château d'art"
            width={105}
            height={25}
            className="h-6 w-auto object-contain"
            priority
          />
        </Link>

        {/* User Pill / Logout on mobile header */}
        <button
          type="button"
          onClick={confirmLogout}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/80 active:scale-95 transition-all"
          style={{
            background: currentUser.role === 'developer'
              ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
              : 'linear-gradient(135deg, #2A2B2E 0%, #1A1B1E 100%)',
            borderColor: currentUser.role === 'developer' ? 'rgba(209, 170, 92, 0.4)' : 'rgba(255,255,255,0.12)',
            color: currentUser.role === 'developer' ? '#d1aa5c' : '#FFFFFF',
          }}
          title="Se déconnecter"
        >
          <span className="text-xs font-bold">
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
          </span>
        </button>
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          MOBILE DRAWER OVERLAY (Slides in over the screen on < md)
         ───────────────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:hidden w-[280px] bg-[#0A0B0C] border-r border-white/10 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <Image
            src="/bigtower.png"
            alt="Château d'art"
            width={120}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8E929B] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav links (auto-closes on click) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map((section, si) => (
            <div key={si} className="mb-3">
              {section.group && (
                <p className="text-[10px] font-semibold tracking-wider text-[#4A4D55] uppercase px-3 py-2">
                  {section.group}
                </p>
              )}
              {section.items.filter(item => !('adminOnly' in item && item.adminOnly) || currentUser.role === 'admin' || currentUser.role === 'developer').map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1"
                    style={{
                      background: active
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
                        : 'transparent',
                      color: active ? '#FFFFFF' : '#8E929B',
                      border: active ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                      boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4)' : 'none',
                    }}
                  >
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: active ? '#d1aa5c' : '#8E929B' }} />
                    <span>{item.label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d1aa5c]" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Drawer Bottom */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <Link
            href="/admin/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{
              background: isSettingsActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: isSettingsActive ? '#FFFFFF' : '#8E929B',
              border: isSettingsActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
            }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Paramètres</span>
          </Link>

          <div
            onClick={confirmLogout}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
              style={{
                background: currentUser.role === 'developer'
                  ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                  : 'linear-gradient(135deg, #2A2B2E 0%, #1A1B1E 100%)',
                color: currentUser.role === 'developer' ? '#d1aa5c' : '#C7CBD1',
                border: currentUser.role === 'developer' ? '1px solid rgba(209, 170, 92, 0.4)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.displayName || 'Admin'}</p>
              <p className="text-[10px] text-[#d1aa5c] truncate">
                {currentUser.role === 'developer' ? 'Développeur' : 'Administrateur'}
              </p>
            </div>
            <LogOut className={`w-4 h-4 ${loggingOut ? 'text-red-400' : 'text-white/40'}`} />
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (Visible only on screens >= md)
         ───────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 transition-all duration-300"
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
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 text-[#B7BBC0]" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Link href="/admin/dashboard" className="flex items-center">
                <Image
                  src="/bigtower.png"
                  alt="Château d'art"
                  width={120}
                  height={29}
                  className="h-7 w-auto object-contain cursor-pointer"
                  priority
                />
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5 transition-colors ml-2"
                aria-label="Collapse sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#4A4D55] rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1" style={{ padding: '16px 0' }}>
          {NAV.map((section, si) => (
            <div key={si}>
              {section.group && !collapsed && (
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: '#4A4D55',
                    textTransform: 'uppercase',
                    padding: '16px 20px 6px',
                  }}
                >
                  {section.group}
                </p>
              )}
              {section.group && collapsed && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 10px' }} />
              )}
              {section.items.filter(item => !('adminOnly' in item && item.adminOnly) || currentUser.role === 'admin' || currentUser.role === 'developer').map((item) => {
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
                      margin: '2px 10px',
                      borderRadius: 10,
                      border: active ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                      background: active
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
                        : 'transparent',
                      color: active ? '#FFFFFF' : '#8E929B',
                      boxShadow: active
                        ? 'inset 0 1px 0 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4)'
                        : 'none',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) applyHover(e.currentTarget as HTMLElement)
                    }}
                    onMouseLeave={(e) => {
                      if (!active) removeHover(e.currentTarget as HTMLElement, false)
                    }}
                  >
                    <item.icon
                      className="shrink-0 transition-colors"
                      style={{ width: 17, height: 17, color: active ? '#FFFFFF' : '#8E929B' }}
                    />
                    {!collapsed && (
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: active ? 500 : 400,
                          letterSpacing: '0.01em',
                          transition: 'color 0.15s',
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
            onClick={confirmLogout}
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

      {/* ─────────────────────────────────────────────────────────────────
          iOS-STYLE LOGOUT CONFIRMATION ACTION SHEET
         ───────────────────────────────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {/* Scrim */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Action Sheet */}
          <div
            className="relative w-full mx-4 mb-6 md:mb-0 md:w-[340px] flex flex-col gap-2.5"
            style={{ maxWidth: 380, animation: 'iosSheetIn 0.38s cubic-bezier(0.32, 0.72, 0, 1) both' }}
          >
            {/* Main card */}
            <div
              style={{
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              {/* Title + message */}
              <div
                style={{
                  padding: '18px 20px 14px',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                  Se déconnecter ?
                </p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  Vous allez quitter l'espace admin. Vous devrez vous reconnecter pour accéder à nouveau au tableau de bord.
                </p>
              </div>

              {/* Confirm (Destructive) */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#FF453A',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.08)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <LogOut style={{ width: 18, height: 18 }} />
                {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>

            {/* Cancel button — separate pill, iOS style */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                width: '100%',
                padding: '17px 20px',
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.09)',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(44,44,46,0.98)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(28,28,30,0.95)' }}
            >
              Annuler
            </button>
          </div>

          <style>{`
            @keyframes iosSheetIn {
              from { opacity: 0; transform: translateY(30px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)    scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
