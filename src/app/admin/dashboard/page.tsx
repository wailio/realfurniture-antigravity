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

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const dayName = time.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })

  const stats: StatCard[] = [
    { label: 'Vues aujourd\'hui', value: '—', sub: 'Analytics à configurer', icon: Eye, trend: '+0%', trendUp: true },
    { label: 'Commandes reçues', value: '—', sub: 'Cette semaine', icon: ShoppingBag, trend: '—', trendUp: true },
    { label: 'Leads actifs', value: '—', sub: 'Dans le funnel', icon: TrendingUp, trend: '—', trendUp: true },
    { label: 'Messages non lus', value: '—', sub: 'À traiter', icon: MessageSquare, trend: '—', trendUp: false },
    { label: 'Produits en ligne', value: '—', sub: 'Catalogue actif', icon: Package, trend: '—', trendUp: true },
    { label: 'Visiteurs uniques', value: '—', sub: 'Ce mois-ci', icon: Users, trend: '—', trendUp: true },
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
                    fontWeight: 500,
                    color: s.trendUp ? '#16a34a' : '#dc2626',
                    background: s.trendUp ? '#f0fdf4' : '#fef2f2',
                    padding: '3px 8px',
                    borderRadius: 99,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  {s.trend}
                </span>
              </div>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#0E0F10',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  marginBottom: 4,
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 13.5, color: '#0E0F10', fontWeight: 500, marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Setup Notice */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '28px 32px',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div className="flex items-center justify-between">
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 17,
                fontWeight: 400,
                color: '#0E0F10',
                letterSpacing: '-0.01em',
              }}
            >
              Configuration requise
            </h2>
            <span
              style={{
                fontSize: 11,
                color: '#92400e',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '4px 10px',
                borderRadius: 99,
                fontWeight: 500,
              }}
            >
              En attente
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                step: '1',
                title: 'Créer un projet Supabase',
                detail: 'Aller sur supabase.com → New project → copier URL + clés API',
                done: false,
              },
              {
                step: '2',
                title: 'Remplir .env.local',
                detail: 'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY',
                done: false,
              },
              {
                step: '3',
                title: 'Créer les tables SQL',
                detail: 'Exécuter le script SQL fourni dans Supabase → SQL Editor',
                done: false,
              },
              {
                step: '4',
                title: 'Activer Row Level Security',
                detail: 'Les politiques RLS sont incluses dans le script SQL',
                done: false,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4"
                style={{
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: '#F6F5F3',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: item.done ? '#0E0F10' : 'transparent',
                    border: `2px solid ${item.done ? '#0E0F10' : '#D1D5DB'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: item.done ? '#fff' : '#9CA3AF',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p style={{ fontSize: 13.5, color: '#0E0F10', fontWeight: 500 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', paddingTop: 4 }}>
            Une fois configuré, toutes les métriques se mettront à jour automatiquement en temps réel.
          </p>
        </div>
      </div>
    </div>
  )
}
