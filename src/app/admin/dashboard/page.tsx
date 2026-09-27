'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
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

// ── Exact Live Funnel Stages (matching /admin/sales CRM) ─────────────────────
const FUNNEL_STAGES = [
  { key: 'cold',       label: 'Prospect (Froid)',         shortLabel: 'Prospect',     color: '#94A3B8' },
  { key: 'interested', label: 'Intéressé & Contacté',     shortLabel: 'Contacté',     color: '#F59E0B' },
  { key: 'delivering', label: 'En Livraison / Montage',   shortLabel: 'En Livraison', color: '#60A5FA' },
  { key: 'completed',  label: 'Vente Conclue',            shortLabel: 'Conclue',      color: '#34D399' },
]

type LeadCounts = Record<string, number>

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date())
  const [counts, setCounts] = useState({
    visitors: 0, products: 0, orders: 0, leads: 0, unread: 0, loading: true,
  })
  const [leadCounts, setLeadCounts] = useState<LeadCounts>({
    cold: 0,
    interested: 0,
    delivering: 0,
    completed: 0,
  })
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'status' | 'sources' | 'qualification'>('status')

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  // Load stats function with support for silent background refresh
  const loadStats = useCallback(async (silent = false) => {
    if (!silent) {
      setCounts(prev => ({ ...prev, loading: true }))
    }
    try {
      const [prodRes, ordersRes, salesRes, visitorsRes] = await Promise.allSettled([
        fetch('/api/admin/products?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/admin/orders?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/admin/sales?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/analytics/visitors?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : { todayUniqueVisitors: 0 }),
      ])

      const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
      const ords = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
      const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : []
      const visitorData = visitorsRes.status === 'fulfilled' ? visitorsRes.value : { todayUniqueVisitors: 0 }

      const unread = ords.filter((o: Record<string, unknown>) => o.status === 'new').length

      // Count leads per live funnel stage in Supabase
      const lc: LeadCounts = { cold: 0, interested: 0, delivering: 0, completed: 0 }
      sales.forEach((s: Record<string, unknown>) => {
        const stage = (s.funnel_stage as string) || 'cold'
        if (stage in lc) {
          lc[stage]++
        } else if (stage === 'contacted') {
          lc['interested']++
        } else if (stage === 'won') {
          lc['completed']++
        } else {
          lc['cold']++
        }
      })

      setLeadCounts(lc)
      setLeadsTotal(sales.length)
      setCounts({
        visitors: visitorData.todayUniqueVisitors ?? 0,
        products: prods.length,
        orders: ords.length,
        leads: sales.length,
        unread,
        loading: false,
      })
    } catch {
      setCounts(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Real-time synchronization listeners
  useEffect(() => {
    loadStats(false)

    // 1. Regular poll every 3.5s to ensure background changes are synced
    const pollInterval = setInterval(() => {
      loadStats(true)
    }, 3500)

    // 2. Instant local and cross-tab event listeners (0ms update when moving lead)
    const onFunnelChange = () => {
      loadStats(true)
    }

    window.addEventListener('lead_funnel_updated', onFunnelChange)
    window.addEventListener('storage', onFunnelChange)
    window.addEventListener('focus', onFunnelChange)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('lead_funnel_updated', onFunnelChange)
      window.removeEventListener('storage', onFunnelChange)
      window.removeEventListener('focus', onFunnelChange)
    }
  }, [loadStats])

  const dayName = time.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })

  // Active leads in progress (excluding already completed ones)
  const activeFunnelCount = (leadCounts.cold || 0) + (leadCounts.interested || 0) + (leadCounts.delivering || 0)

  const stats = [
    { label: "Personnes", fullLabel: "Personnes aujourd'hui", value: counts.loading ? '—' : counts.visitors,  sub: 'Visiteurs réels (admin exclus)', icon: UserCheck,     trend: '→ Filtre actif', trendUp: true,  accent: '#64D2FF' },
    { label: 'Commandes', fullLabel: 'Commandes reçues',       value: counts.loading ? '—' : counts.orders,   sub: 'Via contact & commande',          icon: ShoppingBag,  trend: counts.orders > 0 ? `+${counts.orders}` : 'Actif', trendUp: true, accent: '#30D158' },
    { label: 'Leads',     fullLabel: 'Leads actifs',           value: counts.loading ? '—' : activeFunnelCount, sub: `${leadsTotal} total dans le CRM`, icon: TrendingUp,   trend: activeFunnelCount > 0 ? `${activeFunnelCount} en cours` : 'Prêt', trendUp: true, accent: '#BF5AF2' },
    { label: 'Messages',  fullLabel: 'Messages non lus',       value: counts.loading ? '—' : counts.unread,   sub: 'Demandes à traiter',              icon: MessageSquare, trend: counts.unread > 0 ? 'Nouveau' : 'À jour', trendUp: counts.unread === 0, accent: '#FF9F0A' },
    { label: 'Produits',  fullLabel: 'Produits en ligne',      value: counts.loading ? '—' : counts.products, sub: 'Catalogue actif Supabase',        icon: Package,      trend: counts.products > 0 ? '→ En ligne' : 'À init.', trendUp: counts.products > 0, accent: '#FF375F' },
    { label: 'Visiteurs', fullLabel: 'Visiteurs uniques',      value: counts.loading ? '—' : counts.visitors, sub: 'Clients ce mois-ci',              icon: Users,        trend: '→ Hors équipe', trendUp: true, accent: '#64D2FF' },
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
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 11.5px;
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
        .lead-bar-track { height: 6px; border-radius: 99px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .lead-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.6s cubic-bezier(0.32,0.72,0,1); }
      `}</style>

      {/* ── Page Header — BIG size ── */}
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

      <div style={{ padding: 'clamp(12px, 2.5vw, 24px) clamp(12px, 3vw, 28px)' }}>

        {/* ── RESPONSIVE GRID ── */}
        {/* On Mobile: order-1 (Stats), order-2 (Leads Management), order-3 (Actions), order-4 (Sync) */}
        {/* On PC: Left column (Stats, Actions, Sync) | Right column (Leads Management) */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-3.5 lg:gap-5">

          {/* ════ 1. STATS: 3 in a line (2 rows of 3) on mobile and desktop ════ */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col gap-2 sm:gap-2.5">
            {/* Row 1 — first 3 */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {stats.slice(0, 3).map((s, i) => <StatCard key={i} s={s} />)}
            </div>
            {/* Row 2 — last 3 */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {stats.slice(3).map((s, i) => <StatCard key={i} s={s} />)}
            </div>
          </div>

          {/* ════ 2. LEADS MANAGEMENT: Directly under stats on mobile, right column on desktop ════ */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <div className="glass-card" style={{ borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 80 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(191,90,242,0.12)', border: '1px solid rgba(191,90,242,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target style={{ width: 14, height: 14, color: '#BF5AF2' }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Leads Management</h2>
                    <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                      {counts.loading ? '...' : `${leadsTotal} lead${leadsTotal !== 1 ? 's' : ''} au total`}
                    </p>
                  </div>
                </div>
                <Link href="/admin/sales" style={{ fontSize: 11.5, color: '#BF5AF2', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Voir CRM <ArrowUpRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>

              {/* Tab Pills */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
                {(['status', 'sources', 'qualification'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`lm-tab ${activeTab === tab ? 'lm-tab-active' : 'lm-tab-idle'}`}>
                    {tab === 'status' ? 'Statut' : tab === 'sources' ? 'Sources' : 'Qualification'}
                  </button>
                ))}
              </div>

              {/* Status Tab — Live Funnel Stages & Real-Time Percentages */}
              {activeTab === 'status' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {FUNNEL_STAGES.map(stage => {
                    const count = counts.loading ? 0 : (leadCounts[stage.key] ?? 0)
                    const pct = leadsTotal > 0 ? Math.round((count / leadsTotal) * 100) : 0
                    return (
                      <div key={stage.key}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 7, height: 7, borderRadius: 99, background: stage.color, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${stage.color}` }} />
                            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>{stage.label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FFFFFF' }}>
                              {counts.loading ? '—' : `${count} lead${count > 1 ? 's' : ''}`}
                            </span>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: stage.color,
                                background: `${stage.color}18`,
                                border: `1px solid ${stage.color}35`,
                                borderRadius: 5,
                                padding: '1.5px 7px',
                                minWidth: 38,
                                textAlign: 'center',
                              }}
                            >
                              {counts.loading ? '—' : `${pct}%`}
                            </span>
                          </div>
                        </div>
                        <div className="lead-bar-track">
                          <div
                            className="lead-bar-fill"
                            style={{
                              width: counts.loading ? '0%' : `${pct}%`,
                              background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ marginTop: 4, padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>Total dans le funnel</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>{counts.loading ? '—' : leadsTotal}</span>
                  </div>
                </div>
              )}

              {/* Sources Tab */}
              {activeTab === 'sources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Formulaire contact', pct: 60, color: '#64D2FF' },
                    { label: 'WhatsApp / Direct',  pct: 25, color: '#30D158' },
                    { label: 'Visite Showroom',    pct: 15, color: '#FF9F0A' },
                  ].map((src, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 99, background: src.color, display: 'inline-block', boxShadow: `0 0 5px ${src.color}` }} />
                          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)' }}>{src.label}</span>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: src.color, background: `${src.color}18`, border: `1px solid ${src.color}30`, borderRadius: 5, padding: '1px 7px' }}>{src.pct}%</span>
                      </div>
                      <div className="lead-bar-track">
                        <div className="lead-bar-fill" style={{ width: `${src.pct}%`, background: `linear-gradient(90deg, ${src.color}99, ${src.color})` }} />
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 4, textAlign: 'center' }}>Canaux d'acquisition clients</p>
                </div>
              )}

              {/* Qualification Tab — Computed from real live stages */}
              {activeTab === 'qualification' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    {
                      label: 'Ventes conclues (Won)',
                      count: leadCounts.completed || 0,
                      pct: leadsTotal > 0 ? Math.round(((leadCounts.completed || 0) / leadsTotal) * 100) : 0,
                      color: '#34D399',
                    },
                    {
                      label: 'En négociation / Livraison',
                      count: (leadCounts.delivering || 0) + (leadCounts.interested || 0),
                      pct: leadsTotal > 0 ? Math.round((((leadCounts.delivering || 0) + (leadCounts.interested || 0)) / leadsTotal) * 100) : 0,
                      color: '#60A5FA',
                    },
                    {
                      label: 'Nouveaux prospects (Cold)',
                      count: leadCounts.cold || 0,
                      pct: leadsTotal > 0 ? Math.round(((leadCounts.cold || 0) / leadsTotal) * 100) : 0,
                      color: '#94A3B8',
                    },
                  ].map((q, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 99, background: q.color, display: 'inline-block', boxShadow: `0 0 5px ${q.color}` }} />
                          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)' }}>{q.label}</span>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: q.color, background: `${q.color}18`, border: `1px solid ${q.color}30`, borderRadius: 5, padding: '1px 7px' }}>
                          {counts.loading ? '—' : `${q.pct}%`}
                        </span>
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

          {/* ════ 3. ACTIONS RAPIDES: Under Leads Management on mobile, col 1 row 2 on desktop ════ */}
          <div className="order-3 lg:col-start-1 lg:row-start-2">
            <div className="glass-card" style={{ borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(100,210,255,0.12)', border: '1px solid rgba(100,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap style={{ width: 14, height: 14, color: '#64D2FF' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Actions rapides</h2>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Accès direct aux fonctionnalités</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { title: 'Gérer les produits',  desc: 'Ajouter, modifier le prix ou les photos',        href: '/admin/products',     icon: Package,     color: '#FF375F' },
                  { title: 'Voir les commandes',   desc: 'Consulter les demandes clients reçues',          href: '/admin/orders',       icon: ShoppingBag, color: '#30D158' },
                  { title: 'Funnel de vente',      desc: "Suivre les leads jusqu'à la livraison",         href: '/admin/sales',        icon: TrendingUp,  color: '#BF5AF2' },
                  { title: 'Infos du site',        desc: 'Coordonnées, horaires, textes de présentation', href: '/admin/website-info', icon: Globe,       color: '#FF9F0A' },
                ].map((item, idx) => (
                  <Link key={idx} href={item.href} className="glass-row" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 10, textDecoration: 'none' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${item.color}18`, border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          </div>

          {/* ════ 4. SYNC STATUS: Under Actions Rapides on mobile, col 1 row 3 on desktop ════ */}
          <div className="order-4 lg:col-start-1 lg:row-start-3">
            <div className="glass-card" style={{ borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe style={{ width: 14, height: 14, color: '#30D158' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>État de synchronisation</h2>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Supabase & Cloudflare</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Supabase PostgreSQL',   sub: 'Connecté · Tables: products, messages, orders', dot: '#30D158', bg: 'rgba(48,209,88,0.07)',   border: 'rgba(48,209,88,0.16)' },
                  { label: 'Cloudflare Pages Edge', sub: 'SSR dynamique actif · Instant updates',         dot: '#64D2FF', bg: 'rgba(100,210,255,0.07)', border: 'rgba(100,210,255,0.16)' },
                  { label: 'Sécurité RLS',          sub: "Row Level Security activée avec clés d'API",    dot: '#BF5AF2', bg: 'rgba(191,90,242,0.07)',   border: 'rgba(191,90,242,0.16)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: row.bg, border: `1px solid ${row.border}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: row.dot, boxShadow: `0 0 6px ${row.dot}`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{row.label}</p>
                      <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Stat Card: Compact 3-in-a-line on mobile, full detail on desktop ───────
function StatCard({ s }: {
  s: {
    label: string; fullLabel: string; value: string | number; sub: string
    icon: React.ComponentType<{ style?: React.CSSProperties }>
    trend?: string; trendUp?: boolean; accent: string
  }
}) {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: 11,
        padding: '9px 10px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 84,
      }}
    >
      <div style={{ position: 'absolute', top: -12, left: -12, width: 44, height: 44, background: s.accent, opacity: 0.08, borderRadius: '50%', filter: 'blur(12px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${s.accent}18`, border: `1px solid ${s.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <s.icon style={{ width: 12, height: 12, color: s.accent }} />
        </div>
        {s.trend && (
          <span className="hidden sm:inline-flex" style={{ background: s.trendUp ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.12)', border: `1px solid ${s.trendUp ? 'rgba(48,209,88,0.25)' : 'rgba(255,59,48,0.25)'}`, color: s.trendUp ? '#30D158' : '#FF3B30', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {s.trend}
          </span>
        )}
      </div>

      <div>
        <p style={{ fontSize: 'clamp(17px, 3.8vw, 22px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: 'var(--font-heading)' }}>{s.value}</p>
        <p style={{ fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 500, color: 'rgba(255,255,255,0.84)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span className="sm:hidden">{s.label}</span>
          <span className="hidden sm:inline">{s.fullLabel}</span>
        </p>
        <p className="hidden sm:block" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.sub}</p>
      </div>
    </div>
  )
}
