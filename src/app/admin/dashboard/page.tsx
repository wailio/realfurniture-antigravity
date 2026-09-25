'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Package,
  ArrowUpRight,
  Clock,
  Users,
  UserCheck,
  Zap,
  Globe,
} from 'lucide-react'

interface StatCard {
  label: string
  value: string | number
  sub: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  trend?: string
  trendUp?: boolean
  accent: string
}

// iOS frosted glass tokens
const GLASS = 'rgba(255, 255, 255, 0.065)'
const GLASS_BORDER = '1px solid rgba(255, 255, 255, 0.11)'
const GLASS_SHADOW = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)'
const GLASS_HOVER = 'rgba(255, 255, 255, 0.095)'

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date())
  const [counts, setCounts] = useState({
    visitors: 0, products: 0, orders: 0, leads: 0, unread: 0, loading: true,
  })

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, ordersRes, salesRes, visitorsRes] = await Promise.allSettled([
          fetch('/api/admin/products').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/orders').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/sales').then(r => r.ok ? r.json() : []),
          fetch('/api/analytics/visitors').then(r => r.ok ? r.json() : { todayUniqueVisitors: 0 }),
        ])
        const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
        const ords = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
        const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : []
        const visitorData = visitorsRes.status === 'fulfilled' ? visitorsRes.value : { todayUniqueVisitors: 0 }
        const unread = ords.filter((o: any) => o.status === 'new').length
        setCounts({ visitors: visitorData.todayUniqueVisitors ?? 0, products: prods.length, orders: ords.length, leads: sales.length, unread, loading: false })
      } catch {
        setCounts(prev => ({ ...prev, loading: false }))
      }
    }
    loadStats()
  }, [])

  const dayName = time.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })

  const stats: StatCard[] = [
    { label: 'Personnes aujourd\'hui', value: counts.loading ? '—' : counts.visitors, sub: 'Visiteurs réels (admin exclus)', icon: UserCheck, trend: 'Filtre actif', trendUp: true, accent: '#64D2FF' },
    { label: 'Commandes reçues', value: counts.loading ? '—' : counts.orders, sub: 'Via contact & commande', icon: ShoppingBag, trend: counts.orders > 0 ? `+${counts.orders}` : 'Actif', trendUp: true, accent: '#30D158' },
    { label: 'Leads actifs', value: counts.loading ? '—' : counts.leads, sub: 'Dans le funnel de vente', icon: TrendingUp, trend: counts.leads > 0 ? `${counts.leads} en cours` : 'Prêt', trendUp: true, accent: '#BF5AF2' },
    { label: 'Messages non lus', value: counts.loading ? '—' : counts.unread, sub: 'Demandes à traiter', icon: MessageSquare, trend: counts.unread > 0 ? 'Nouveau' : 'À jour', trendUp: counts.unread === 0, accent: '#FF9F0A' },
    { label: 'Produits en ligne', value: counts.loading ? '—' : counts.products, sub: 'Catalogue actif Supabase', icon: Package, trend: counts.products > 0 ? 'En ligne' : 'À init.', trendUp: counts.products > 0, accent: '#FF375F' },
    { label: 'Visiteurs uniques', value: counts.loading ? '—' : counts.visitors, sub: 'Clients ce mois-ci', icon: Users, trend: 'Hors équipe', trendUp: true, accent: '#64D2FF' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <style>{`
        .glass-card {
          background: ${GLASS};
          border: ${GLASS_BORDER};
          box-shadow: ${GLASS_SHADOW};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .glass-card:hover {
          background: ${GLASS_HOVER};
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.13);
          transform: translateY(-2px);
        }
        .glass-row {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .glass-row:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
          transform: translateX(3px);
        }
        .status-row {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 5px;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
      `}</style>

      {/* Page Header */}
      <div
        style={{
          background: 'rgba(10, 11, 12, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 300,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Tableau de bord
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
            Vue d&apos;ensemble et indicateurs clés
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date badge */}
          <div
            className="badge-pill"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <Clock style={{ width: 13, height: 13, opacity: 0.6 }} />
            <span>{dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
          </div>

          {/* Site en ligne badge */}
          <div
            className="badge-pill"
            style={{
              background: 'rgba(48, 209, 88, 0.12)',
              border: '1px solid rgba(48, 209, 88, 0.25)',
              color: '#30D158',
            }}
          >
            <span className="relative flex" style={{ width: 6, height: 6 }}>
              <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" style={{ borderRadius: 2 }} />
              <span className="relative inline-flex h-full w-full bg-emerald-400" style={{ borderRadius: 2 }} />
            </span>
            Site en ligne
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ borderRadius: 16, padding: '22px', position: 'relative', overflow: 'hidden' }}
            >
              {/* Subtle tinted glow top-left */}
              <div style={{
                position: 'absolute', top: -20, left: -20, width: 80, height: 80,
                background: s.accent, opacity: 0.06, borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${s.accent}18`,
                    border: `1px solid ${s.accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <s.icon style={{ width: 18, height: 18, color: s.accent }} />
                </div>
                <span
                  className="badge-pill"
                  style={{
                    background: s.trendUp ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.12)',
                    border: `1px solid ${s.trendUp ? 'rgba(48,209,88,0.25)' : 'rgba(255,59,48,0.25)'}`,
                    color: s.trendUp ? '#30D158' : '#FF3B30',
                    padding: '3px 9px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    gap: 3,
                  }}
                >
                  {s.trendUp && <ArrowUpRight style={{ width: 11, height: 11 }} />}
                  {s.trend}
                </span>
              </div>

              <p style={{ fontSize: 30, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
                {s.label}
              </p>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bottom 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* Quick Actions */}
          <div className="glass-card" style={{ borderRadius: 16, padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(100,210,255,0.12)', border: '1px solid rgba(100,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ width: 15, height: 15, color: '#64D2FF' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
                  Actions rapides
                </h2>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  Accès direct aux fonctionnalités
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { title: 'Gérer les produits', desc: 'Ajouter, modifier le prix ou les photos', href: '/admin/products', icon: Package, color: '#FF375F' },
                { title: 'Voir les commandes', desc: 'Consulter les demandes clients reçues', href: '/admin/orders', icon: ShoppingBag, color: '#30D158' },
                { title: 'Funnel de vente', desc: 'Suivre les leads jusqu\'à la livraison', href: '/admin/sales', icon: TrendingUp, color: '#BF5AF2' },
                { title: 'Infos du site', desc: 'Coordonnées, horaires, textes de présentation', href: '/admin/website-info', icon: Globe, color: '#FF9F0A' },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="glass-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: `${item.color}18`, border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon style={{ width: 14, height: 14, color: item.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>{item.title}</p>
                    <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
                  </div>
                  <ArrowUpRight style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Sync Status */}
          <div className="glass-card" style={{ borderRadius: 16, padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe style={{ width: 15, height: 15, color: '#30D158' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
                  État de synchronisation
                </h2>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  Supabase & Cloudflare
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Supabase PostgreSQL', sub: 'Connecté · Tables: products, messages, orders', dot: '#30D158', bg: 'rgba(48,209,88,0.08)', border: 'rgba(48,209,88,0.18)' },
                { label: 'Cloudflare Pages Edge', sub: 'SSR dynamique actif · Instant updates', dot: '#64D2FF', bg: 'rgba(100,210,255,0.08)', border: 'rgba(100,210,255,0.18)' },
                { label: 'Sécurité RLS', sub: 'Row Level Security activée avec clés d\'API', dot: '#BF5AF2', bg: 'rgba(191,90,242,0.08)', border: 'rgba(191,90,242,0.18)' },
              ].map((row, i) => (
                <div key={i} className="status-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, background: row.bg, border: `1px solid ${row.border}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: 99, background: row.dot, boxShadow: `0 0 6px ${row.dot}` }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{row.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
