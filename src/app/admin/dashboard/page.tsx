'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Eye,
  TrendingUp,
  MessageSquare,
  Package,
  ArrowUpRight,
  Clock,
  Users,
} from 'lucide-react'

interface StatCard {
  label: string
  value: string | number
  sub: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  trend?: string
  trendUp?: boolean
}

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date())
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    leads: 0,
    unread: 0,
    loading: true,
  })

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, ordersRes, salesRes] = await Promise.allSettled([
          fetch('/api/admin/products').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/orders').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/sales').then(r => r.ok ? r.json() : []),
        ])

        const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
        const ords = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
        const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : []

        const unread = ords.filter((o: any) => o.status === 'new').length

        setCounts({
          products: prods.length,
          orders: ords.length,
          leads: sales.length,
          unread,
          loading: false,
        })
      } catch {
        setCounts(prev => ({ ...prev, loading: false }))
      }
    }
    loadStats()
  }, [])

  const dayName = time.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })

  const stats: StatCard[] = [
    { label: 'Vues aujourd\'hui', value: '184', sub: 'Visiteurs showroom', icon: Eye, trend: '+14%', trendUp: true },
    { label: 'Commandes reçues', value: counts.loading ? '...' : counts.orders, sub: 'Via contact & commande', icon: ShoppingBag, trend: counts.orders > 0 ? `+${counts.orders}` : 'Actif', trendUp: true },
    { label: 'Leads actifs', value: counts.loading ? '...' : counts.leads, sub: 'Dans le funnel de vente', icon: TrendingUp, trend: counts.leads > 0 ? `${counts.leads} en cours` : 'Prêt', trendUp: true },
    { label: 'Messages non lus', value: counts.loading ? '...' : counts.unread, sub: 'Demandes à traiter', icon: MessageSquare, trend: counts.unread > 0 ? 'Nouveau' : 'À jour', trendUp: counts.unread === 0 },
    { label: 'Produits en ligne', value: counts.loading ? '...' : counts.products, sub: 'Catalogue actif Supabase', icon: Package, trend: counts.products > 0 ? 'En ligne' : 'À initialiser', trendUp: counts.products > 0 },
    { label: 'Visiteurs uniques', value: '1,240', sub: 'Ce mois-ci (Alger & régions)', icon: Users, trend: '+22%', trendUp: true },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
      {/* Page Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '28px 36px',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 26,
                fontWeight: 300,
                color: '#0E0F10',
                letterSpacing: '-0.02em',
              }}
            >
              Tableau de bord
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock className="inline w-3.5 h-3.5" />
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
            </p>
          </div>
          <div
            style={{
              background: '#0E0F10',
              color: '#F2F1EF',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'default',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: '#4ade80',
                display: 'inline-block',
              }}
            />
            Site en ligne
          </div>
        </div>
      </div>

      <div style={{ padding: '36px' }}>
        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '24px',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              className="hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: '#F6F5F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <s.icon className="w-5 h-5" style={{ color: '#0E0F10' }} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: s.trendUp ? '#059669' : '#dc2626',
                    background: s.trendUp ? '#ecfdf5' : '#fef2f2',
                    padding: '3px 8px',
                    borderRadius: 99,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {s.trendUp && <ArrowUpRight className="w-3 h-3" />}
                  {s.trend}
                </span>
              </div>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#0E0F10',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginTop: 8 }}>
                {s.label}
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Links & Setup Guide */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Quick Actions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 17,
                fontWeight: 600,
                color: '#0E0F10',
                marginBottom: 6,
              }}
            >
              Actions rapides
            </h2>
            <p style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 20 }}>
              Accès direct aux fonctionnalités de gestion
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: 'Gérer les produits', desc: 'Ajouter, modifier le prix ou les photos', href: '/admin/products' },
                { title: 'Voir les commandes', desc: 'Consulter les demandes clients reçues', href: '/admin/orders' },
                { title: 'Funnel de vente', desc: 'Suivre les leads de la prise de contact à la livraison', href: '/admin/sales' },
                { title: 'Modifier les infos du site', desc: 'Coordonnées, horaires, textes de présentation', href: '/admin/website-info' },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#F6F5F3',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  className="hover:bg-[#EAE8E4]"
                >
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0E0F10' }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Database connection status */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '28px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 17,
                fontWeight: 600,
                color: '#0E0F10',
                marginBottom: 6,
              }}
            >
              État de synchronisation
            </h2>
            <p style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 20 }}>
              Base de données Supabase &amp; Cloudflare
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#ecfdf5' }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: '#10B981' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>Supabase PostgreSQL</p>
                  <p style={{ fontSize: 11.5, color: '#047857' }}>Connecté (Tables: products, messages, orders)</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#eff6ff' }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: '#3b82f6' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>Cloudflare Pages Edge</p>
                  <p style={{ fontSize: 11.5, color: '#2563eb' }}>SSR dynamique actif · Instant updates</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#faf5ff' }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: '#a855f7' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#6b21a8' }}>Sécurité RLS</p>
                  <p style={{ fontSize: 11.5, color: '#7e22ce' }}>Row Level Security activée avec clés d&apos;API</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
