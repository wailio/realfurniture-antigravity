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
  Sliders,
  Sun,
  Moon,
} from 'lucide-react'
import { useAdminTheme } from '@/contexts/theme-context'

interface NavItem {
  label: string
  href: string
  icon: any
  permKey?: 'dashboard' | 'products' | 'website-info' | 'orders' | 'sales' | 'users'
  adminOnly?: boolean
}

const NAV: { group: string | null; items: NavItem[] }[] = [
  {
    group: null,
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permKey: 'dashboard' },
    ],
  },
  {
    group: 'Structure',
    items: [
      { label: 'Produits', href: '/admin/products', icon: Package, permKey: 'products' },
      { label: 'Infos site', href: '/admin/website-info', icon: Globe, permKey: 'website-info' },
    ],
  },
  {
    group: 'Suivi',
    items: [
      { label: 'Commandes', href: '/admin/orders', icon: ShoppingBag, permKey: 'orders' },
      { label: 'Ventes', href: '/admin/sales', icon: TrendingUp, permKey: 'sales' },
      { label: 'Cold Lead choices', href: '/admin/cold-leads', icon: Sliders, permKey: 'sales' },
    ],
  },
  {
    group: 'Accès',
    items: [
      { label: 'Utilisateurs', href: '/admin/users', icon: Users2, permKey: 'users', adminOnly: true },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isDark, toggleTheme } = useAdminTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    username: string
    role: string
    displayName: string
    permissions?: string[]
  }>({
    username: 'admin',
    role: 'admin',
    displayName: 'Admin',
    permissions: ['dashboard', 'products', 'orders', 'sales', 'website-info', 'users'],
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
    el.style.border = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0'
    el.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'
    el.style.color = isDark ? '#FFFFFF' : '#0F172A'
    el.style.boxShadow = 'none'
  }
  function removeHover(el: HTMLElement, keepActive: boolean) {
    if (keepActive) return
    el.style.border = '1px solid transparent'
    el.style.background = 'transparent'
    el.style.color = isDark ? 'rgba(235,235,245,0.6)' : '#64748B'
    el.style.boxShadow = 'none'
  }

  function hasItemAccess(item: NavItem) {
    if (currentUser.role === 'developer' || currentUser.username === 'wailio' || currentUser.username === 'toweradmin') {
      return true
    }
    const perms = Array.isArray(currentUser.permissions) ? currentUser.permissions : []
    if (item.adminOnly || item.permKey === 'users') {
      return perms.includes('users')
    }
    if (item.permKey) {
      return perms.includes(item.permKey)
    }
    return true
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────
          MOBILE TOP BAR (Visible only on small screens < md)
         ───────────────────────────────────────────────────────────────── */}
      <header
        className="flex md:hidden items-center justify-between px-4 h-14 shrink-0 sticky top-0 z-40 border-b"
        style={{
          background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-xl active:scale-95 transition-all"
          style={{
            color: isDark ? '#FFFFFF' : '#0F172A',
            background: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          }}
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src={isDark ? '/taskbarlogo-white.png' : '/taskbarlogo.png'}
            alt="M&F Meubles"
            width={130}
            height={30}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        {/* User Pill / Logout on mobile header */}
        <button
          type="button"
          onClick={confirmLogout}
          className="flex items-center justify-center w-9 h-9 rounded-xl active:scale-95 transition-all"
          style={{
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            background: isDark ? '#2C2C2E' : '#F1F5F9',
            color: isDark ? '#FFFFFF' : '#0F172A',
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
          className={`fixed inset-0 z-50 md:hidden backdrop-blur-xs transition-opacity duration-300 ${isDark ? 'bg-black/60' : 'bg-slate-900/40'}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:hidden w-[280px] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{
          fontFamily: 'var(--font-body)',
          background: isDark ? '#1C1C1E' : '#FAFAFB',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between h-16 px-5"
          style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB' }}
        >
          <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center">
            <Image
              src={isDark ? '/taskbarlogo-white.png' : '/taskbarlogo.png'}
              alt="M&F Meubles"
              width={130}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav links (auto-closes on click) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map((section, si) => {
            const visibleItems = section.items.filter(hasItemAccess)
            if (visibleItems.length === 0) return null
            return (
              <div key={si} className="mb-3">
                {section.group && (
                  <p
                    className="text-[10px] font-bold tracking-wider uppercase px-3 py-2"
                    style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }}
                  >
                    {section.group}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1"
                      style={{
                        background: active
                          ? isDark ? 'rgba(255,255,255,0.12)' : '#0F172A'
                          : 'transparent',
                        color: active ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                        border: active
                          ? isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #0F172A'
                          : '1px solid transparent',
                        boxShadow: active && !isDark ? '0 2px 6px rgba(15,23,42,0.12)' : 'none',
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      <item.icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: active ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}
                      />
                      <span>{item.label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Drawer Bottom */}
        <div
          className="p-3 space-y-2"
          style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB' }}
        >
          {(currentUser.role === 'developer' || currentUser.username === 'wailio' || currentUser.username === 'toweradmin') && (
            <Link
              href="/admin/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: isSettingsActive
                  ? isDark ? 'rgba(255,255,255,0.12)' : '#0F172A'
                  : 'transparent',
                color: isSettingsActive ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                border: isSettingsActive
                  ? isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #0F172A'
                  : '1px solid transparent',
                fontWeight: isSettingsActive ? 600 : 500,
              }}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Paramètres</span>
            </Link>
          )}

          {/* Theme Toggle — mobile drawer */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            style={{
              width: '100%',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 12,
              borderRadius: 12,
              background: 'transparent',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              cursor: 'pointer',
              color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
              transition: 'all 0.2s ease',
              marginBottom: 6,
            }}
          >
            {isDark
              ? <Sun style={{ width: 16, height: 16, flexShrink: 0 }} />
              : <Moon style={{ width: 16, height: 16, flexShrink: 0 }} />
            }
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {isDark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>

          <div
            onClick={confirmLogout}
            className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors"
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              background: isDark ? '#2C2C2E' : '#FFFFFF',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
              style={{ background: '#0F172A', color: '#FFFFFF' }}
            >
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
              >
                {currentUser.displayName || 'Admin'}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}
              >
                {currentUser.role === 'developer' ? 'Développeur' : 'Administrateur'}
              </p>
            </div>
            <LogOut className={`w-4 h-4 ${loggingOut ? 'text-red-500' : ''}`} style={{ color: loggingOut ? '#FF453A' : '#94A3B8' }} />
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (Visible only on screens >= md)
         ───────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 72 : 252,
          background: isDark ? '#1C1C1E' : '#FAFAFB',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'background 0.3s ease, border-color 0.3s ease, width 0.3s ease',
        }}
      >
        {/* Logo / Collapse */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: 72,
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          }}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors mx-auto"
              style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}
              aria-label="Ouvrir le menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Link href="/admin/dashboard" className="flex items-center">
                <Image
                  src={isDark ? '/taskbarlogo-white.png' : '/taskbarlogo.png'}
                  alt="M&F Meubles"
                  width={130}
                  height={30}
                  className="h-7 w-auto object-contain cursor-pointer"
                  priority
                />
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors ml-2"
                style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }}
                aria-label="Collapse sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1" style={{ padding: '16px 0' }}>
          {NAV.map((section, si) => {
            const visibleItems = section.items.filter(hasItemAccess)
            if (visibleItems.length === 0) return null
            return (
              <div key={si}>
                {section.group && !collapsed && (
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8',
                      textTransform: 'uppercase',
                      padding: '16px 20px 6px',
                    }}
                  >
                    {section.group}
                  </p>
                )}
                {section.group && collapsed && (
                  <div
                    style={{
                      height: 1,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                      margin: '12px 10px',
                    }}
                  />
                )}
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className="flex items-center gap-3 transition-all duration-200 group"
                      style={{
                        padding: collapsed ? '9px 0' : '9px 14px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        margin: '2px 10px',
                        borderRadius: 12,
                        border: active
                          ? isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #0F172A'
                          : '1px solid transparent',
                        background: active
                          ? isDark ? 'rgba(255,255,255,0.12)' : '#0F172A'
                          : 'transparent',
                        color: active ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                        boxShadow: active && !isDark ? '0 2px 6px rgba(15,23,42,0.12)' : 'none',
                        textDecoration: 'none',
                        fontWeight: active ? 600 : 500,
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
                        style={{
                          width: 17,
                          height: 17,
                          color: active ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                        }}
                      />
                      {!collapsed && (
                        <span
                          style={{
                            fontSize: 13,
                            letterSpacing: '-0.01em',
                            transition: 'color 0.15s',
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                      {!collapsed && active && (
                        <div
                          className="ml-auto"
                          style={{ width: 5, height: 5, borderRadius: 99, background: '#FFFFFF' }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Bottom Block */}
        <div
          style={{
            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            padding: '12px 10px',
          }}
        >
          {/* Settings */}
          {(currentUser.role === 'developer' || currentUser.username === 'wailio' || currentUser.username === 'toweradmin') && (
            <Link
              href="/admin/settings"
              title={collapsed ? 'Paramètres' : undefined}
              className="flex items-center gap-3"
              style={{
                padding: collapsed ? '9px 0' : '9px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12,
                border: isSettingsActive
                  ? isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #0F172A'
                  : '1px solid transparent',
                background: isSettingsActive
                  ? isDark ? 'rgba(255,255,255,0.12)' : '#0F172A'
                  : 'transparent',
                color: isSettingsActive ? '#FFFFFF' : isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                boxShadow: isSettingsActive && !isDark ? '0 2px 6px rgba(15,23,42,0.12)' : 'none',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                fontWeight: isSettingsActive ? 600 : 500,
                margin: '2px 0',
              }}
              onMouseEnter={(e) => { if (!isSettingsActive) applyHover(e.currentTarget as HTMLElement) }}
              onMouseLeave={(e) => { if (!isSettingsActive) removeHover(e.currentTarget as HTMLElement, false) }}
            >
              <Settings style={{ width: 17, height: 17, flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 13, letterSpacing: '-0.01em' }}>Paramètres</span>}
            </Link>
          )}

          {/* Theme Toggle — desktop sidebar */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            style={{
              width: '100%',
              padding: collapsed ? '9px 0' : '9px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 12,
              borderRadius: 12,
              background: 'transparent',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              cursor: 'pointer',
              color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
              transition: 'all 0.2s ease',
              marginBottom: 6,
              marginTop: 4,
            }}
          >
            {isDark
              ? <Sun style={{ width: 17, height: 17, flexShrink: 0 }} />
              : <Moon style={{ width: 17, height: 17, flexShrink: 0 }} />
            }
            {!collapsed && (
              <span style={{ fontSize: 13, letterSpacing: '-0.01em', fontWeight: 500 }}>
                {isDark ? 'Mode clair' : 'Mode sombre'}
              </span>
            )}
          </button>

          {/* Account row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '9px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              background: isDark ? '#2C2C2E' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,23,42,0.03)',
            }}
            onClick={confirmLogout}
            title="Se déconnecter"
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: 99, flexShrink: 0,
                background: '#0F172A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#FFFFFF', fontWeight: 700,
              }}
            >
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser.displayName || 'Admin'}
                  </p>
                  <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 1, fontWeight: 500 }}>
                    {currentUser.role === 'developer' ? 'Développeur' : 'Administrateur'}
                  </p>
                </div>
                <LogOut
                  style={{
                    width: 14,
                    height: 14,
                    color: loggingOut ? '#FF453A' : '#94A3B8',
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                />
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
            className={`absolute inset-0 backdrop-blur-xs transition-opacity duration-300 ${isDark ? 'bg-black/60' : 'bg-slate-900/40'}`}
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Action Sheet */}
          <div
            className="relative w-full mx-4 mb-6 md:mb-0 md:w-[340px] flex flex-col gap-2.5 z-10"
            style={{ maxWidth: 380, animation: 'iosSheetIn 0.38s cubic-bezier(0.32, 0.72, 0, 1) both' }}
          >
            {/* Main card */}
            <div
              style={{
                background: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 50px rgba(15,23,42,0.15)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
              }}
            >
              {/* Title + message */}
              <div
                style={{
                  padding: '18px 20px 14px',
                  textAlign: 'center',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginBottom: 4 }}>
                  Se déconnecter ?
                </p>
                <p style={{ fontSize: 12.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', lineHeight: 1.5 }}>
                  Vous allez quitter l&apos;espace admin. Vous devrez vous reconnecter pour accéder à nouveau au tableau de bord.
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
                  fontSize: 16,
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
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDark
                    ? 'rgba(255,69,58,0.1)'
                    : '#FEF2F2'
                }}
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
                padding: '16px 20px',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: isDark ? '#FFFFFF' : '#0F172A',
                background: isDark ? '#2C2C2E' : '#FFFFFF',
                borderRadius: 18,
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: isDark ? 'none' : '0 4px 16px rgba(15,23,42,0.06)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#3A3A3C' : '#F8FAFC'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#2C2C2E' : '#FFFFFF'
              }}
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
