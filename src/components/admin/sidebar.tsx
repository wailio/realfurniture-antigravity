'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

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
      {/* Logo */}
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
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5 transition-colors ml-2"
              aria-label="Collapse sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#4A4D55] rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1" style={{ padding: '16px 0' }}>
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
            {section.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className="flex items-center gap-3 transition-all duration-150 group"
                  style={{
                    padding: collapsed ? '9px 0' : '9px 20px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    margin: '2px 8px',
                    borderRadius: 10,
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: active ? '#F2F1EF' : '#7C8089',
                  }}
                >
                  <item.icon
                    className="shrink-0 transition-colors"
                    style={{ width: 17, height: 17, color: active ? '#F2F1EF' : '#7C8089' }}
                  />
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: active ? 500 : 400,
                        letterSpacing: '0.01em',
                        color: active ? '#F2F1EF' : '#7C8089',
                        transition: 'color 0.15s',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                  {active && !collapsed && (
                    <div
                      className="ml-auto"
                      style={{ width: 4, height: 4, borderRadius: 99, background: '#C7CBD1' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Block */}
      <div
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 8px' }}
      >
        {/* Settings */}
        <Link
          href="/admin/settings"
          title={collapsed ? 'Paramètres' : undefined}
          className="flex items-center gap-3 transition-all duration-150"
          style={{
            padding: collapsed ? '9px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10,
            color: '#7C8089',
          }}
        >
          <Settings style={{ width: 17, height: 17 }} />
          {!collapsed && (
            <span style={{ fontSize: 13.5, letterSpacing: '0.01em' }}>Paramètres</span>
          )}
        </Link>

        {/* Account */}
        {!collapsed && (
          <div
            className="flex items-center gap-3"
            style={{
              padding: '10px 12px',
              marginTop: 4,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 99,
                background: 'linear-gradient(135deg, #2A2B2E 0%, #1A1B1E 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                color: '#C7CBD1',
                fontWeight: 600,
              }}
            >
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, color: '#D4D6DA', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin
              </p>
              <p style={{ fontSize: 11, color: '#4A4D55', marginTop: 1 }}>Manager</p>
            </div>
            <button
              onClick={() => { window.location.href = '/admin' }}
              title="Se déconnecter"
              className="hover:text-white transition-colors"
              style={{ color: '#4A4D55', padding: 4 }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {collapsed && (
          <button
            title="Se déconnecter"
            className="flex items-center justify-center w-full hover:bg-white/5 transition-colors"
            style={{ padding: '9px 0', borderRadius: 10, color: '#4A4D55' }}
          >
            <LogOut style={{ width: 17, height: 17 }} />
          </button>
        )}
      </div>
    </aside>
  )
}
