'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  RefreshCw,
} from 'lucide-react'

// ── Single accent — one color, flat, used sparingly ──────────────────────────
const ACCENT = '#C7CBD1'   // platinum — matches the brand
const LIVE   = '#34D399'   // only for the "live" status dot

// ── Funnel stages with real meaning colors, not rainbow decoration ────────────
const FUNNEL_STAGES = [
  { key: 'cold',       label: 'Prospect',      color: '#64748B' },
  { key: 'interested', label: 'Contacté',      color: '#F59E0B' },
  { key: 'delivering', label: 'En livraison',  color: '#60A5FA' },
  { key: 'completed',  label: 'Conclu',        color: '#34D399' },
]

type LeadCounts = Record<string, number>

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date())
  const [counts, setCounts] = useState({
    visitors: 0, products: 0, orders: 0, leads: 0, unread: 0, loading: true,
  })
  const [leadCounts, setLeadCounts] = useState<LeadCounts>({
    cold: 0, interested: 0, delivering: 0, completed: 0,
  })
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'status' | 'sources' | 'qualification'>('status')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setCounts(prev => ({ ...prev, loading: true }))
    try {
      const [prodRes, ordersRes, salesRes, visitorsRes] = await Promise.allSettled([
        fetch('/api/admin/products?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/admin/orders?t='  + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/admin/sales?t='   + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/analytics/visitors?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : { todayUniqueVisitors: 0 }),
      ])

      const prods       = prodRes.status === 'fulfilled'    && Array.isArray(prodRes.value)    ? prodRes.value    : []
      const ords        = ordersRes.status === 'fulfilled'  && Array.isArray(ordersRes.value)  ? ordersRes.value  : []
      const sales       = salesRes.status === 'fulfilled'   && Array.isArray(salesRes.value)   ? salesRes.value   : []
      const visitorData = visitorsRes.status === 'fulfilled' ? visitorsRes.value : { todayUniqueVisitors: 0 }

      const unread = ords.filter((o: Record<string, unknown>) => o.status === 'new').length

      const lc: LeadCounts = { cold: 0, interested: 0, delivering: 0, completed: 0 }
      sales.forEach((s: Record<string, unknown>) => {
        const stage = (s.funnel_stage as string) || 'cold'
        if (stage in lc)            lc[stage]++
        else if (stage === 'contacted') lc['interested']++
        else if (stage === 'won')       lc['completed']++
        else                            lc['cold']++
      })

      setLeadCounts(lc)
      setLeadsTotal(sales.length)
      setCounts({
        visitors: visitorData.todayUniqueVisitors ?? 0,
        products: prods.length,
        orders:   ords.length,
        leads:    sales.length,
        unread,
        loading: false,
      })
    } catch {
      setCounts(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    loadStats(false)
    const pollInterval = setInterval(() => loadStats(true), 30000) // reduced — Realtime handles the live part
    const onFunnelChange = () => loadStats(true)
    window.addEventListener('lead_funnel_updated', onFunnelChange)
    window.addEventListener('storage', onFunnelChange)
    window.addEventListener('focus',   onFunnelChange)
    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('lead_funnel_updated', onFunnelChange)
      window.removeEventListener('storage', onFunnelChange)
      window.removeEventListener('focus',   onFunnelChange)
    }
  }, [loadStats])

  // ── Supabase Realtime: visitor count updates live the moment a new visitor arrives ──
  const realtimeRef = useRef<any>(null)
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return

    const todayAlgiers = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' })

    import('@supabase/supabase-js').then(({ createClient }) => {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const channel = supabase
        .channel('visitor-count-live')
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'visitor_sessions',
            filter: `visit_date=eq.${todayAlgiers}`,
          },
          () => {
            // A new unique visitor arrived — increment count immediately
            setCounts(prev => ({ ...prev, visitors: prev.visitors + 1 }))
          }
        )
        .subscribe()

      realtimeRef.current = { supabase, channel }
    }).catch(() => {})

    return () => {
      if (realtimeRef.current) {
        const { supabase, channel } = realtimeRef.current
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const activeFunnelCount = (leadCounts.cold || 0) + (leadCounts.interested || 0) + (leadCounts.delivering || 0)

  // Date label: "Jeudi 2 octobre 2026"
  const dayLabel = time.toLocaleDateString('fr-DZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const N = (v: number) => v.toLocaleString('fr-FR')   // tabular number formatter

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await loadStats(false)
    setTimeout(() => setRefreshing(false), 600)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <style>{`
        /* ── Hairline border card — no drop shadow unless floating ── */
        .admin-card {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: border-color 0.2s ease;
        }
        .admin-card:hover { border-color: rgba(255,255,255,0.16); }

        /* ── Row inside a card — tighter radius, no shadow ── */
        .admin-row {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .admin-row:hover {
          background: rgba(255,255,255,0.065);
          border-color: rgba(255,255,255,0.13);
        }

        /* ── Tab pill ── */
        .adm-tab {
          padding: 4px 11px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          background: transparent;
          color: rgba(255,255,255,0.35);
        }
        .adm-tab:hover { color: rgba(255,255,255,0.6); }
        .adm-tab-active {
          background: rgba(255,255,255,0.11);
          color: #FFFFFF;
        }

        /* ── Progress bar ── */
        .pbar-track { height: 3px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; margin-top: 6px; }
        .pbar-fill  { height: 100%; border-radius: 99px; transition: width 0.55s cubic-bezier(0.32,0.72,0,1); }

        /* ── Tabular numbers ── */
        .tnum { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* ── Page header: flat, no gradient ──────────────────────────────────── */}
      <div style={{
        background: 'rgba(10,11,12,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px clamp(16px,3vw,28px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Left: title + period */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 18,
            fontWeight: 500,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Tableau de bord
          </h1>
          <p className="tnum" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}
          </p>
        </div>

        {/* Right: live dot + manual refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            onClick={handleManualRefresh}
            title="Actualiser"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: 4, display: 'flex',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13, transition: 'transform 0.5s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: LIVE, fontWeight: 500 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: LIVE, display: 'inline-block' }} />
            En ligne
          </span>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ padding: 'clamp(12px,2.5vw,22px) clamp(12px,3vw,28px)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_370px] gap-4 lg:gap-5">

          {/* ════ LEFT COLUMN ════════════════════════════════════════════════ */}
          <div className="order-1 lg:col-start-1 flex flex-col gap-4">

            {/* ── PRIMARY METRIC: big single number with context ──────────── */}
            {/* Visitors today = the most live / actionable number */}
            <div className="admin-card" style={{ borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Visiteurs aujourd&apos;hui
                  </p>
                  <p className="tnum" style={{
                    fontSize: 'clamp(36px,6vw,52px)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {counts.loading ? '—' : N(counts.visitors)}
                  </p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 6 }}>
                    Visiteurs uniques réels · filtre admin actif
                  </p>
                </div>
                <Link href="/admin/orders" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11.5, color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none', flexShrink: 0, marginTop: 2,
                  transition: 'color 0.15s',
                }}>
                  Commandes <ArrowUpRight style={{ width: 11, height: 11 }} />
                </Link>
              </div>

              {/* Secondary metrics in a tight row under the primary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                marginTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: 16,
              }}>
                {[
                  { label: 'Commandes',    value: counts.orders,   note: `${counts.unread > 0 ? counts.unread + ' non lus' : 'à jour'}`, href: '/admin/orders' },
                  { label: 'Leads actifs', value: activeFunnelCount, note: `${leadsTotal} total CRM`,                                     href: '/admin/sales' },
                  { label: 'Produits',     value: counts.products,  note: 'catalogue Supabase',                                           href: '/admin/products' },
                ].map((m, i) => (
                  <Link key={i} href={m.href} style={{ textDecoration: 'none', padding: '0 12px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <p className="tnum" style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
                      {counts.loading ? '—' : N(m.value)}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{m.label}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{counts.loading ? '...' : m.note}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Messages non lus — attention item ─────────────────────── */}
            {!counts.loading && counts.unread > 0 && (
              <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
                <div className="admin-card" style={{
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: 'rgba(245,158,11,0.28)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MessageSquare style={{ width: 14, height: 14, color: '#F59E0B', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#FFFFFF' }}>
                        {counts.unread} message{counts.unread > 1 ? 's' : ''} non lu{counts.unread > 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>
                        Demandes clients en attente
                      </span>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)' }} />
                </div>
              </Link>
            )}

            {/* ── Actions rapides ──────────────────────────────────────────── */}
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 2 }}>
                Navigation rapide
              </p>
              <div className="admin-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
                {[
                  { title: 'Produits',        desc: 'Gérer le catalogue · prix · photos',           href: '/admin/products',    icon: Package,     },
                  { title: 'Commandes',        desc: 'Demandes clients · messages reçus',            href: '/admin/orders',      icon: ShoppingBag, },
                  { title: 'Funnel de vente',  desc: 'Leads · suivi jusqu\'à la livraison',          href: '/admin/sales',       icon: TrendingUp,  },
                  { title: 'Infos du site',    desc: 'Coordonnées · horaires · textes',              href: '/admin/website-info',icon: Globe,       },
                ].map((item, idx, arr) => (
                  <Link key={idx} href={item.href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 16px',
                    textDecoration: 'none',
                    borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <item.icon style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>{item.title}</p>
                      <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
                    </div>
                    <ChevronRight style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Sync status — plain list, no colored tiles ───────────────── */}
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 2 }}>
                Infrastructure
              </p>
              <div className="admin-card" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Supabase PostgreSQL',   sub: 'Tables: products, messages, orders · RLS actif', status: true  },
                  { label: 'Cloudflare Pages Edge',  sub: 'SSR dynamique · déploiement auto sur push',      status: true  },
                  { label: 'Sécurité RLS',           sub: 'Service key encodée · accès admin sécurisé',     status: true  },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: row.status ? LIVE : '#FF3B30', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{row.label}</p>
                      <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN — Leads Management ════════════════════════════ */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <div className="admin-card" style={{ borderRadius: 12, padding: '18px 20px', position: 'sticky', top: 72 }}>

              {/* Header: plain label + count, no icon tile */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Leads</h2>
                  <p className="tnum" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {counts.loading ? '…' : `${leadsTotal} au total`}
                  </p>
                </div>
                <Link href="/admin/sales" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Voir CRM <ArrowUpRight style={{ width: 11, height: 11 }} />
                </Link>
              </div>

              {/* Tab strip */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 16, padding: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content' }}>
                {(['status', 'sources', 'qualification'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`adm-tab ${activeTab === tab ? 'adm-tab-active' : ''}`}>
                    {tab === 'status' ? 'Statut' : tab === 'sources' ? 'Sources' : 'Qualification'}
                  </button>
                ))}
              </div>

              {/* ── Status tab ── */}
              {activeTab === 'status' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {FUNNEL_STAGES.map(stage => {
                    const count = counts.loading ? 0 : (leadCounts[stage.key] ?? 0)
                    const pct   = leadsTotal > 0 ? Math.round((count / leadsTotal) * 100) : 0
                    return (
                      <div key={stage.key}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 6, height: 6, borderRadius: 99, background: stage.color, display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{stage.label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="tnum" style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                              {counts.loading ? '—' : count}
                            </span>
                            <span className="tnum" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', width: 28, textAlign: 'right' }}>
                              {counts.loading ? '' : `${pct}%`}
                            </span>
                          </div>
                        </div>
                        <div className="pbar-track">
                          <div className="pbar-fill" style={{ width: counts.loading ? '0%' : `${pct}%`, background: stage.color }} />
                        </div>
                      </div>
                    )
                  })}

                  {/* Total row */}
                  <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Total funnel</span>
                    <span className="tnum" style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      {counts.loading ? '—' : leadsTotal}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Sources tab ── */}
              {activeTab === 'sources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Formulaire contact', pct: 60, color: '#94A3B8' },
                    { label: 'WhatsApp / Direct',  pct: 25, color: '#94A3B8' },
                    { label: 'Visite Showroom',    pct: 15, color: '#94A3B8' },
                  ].map((src, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{src.label}</span>
                        <span className="tnum" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{src.pct}%</span>
                      </div>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: `${src.pct}%`, background: ACCENT }} />
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>Canaux d&apos;acquisition · estimé</p>
                </div>
              )}

              {/* ── Qualification tab ── */}
              {activeTab === 'qualification' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    {
                      label: 'Ventes conclues',
                      count: leadCounts.completed || 0,
                      pct:   leadsTotal > 0 ? Math.round(((leadCounts.completed || 0) / leadsTotal) * 100) : 0,
                      color: '#34D399',
                    },
                    {
                      label: 'En négociation',
                      count: (leadCounts.delivering || 0) + (leadCounts.interested || 0),
                      pct:   leadsTotal > 0 ? Math.round((((leadCounts.delivering || 0) + (leadCounts.interested || 0)) / leadsTotal) * 100) : 0,
                      color: '#60A5FA',
                    },
                    {
                      label: 'Prospects froids',
                      count: leadCounts.cold || 0,
                      pct:   leadsTotal > 0 ? Math.round(((leadCounts.cold || 0) / leadsTotal) * 100) : 0,
                      color: '#64748B',
                    },
                  ].map((q, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 99, background: q.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{q.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <span className="tnum" style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>{counts.loading ? '—' : q.count}</span>
                          <span className="tnum" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', width: 28, textAlign: 'right' }}>{counts.loading ? '' : `${q.pct}%`}</span>
                        </div>
                      </div>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: counts.loading ? '0%' : `${q.pct}%`, background: q.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
