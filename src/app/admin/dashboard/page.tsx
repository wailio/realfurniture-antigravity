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
  Users,
  UserCheck,
  Zap,
  Globe,
  Target,
  ChevronRight,
} from 'lucide-react'

const GLASS = 'rgba(255, 255, 255, 0.065)'
const GLASS_BORDER = '1px solid rgba(255, 255, 255, 0.11)'
const GLASS_SHADOW = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)'
const GLASS_HOVER = 'rgba(255, 255, 255, 0.095)'

const FUNNEL_STAGES = [
  { key: 'cold',      label: 'Open',        color: '#64D2FF' },
  { key: 'contacted', label: 'In Progress', color: '#FF9F0A' },
  { key: 'lost',      label: 'Lost',        color: '#FF453A' },
  { key: 'won',       label: 'Won',         color: '#30D158' },
]

type LeadCounts = Record<string, number>

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date())
  const [counts, setCounts] = useState({
    visitors: 0, products: 0, orders: 0, leads: 0, unread: 0, loading: true,
  })
  const [leadCounts, setLeadCounts] = useState<LeadCounts>({ cold: 0, contacted: 0, lost: 0, won: 0 })
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'status' | 'sources' | 'qualification'>('status')

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, ordersRes, salesRes, visitorsRes] = await Promise.allSettled([
          fetch('/api/admin/products', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
          fetch('/api/admin/orders', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
          fetch('/api/admin/sales', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
          fetch('/api/analytics/visitors', { cache: 'no-store' }).then(r => r.ok ? r.json() : { todayUniqueVisitors: 0 }),
        ])
        const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
        const ords = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
        const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : []
        const visitorData = visitorsRes.status === 'fulfilled' ? visitorsRes.value : { todayUniqueVisitors: 0 }
        const unread = ords.filter((o: Record<string, unknown>) => o.status === 'new').length
        const lc: LeadCounts = { cold: 0, contacted: 0, lost: 0, won: 0 }
        sales.forEach((s: Record<string, unknown>) => {
          const stage = (s.funnel_stage as string) || 'cold'
          if (stage in lc) lc[stage]++
        })
        setLeadCounts(lc)
        setLeadsTotal(sales.length)
        setCounts({ visitors: visitorData.todayUniqueVisitors ?? 0, products: prods.length, orders: ords.length, leads: sales.length, unread, loading: false })
      } catch {
        setCounts(prev => ({ ...prev, loading: false }))
      }
    }
    loadStats()
  }, [])

  const dayName = time.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })

  const stats = [
    { label: "Personnes aujourd'hui", value: counts.loading ? '—' : counts.visitors,  sub: 'Visiteurs réels (admin exclus)', icon: UserCheck,     trend: '→ Filtre actif', trendUp: true,  accent: '#64D2FF' },
    { label: 'Commandes reçues',       value: counts.loading ? '—' : counts.orders,   sub: 'Via contact & commande',          icon: ShoppingBag,  trend: counts.orders > 0 ? `+${counts.orders}` : 'Actif', trendUp: true, accent: '#30D158' },
    { label: 'Leads actifs',           value: counts.loading ? '—' : counts.leads,    sub: 'Dans le funnel de vente',         icon: TrendingUp,   trend: counts.leads > 0 ? `${counts.leads} en cours` : 'Prêt', trendUp: true, accent: '#BF5AF2' },
    { label: 'Messages non lus',       value: counts.loading ? '—' : counts.unread,   sub: 'Demandes à traiter',              icon: MessageSquare, trend: counts.unread > 0 ? 'Nouveau' : 'À jour', trendUp: counts.unread === 0, accent: '#FF9F0A' },
    { label: 'Produits en ligne',      value: counts.loading ? '—' : counts.products, sub: 'Catalogue actif Supabase',        icon: Package,      trend: counts.products > 0 ? '→ En ligne' : 'À init.', trendUp: counts.products > 0, accent: '#FF375F' },
    { label: 'Visiteurs uniques',      value: counts.loading ? '—' : counts.visitors, sub: 'Clients ce mois-ci',              icon: Users,        trend: '→ Hors équipe', trendUp: true, accent: '#64D2FF' },
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
        .lm-tab {
          padding: 5px 13px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.32,0.72,0,1);
          white-space: nowrap;
        }
        .lm-tab-active {
          background: rgba(255,255,255,0.14);
          color: #FFFFFF;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3);
        }
        .lm-tab-idle {
          background: transparent;
          color: rgba(255,255,255,0.38);
        }
        .lm-tab-idle:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.05); }
        .lead-bar-track { height: 5px; border-radius: 99px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .lead-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.7s cubic-bezier(0.32,0.72,0,1); }
      `}</style>

      {/* ── Page Header — BIG size restored ── */}
      <div
        style={{
          background: 'rgba(10, 11, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: 'clamp(16px, 2vw, 22px) clamp(16px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 400,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Tableau de bord
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>
            Vue d&apos;ensemble et indicateurs clés
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }} className="hidden sm:inline">
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
          </span>
          <span style={{ fontSize: 12, color: '#30D158', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#30D158', display: 'inline-block', boxShadow: '0 0 8px #30D158' }} />
            En ligne
          </span>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px, 2.5vw, 26px) clamp(14px, 3vw, 28px)' }}>

        {/* ── MAIN 2-COL LAYOUT ── */}
        {/* Left col: 6 small stat cards (3+3) + Actions + Sync | Right col: Leads Management */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]" style={{ gap: 18 }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── 6 Stat cards: 3 + 3 in two rows of 3 ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Row 1 — first 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 10 }}>
                {stats.slice(0, 3).map((s, i) => <StatCard key={i} s={s} />)}
              </div>
              {/* Row 2 — last 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 10 }}>
                {stats.slice(3).map((s, i) => <StatCard key={i} s={s} />)}
              </div>
            </div>

            {/* ── Actions rapides ── */}
            <div className="glass-card" style={{ borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(100,210,255,0.12)', border: '1px solid rgba(100,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap style={{ width: 14, height: 14, color: '#64D2FF' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Actions rapides</h2>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Accès direct aux fonctionnalités</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { title: 'Gérer les produits',  desc: 'Ajouter, modifier le prix ou les photos',        href: '/admin/products',     icon: Package,     color: '#FF375F' },
                  { title: 'Voir les commandes',   desc: 'Consulter les demandes clients reçues',          href: '/admin/orders',       icon: ShoppingBag, color: '#30D158' },
                  { title: 'Funnel de vente',      desc: "Suivre les leads jusqu'à la livraison",         href: '/admin/sales',        icon: TrendingUp,  color: '#BF5AF2' },
                  { title: 'Infos du site',        desc: 'Coordonnées, horaires, textes de présentation', href: '/admin/website-info', icon: Globe,       color: '#FF9F0A' },
                ].map((item, idx) => (
                  <Link key={idx} href={item.href} className="glass-row" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, textDecoration: 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${item.color}18`, border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon style={{ width: 13, height: 13, color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.33)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
                    </div>
                    <ChevronRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* ── État de synchronisation ── */}
            <div className="glass-card" style={{ borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe style={{ width: 14, height: 14, color: '#30D158' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>État de synchronisation</h2>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Supabase & Cloudflare</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Supabase PostgreSQL',   sub: 'Connecté · Tables: products, messages, orders', dot: '#30D158', bg: 'rgba(48,209,88,0.07)',   border: 'rgba(48,209,88,0.16)' },
                  { label: 'Cloudflare Pages Edge', sub: 'SSR dynamique actif · Instant updates',         dot: '#64D2FF', bg: 'rgba(100,210,255,0.07)', border: 'rgba(100,210,255,0.16)' },
                  { label: 'Sécurité RLS',          sub: "Row Level Security activée avec clés d'API",    dot: '#BF5AF2', bg: 'rgba(191,90,242,0.07)',   border: 'rgba(191,90,242,0.16)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: row.bg, border: `1px solid ${row.border}` }}>
                    <div style={{ width: 7, height: 7, borderRadius: 99, background: row.dot, boxShadow: `0 0 6px ${row.dot}`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{row.label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: Leads Management ════ */}
          <div className="glass-card" style={{ borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', alignSelf: 'start', position: 'sticky', top: 80 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(191,90,242,0.12)', border: '1px solid rgba(191,90,242,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target style={{ width: 14, height: 14, color: '#BF5AF2' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Leads Management</h2>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                    {counts.loading ? '...' : `${leadsTotal} lead${leadsTotal !== 1 ? 's' : ''} au total`}
                  </p>
                </div>
              </div>
              <Link href="/admin/sales" style={{ fontSize: 11.5, color: '#BF5AF2', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                Voir tout <ArrowUpRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            {/* Tab Pills */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 18, padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
              {(['status', 'sources', 'qualification'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`lm-tab ${activeTab === tab ? 'lm-tab-active' : 'lm-tab-idle'}`}>
                  {tab === 'status' ? 'Statut' : tab === 'sources' ? 'Sources' : 'Qualification'}
                </button>
              ))}
            </div>

            {/* Status Tab */}
            {activeTab === 'status' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {FUNNEL_STAGES.map(stage => {
                  const count = counts.loading ? 0 : (leadCounts[stage.key] ?? 0)
                  const pct = leadsTotal > 0 ? Math.round((count / leadsTotal) * 100) : 0
                  return (
                    <div key={stage.key}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 99, background: stage.color, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 5px ${stage.color}` }} />
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.80)' }}>{stage.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{counts.loading ? '—' : `${count} leads`}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: stage.color, background: `${stage.color}18`, border: `1px solid ${stage.color}30`, borderRadius: 5, padding: '2px 8px', minWidth: 38, textAlign: 'center' }}>
                            {counts.loading ? '—' : `${pct}%`}
                          </span>
                        </div>
                      </div>
                      <div className="lead-bar-track">
                        <div className="lead-bar-fill" style={{ width: counts.loading ? '0%' : `${pct}%`, background: `linear-gradient(90deg, ${stage.color}99, ${stage.color})` }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ marginTop: 6, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Total dans le funnel</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>{counts.loading ? '—' : leadsTotal}</span>
                </div>
              </div>
            )}

            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Formulaire contact', pct: 58, color: '#64D2FF' },
                  { label: 'WhatsApp / Direct',  pct: 28, color: '#30D158' },
                  { label: 'Référence client',   pct: 14, color: '#FF9F0A' },
                ].map((src, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: src.color, display: 'inline-block', boxShadow: `0 0 5px ${src.color}` }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.80)' }}>{src.label}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: src.color, background: `${src.color}18`, border: `1px solid ${src.color}30`, borderRadius: 5, padding: '2px 8px' }}>{src.pct}%</span>
                    </div>
                    <div className="lead-bar-track">
                      <div className="lead-bar-fill" style={{ width: `${src.pct}%`, background: `linear-gradient(90deg, ${src.color}99, ${src.color})` }} />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4, textAlign: 'center' }}>À connecter au champ source dans orders</p>
              </div>
            )}

            {/* Qualification Tab */}
            {activeTab === 'qualification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Qualifié',      pct: leadsTotal > 0 ? Math.round(((leadCounts.contacted ?? 0) + (leadCounts.won ?? 0)) / leadsTotal * 100) : 0, color: '#30D158' },
                  { label: 'En évaluation', pct: leadsTotal > 0 ? Math.round((leadCounts.cold ?? 0) / leadsTotal * 100) : 0, color: '#FF9F0A' },
                  { label: 'Non qualifié',  pct: leadsTotal > 0 ? Math.round((leadCounts.lost ?? 0) / leadsTotal * 100) : 0, color: '#FF453A' },
                ].map((q, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: q.color, display: 'inline-block', boxShadow: `0 0 5px ${q.color}` }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.80)' }}>{q.label}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: q.color, background: `${q.color}18`, border: `1px solid ${q.color}30`, borderRadius: 5, padding: '2px 8px' }}>{counts.loading ? '—' : `${q.pct}%`}</span>
                    </div>
                    <div className="lead-bar-track">
                      <div className="lead-bar-fill" style={{ width: counts.loading ? '0%' : `${q.pct}%`, background: `linear-gradient(90deg, ${q.color}99, ${q.color})` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ s }: {
  s: {
    label: string; value: string | number; sub: string
    icon: React.ComponentType<{ style?: React.CSSProperties }>
    trend?: string; trendUp?: boolean; accent: string
  }
}) {
  return (
    <div className="glass-card" style={{ borderRadius: 12, padding: '12px 13px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 96 }}>
      <div style={{ position: 'absolute', top: -15, left: -15, width: 60, height: 60, background: s.accent, opacity: 0.08, borderRadius: '50%', filter: 'blur(16px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.accent}18`, border: `1px solid ${s.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <s.icon style={{ width: 14, height: 14, color: s.accent }} />
        </div>
        {s.trend && (
          <span style={{ background: s.trendUp ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.12)', border: `1px solid ${s.trendUp ? 'rgba(48,209,88,0.25)' : 'rgba(255,59,48,0.25)'}`, color: s.trendUp ? '#30D158' : '#FF3B30', padding: '2px 6px', borderRadius: 4, fontSize: 9.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {s.trend}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{s.value}</p>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.82)', marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</p>
        <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.sub}</p>
      </div>
    </div>
  )
}
