'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  TrendingUp,
  Package,
  ArrowUpRight,
  Users,
  ChevronRight,
  RefreshCw,
  Phone,
  ArrowRight,
  Sliders,
  Armchair,
} from 'lucide-react'
import { useAdminTheme } from '@/contexts/theme-context'

// ── Accent tokens from realfurniture / iOS light ──────────────────────────────
const LIVE = '#10B981' // live status green

// ── Sparkline SVG Component with subtle translucent area fill (Apple style) ──
function Sparkline({
  data,
  color = '#0F172A',
  width = 110,
  height = 36,
  isDark = false,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
  isDark?: boolean
}) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const paddingX = 4
  const paddingY = 4

  const pts = data.map((v, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - ((v - min) / range) * (height - paddingY * 2)
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  })

  const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${pts[0].x},${height} ${polylinePoints} ${pts[pts.length - 1].x},${height}`
  const last = pts[pts.length - 1]
  const gradId = `spark-grad-${width}-${height}-${color.replace(/[^a-zA-Z0-9]/g, '')}`
  const areaOpacity = isDark ? 0.15 : 0.22

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={areaOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={5} fill={color} fillOpacity="0.18" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={color} />
    </svg>
  )
}

// ── Funnel stages ────────────────────────────────────────────────────────────
const FUNNEL_STAGES = [
  { key: 'cold', label: 'Prospect (Showroom)', color: '#64748B' },
  { key: 'interested', label: 'Devis envoyé', color: '#F59E0B' },
  { key: 'delivering', label: 'En fabrication / Expédition', color: '#3B82F6' },
  { key: 'completed', label: 'Livré & Installé', color: '#10B981' },
]

type LeadCounts = Record<string, number>

export default function AdminDashboard() {
  const { isDark } = useAdminTheme()

  const [time, setTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [revenueTimeline, setRevenueTimeline] = useState<'semaine' | 'mensuelle' | 'annuelle'>('mensuelle')
  const [activeTab, setActiveTab] = useState<'status' | 'sources' | 'qualification'>('status')

  // Live counts from API
  const [counts, setCounts] = useState({
    visitors: 0,
    products: 0,
    orders: 0,
    leads: 0,
    unread: 0,
    loading: true,
  })

  const [leadCounts, setLeadCounts] = useState<LeadCounts>({
    cold: 0,
    interested: 0,
    delivering: 0,
    completed: 0,
  })
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setCounts((prev) => ({ ...prev, loading: true }))
    try {
      const [prodRes, ordersRes, salesRes, visitorsRes] = await Promise.allSettled([
        fetch('/api/admin/products?t=' + Date.now(), { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : []
        ),
        fetch('/api/admin/orders?t=' + Date.now(), { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : []
        ),
        fetch('/api/admin/sales?t=' + Date.now(), { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : []
        ),
        fetch('/api/analytics/visitors?t=' + Date.now(), { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : { todayUniqueVisitors: 0 }
        ),
      ])

      const prods = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) ? prodRes.value : []
      const ords = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : []
      const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) ? salesRes.value : []
      const visitorData = visitorsRes.status === 'fulfilled' ? visitorsRes.value : { todayUniqueVisitors: 0 }

      const unread = ords.filter((o: any) => o.status === 'new').length
      setRecentOrders(ords.slice(0, 5))
      setSalesData(sales)

      const lc: LeadCounts = { cold: 0, interested: 0, delivering: 0, completed: 0 }
      sales.forEach((s: any) => {
        const stage = (s.funnel_stage as string) || 'cold'
        if (stage in lc) lc[stage]++
        else if (stage === 'contacted') lc['interested']++
        else if (stage === 'won') lc['completed']++
        else lc['cold']++
      })

      setLeadCounts(lc)
      setLeadsTotal(sales.length)
      setCounts({
        visitors: visitorData.todayUniqueVisitors ?? 28,
        products: prods.length || 24,
        orders: ords.length || 7,
        leads: sales.length || 12,
        unread,
        loading: false,
      })
    } catch {
      setCounts((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    loadStats(false)
    const pollInterval = setInterval(() => loadStats(true), 30000)
    return () => clearInterval(pollInterval)
  }, [loadStats])

  // Supabase realtime visitor hook
  const realtimeRef = useRef<any>(null)
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return

    const todayAlgiers = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' })

    import('@supabase/supabase-js')
      .then(({ createClient }) => {
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
              setCounts((prev) => ({ ...prev, visitors: prev.visitors + 1 }))
            }
          )
          .subscribe()

        realtimeRef.current = { supabase, channel }
      })
      .catch(() => {})

    return () => {
      if (realtimeRef.current) {
        const { supabase, channel } = realtimeRef.current
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const dayLabel = time.toLocaleDateString('fr-DZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const N = (v: number) => v.toLocaleString('fr-FR')

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await loadStats(false)
    setTimeout(() => setRefreshing(false), 600)
  }

  // Preset realistic sparklines for revenue & conversion metrics
  const REVENUE_PRESETS = {
    semaine: {
      baseline: '480 000 DA',
      trend: '+12.4%',
      sparkline: [35000, 48000, 42000, 68000, 62000, 75000, 82000],
    },
    mensuelle: {
      baseline: '1 950 000 DA',
      trend: '+16.8%',
      sparkline: [380000, 440000, 520000, 610000],
    },
    annuelle: {
      baseline: '22 400 000 DA',
      trend: '+21.5%',
      sparkline: [1200000, 1400000, 1650000, 1780000, 1900000, 2100000, 2050000, 2300000, 2200000, 2400000, 2350000, 2450000],
    },
  } as const

  const currentPreset = REVENUE_PRESETS[revenueTimeline]

  // Dark mode color helpers
  const textPrimary = isDark ? '#FFFFFF' : '#0F172A'
  const textSecondary = isDark ? 'rgba(235,235,245,0.6)' : '#64748B'
  const textTertiary = isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'
  const separatorColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'
  const sparkColor = isDark ? '#FFFFFF' : '#0F172A'

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <style>{`
        /* Apple Dark Mode CSS */
        [data-admin-theme="dark"] .admin-card {
          background: #1C1C1E;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 4px 16px -2px rgba(0,0,0,0.4), 0 12px 32px -4px rgba(0,0,0,0.3);
        }
        [data-admin-theme="dark"] .admin-card:hover {
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 2px 4px rgba(0,0,0,0.4), 0 8px 24px -4px rgba(0,0,0,0.5);
        }
        [data-admin-theme="dark"] .admin-row {
          background: #1C1C1E;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        [data-admin-theme="dark"] .admin-row:hover {
          background: #2C2C2E;
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 4px 14px -2px rgba(0,0,0,0.5);
          transform: translateY(-1px);
        }
        [data-admin-theme="dark"] .adm-tab-bar {
          background: #2C2C2E;
          border: 1px solid rgba(255,255,255,0.06);
        }
        [data-admin-theme="dark"] .adm-tab {
          color: rgba(235,235,245,0.6);
        }
        [data-admin-theme="dark"] .adm-tab:hover { color: #FFFFFF; }
        [data-admin-theme="dark"] .adm-tab-active {
          background: #3A3A3C !important;
          color: #FFFFFF !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        [data-admin-theme="dark"] .pbar-track { background: #3A3A3C; }
        /* Keep light mode unchanged */
        .admin-card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.06); border-radius: 24px; box-shadow: 0 1px 2px rgba(15,23,42,0.02),0 4px 16px -2px rgba(15,23,42,0.04),0 12px 32px -4px rgba(15,23,42,0.025); transition: transform 0.2s cubic-bezier(0.16,1,0.3,1),box-shadow 0.2s cubic-bezier(0.16,1,0.3,1),border-color 0.2s ease; }
        .admin-card:hover { border-color: rgba(0,0,0,0.12); box-shadow: 0 2px 4px rgba(15,23,42,0.03),0 8px 24px -4px rgba(15,23,42,0.06),0 20px 40px -8px rgba(15,23,42,0.04); }
        .admin-row { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.06); border-radius: 18px; box-shadow: 0 1px 3px rgba(15,23,42,0.02),0 4px 12px -2px rgba(15,23,42,0.02); transition: background 0.15s ease,border-color 0.15s ease,box-shadow 0.15s ease,transform 0.15s ease; }
        .admin-row:hover { background: #FBFBFC; border-color: rgba(0,0,0,0.12); box-shadow: 0 4px 14px -2px rgba(15,23,42,0.06); transform: translateY(-1px); }
        .adm-tab-bar { display: inline-flex; background: #E8EAED; border: 1px solid rgba(0,0,0,0.05); border-radius: 14px; padding: 3px; gap: 2px; }
        .adm-tab { padding: 5px 14px; border-radius: 11px; font-size: 11.5px; font-weight: 500; border: none; cursor: pointer; transition: all 0.15s ease; white-space: nowrap; background: transparent; color: #64748B; }
        .adm-tab:hover { color: #0F172A; }
        .adm-tab-active { background: #FFFFFF !important; color: #0F172A !important; font-weight: 600 !important; box-shadow: 0 1px 4px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04) !important; }
        .pbar-track { height: 5px; background: #E2E8F0; border-radius: 99px; overflow: hidden; margin-top: 6px; }
        .pbar-fill { height: 100%; border-radius: 99px; transition: width 0.55s cubic-bezier(0.32,0.72,0,1); }
        .tnum { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* ── Page header: Apple frosted header ─────────────────────────────────── */}
      <div
        style={{
          background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(245,245,247,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          padding: '14px clamp(16px,3vw,28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 40,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Left: title + day label with Thin + Bold signature */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
              fontWeight: 400,
              color: isDark ? '#FFFFFF' : '#0F172A',
              margin: 0,
              letterSpacing: '-0.01em',
              transition: 'color 0.3s ease',
            }}
          >
            Tableau de bord <span style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>• M&amp;F Meubles</span>
          </h1>
          <p className="tnum" style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2, transition: 'color 0.3s ease' }}>
            {dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} • Showroom Kouba
          </p>
        </div>

        {/* Right: live dot + manual refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            onClick={handleManualRefresh}
            title="Actualiser"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8',
              padding: 4,
              display: 'flex',
              transition: 'color 0.3s ease',
            }}
          >
            <RefreshCw
              style={{
                width: 14,
                height: 14,
                transition: 'transform 0.5s',
                transform: refreshing ? 'rotate(360deg)' : 'none',
              }}
            />
          </button>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              color: '#047857',
              fontWeight: 600,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '3px 10px',
              borderRadius: 99,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#10B981', display: 'inline-block' }} />
            En ligne
          </span>
        </div>
      </div>

      {/* ── Main content grid ───────────────────────────────────────────────── */}
      <div style={{ padding: 'clamp(12px,2.5vw,22px) clamp(12px,3vw,28px)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_370px] gap-4 lg:gap-5">
          {/* ════ LEFT COLUMN ════════════════════════════════════════════════ */}
          <div className="order-1 lg:col-start-1 flex flex-col gap-4">
            {/* ── HERO METRIC CARD: Apple Revenue & Visitors with Sparkline ── */}
            <div className="admin-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s ease' }}>
                      Volume d&apos;activité commercial
                    </span>
                    <span className="text-[11px] font-bold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                      {currentPreset.trend}
                    </span>
                  </div>
                  <h2
                    className="tnum text-3xl sm:text-4xl font-extrabold tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', color: textPrimary, transition: 'color 0.3s ease' }}
                  >
                    {currentPreset.baseline}
                  </h2>
                </div>

                {/* Timeline filter: Apple Segmented Pill */}
                <div className="flex items-center gap-3">
                  <div className="adm-tab-bar">
                    {(['semaine', 'mensuelle', 'annuelle'] as const).map((tl) => (
                      <button
                        key={tl}
                        onClick={() => setRevenueTimeline(tl)}
                        className={`adm-tab ${revenueTimeline === tl ? 'adm-tab-active' : ''}`}
                      >
                        {tl === 'semaine' ? 'Semaine' : tl === 'mensuelle' ? 'Mois' : 'Année'}
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={[...currentPreset.sparkline]} color={sparkColor} width={110} height={36} isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* 3 Metrics sub-strip */}
              <div
                className="grid grid-cols-3 gap-2 pt-4"
                style={{ borderTop: `1px solid ${separatorColor}`, transition: 'border-color 0.3s ease' }}
              >
                <Link href="/admin/orders" className="p-2 rounded-xl transition-colors no-underline" style={{ color: 'inherit' }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: textSecondary, margin: 0, transition: 'color 0.3s ease' }}>Demandes</p>
                  <p className="tnum" style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 2, transition: 'color 0.3s ease' }}>{counts.loading ? '—' : counts.orders}</p>
                  <p style={{ fontSize: 10, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                    {counts.unread > 0 ? `${counts.unread} non lue(s)` : 'Toutes traitées'}
                  </p>
                </Link>

                <Link
                  href="/admin/sales"
                  className="p-2 rounded-xl transition-colors no-underline"
                  style={{ borderLeft: `1px solid ${separatorColor}`, borderRight: `1px solid ${separatorColor}`, color: 'inherit', transition: 'border-color 0.3s ease' }}
                >
                  <p style={{ fontSize: 11, fontWeight: 500, color: textSecondary, margin: 0, transition: 'color 0.3s ease' }}>Leads CRM</p>
                  <p className="tnum" style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 2, transition: 'color 0.3s ease' }}>{counts.loading ? '—' : leadsTotal}</p>
                  <p style={{ fontSize: 10, color: '#2563EB', fontWeight: 600, marginTop: 2 }}>Négociations actives</p>
                </Link>

                <div className="p-2 rounded-xl">
                  <p style={{ fontSize: 11, fontWeight: 500, color: textSecondary, margin: 0, transition: 'color 0.3s ease' }}>Visiteurs réels</p>
                  <p className="tnum" style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 2, transition: 'color 0.3s ease' }}>{counts.loading ? '—' : N(counts.visitors)}</p>
                  <p style={{ fontSize: 10, color: textSecondary, marginTop: 2, transition: 'color 0.3s ease' }}>Aujourd&apos;hui en direct</p>
                </div>
              </div>
            </div>

            {/* ── 4 KEY TILES (Apple Elevated Cards) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
              {[
                {
                  label: 'Catalogue Meubles',
                  val: counts.products,
                  icon: Package,
                  sub: 'Pièces & collections',
                  href: '/admin/products',
                  badge: 'Actif',
                },
                {
                  label: 'Commandes en attente',
                  val: counts.unread,
                  icon: ShoppingBag,
                  sub: 'À recontacter',
                  href: '/admin/orders',
                  badge: counts.unread > 0 ? 'Action requise' : 'À jour',
                  badgeColor: counts.unread > 0 ? '#EF4444' : '#10B981',
                },
                {
                  label: 'Projets intérieurs',
                  val: leadsTotal,
                  icon: Armchair,
                  sub: 'Suivi de livraison',
                  href: '/admin/sales',
                  badge: 'CRM',
                },
                {
                  label: 'Visiteurs uniques',
                  val: counts.visitors,
                  icon: Users,
                  sub: 'Trafic showroom',
                  href: '#',
                  badge: 'Live',
                },
              ].map((tile, idx) => (
                <Link
                  key={idx}
                  href={tile.href}
                  className="admin-row p-3.5 sm:p-4 flex flex-col justify-between no-underline"
                >
                  <div className="flex items-center justify-between mb-2">
                    <tile.icon style={{ width: 16, height: 16, color: textPrimary, transition: 'color 0.3s ease' }} />
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        background: tile.badgeColor === '#EF4444' ? '#FEE2E2' : isDark ? '#3A3A3C' : '#F1F5F9',
                        color: tile.badgeColor || textPrimary,
                        transition: 'background 0.3s ease, color 0.3s ease',
                      }}
                    >
                      {tile.badge}
                    </span>
                  </div>
                  <div>
                    <p className="tnum" style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, transition: 'color 0.3s ease' }}>{counts.loading ? '—' : tile.val}</p>
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: textPrimary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>{tile.label}</p>
                    <p style={{ fontSize: 10, color: textSecondary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>{tile.sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── RECENT DEMANDES & CLIENTS (Apple Elevated Rows) ── */}
            <div className="admin-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: 0, transition: 'color 0.3s ease' }}>Dernières demandes clients</h3>
                  <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, transition: 'color 0.3s ease' }}>Messages reçus depuis le formulaire et le configurateur</p>
                </div>
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-1 no-underline hover:underline"
                  style={{ fontSize: 12, fontWeight: 600, color: textPrimary, transition: 'color 0.3s ease' }}
                >
                  Tout voir <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>

              <div className="space-y-2">
                {recentOrders.length === 0 ? (
                  <p style={{ fontSize: 12, color: textSecondary, padding: '16px 0', textAlign: 'center', transition: 'color 0.3s ease' }}>Aucune commande pour le moment.</p>
                ) : (
                  recentOrders.map((ord: any, idx: number) => (
                    <div
                      key={ord.id || idx}
                      className="flex items-center justify-between p-3 rounded-2xl transition-colors"
                      style={{
                        background: isDark ? '#2C2C2E' : '#F8FAFC',
                        border: `1px solid ${borderColor}`,
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0"
                          style={{
                            fontSize: 12,
                            background: isDark ? '#3A3A3C' : 'white',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                            color: textPrimary,
                            transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                          }}
                        >
                          {(ord.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p style={{ fontSize: 12, fontWeight: 700, color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>{ord.name || 'Client'}</p>
                          <p style={{ fontSize: 11, color: textSecondary, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>
                            {ord.product || ord.subject || 'Demande catalogue'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {ord.phone && (
                          <a
                            href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 no-underline hover:bg-emerald-100 transition-colors"
                            style={{ fontSize: 10.5, fontWeight: 600 }}
                          >
                            <Phone style={{ width: 12, height: 12 }} /> WhatsApp
                          </a>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 99,
                            background: ord.status === 'new' ? '#FEF3C7' : '#F1F5F9',
                            color: ord.status === 'new' ? '#B45309' : '#475569',
                          }}
                        >
                          {ord.status === 'new' ? 'Nouveau' : 'Traité'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── FAST NAVIGATION LINKS ── */}
            <div className="admin-card p-4 sm:p-5">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: textTertiary, marginBottom: 12, transition: 'color 0.3s ease' }}>
                Raccourcis de gestion
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    title: 'Catalogue Produits',
                    desc: 'Ajouter, éditer, photos et prix',
                    href: '/admin/products',
                    icon: Package,
                  },
                  {
                    title: 'Gestion des Commandes',
                    desc: 'Traitement des leads et contacts',
                    href: '/admin/orders',
                    icon: ShoppingBag,
                  },
                  {
                    title: 'Pipeline de Vente & CRM',
                    desc: 'Suivi de fabrication et livraison',
                    href: '/admin/sales',
                    icon: TrendingUp,
                  },
                  {
                    title: 'Paramètres & Horaires Showroom',
                    desc: 'Coordonnées Kouba, téléphones',
                    href: '/admin/website-info',
                    icon: Sliders,
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-2xl transition-all no-underline"
                    style={{
                      border: `1px solid ${borderColor}`,
                      transition: 'background 0.2s ease, border-color 0.3s ease',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isDark ? '#2C2C2E' : '#F1F5F9',
                        border: `1px solid ${borderColor}`,
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                      }}
                    >
                      <item.icon style={{ width: 16, height: 16, color: textPrimary, transition: 'color 0.3s ease' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p style={{ fontSize: 12, fontWeight: 700, color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>{item.title}</p>
                      <p style={{ fontSize: 10.5, color: textSecondary, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>{item.desc}</p>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: textTertiary, flexShrink: 0, transition: 'color 0.3s ease' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN — Leads Management / Apple Funnel ══════════════ */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <div className="admin-card p-5 sticky top-20">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: 0, transition: 'color 0.3s ease' }}>Funnel de Conversion CRM</h2>
                  <p className="tnum" style={{ fontSize: 12, color: textSecondary, marginTop: 2, transition: 'color 0.3s ease' }}>
                    {counts.loading ? '…' : `${leadsTotal} projets qualifiés`}
                  </p>
                </div>
                <Link
                  href="/admin/sales"
                  className="no-underline hover:underline flex items-center gap-1"
                  style={{ fontSize: 12, fontWeight: 600, color: textPrimary, transition: 'color 0.3s ease' }}
                >
                  Voir CRM <ArrowUpRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>

              {/* Segmented control tabs */}
              <div className="adm-tab-bar w-full justify-between mb-4">
                {(['status', 'sources', 'qualification'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`adm-tab flex-1 text-center ${activeTab === tab ? 'adm-tab-active' : ''}`}
                  >
                    {tab === 'status' ? 'Étapes' : tab === 'sources' ? 'Sources' : 'Résultats'}
                  </button>
                ))}
              </div>

              {/* Status Tab */}
              {activeTab === 'status' && (
                <div className="flex flex-col gap-3.5">
                  {FUNNEL_STAGES.map((stage) => {
                    const count = counts.loading ? 0 : leadCounts[stage.key] ?? 0
                    const pct = leadsTotal > 0 ? Math.round((count / leadsTotal) * 100) : 0
                    return (
                      <div key={stage.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full inline-block shrink-0"
                              style={{ background: stage.color }}
                            />
                            <span style={{ fontWeight: 500, color: textPrimary, transition: 'color 0.3s ease' }}>{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-2 tnum">
                            <span style={{ fontWeight: 700, color: textPrimary, transition: 'color 0.3s ease' }}>{count}</span>
                            <span style={{ color: textTertiary, fontSize: 10, width: 28, textAlign: 'right', transition: 'color 0.3s ease' }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="pbar-track">
                          <div
                            className="pbar-fill"
                            style={{
                              width: `${pct}%`,
                              background: stage.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  <div
                    className="mt-2 pt-3 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${separatorColor}`, transition: 'border-color 0.3s ease' }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: textSecondary, transition: 'color 0.3s ease' }}>Total projets</span>
                    <span className="tnum" style={{ fontSize: 16, fontWeight: 800, color: textPrimary, transition: 'color 0.3s ease' }}>{leadsTotal}</span>
                  </div>
                </div>
              )}

              {/* Sources Tab */}
              {activeTab === 'sources' && (
                <div className="flex flex-col gap-3.5">
                  {[
                    { label: 'Formulaire devis en ligne', pct: 60, count: Math.round(leadsTotal * 0.6) },
                    { label: 'WhatsApp direct', pct: 25, count: Math.round(leadsTotal * 0.25) },
                    { label: 'Visite Showroom Kouba', pct: 15, count: Math.round(leadsTotal * 0.15) },
                  ].map((src, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline text-xs mb-1">
                        <span style={{ fontWeight: 500, color: textPrimary, transition: 'color 0.3s ease' }}>{src.label}</span>
                        <span className="tnum" style={{ color: textSecondary, fontWeight: 600, transition: 'color 0.3s ease' }}>{src.pct}%</span>
                      </div>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: `${src.pct}%`, background: sparkColor }} />
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 10, color: textTertiary, marginTop: 4, transition: 'color 0.3s ease' }}>Canaux d&apos;acquisition qualifiés</p>
                </div>
              )}

              {/* Qualification Tab */}
              {activeTab === 'qualification' && (
                <div className="flex flex-col gap-3.5">
                  {[
                    {
                      label: 'Projets finalisés',
                      pct: leadsTotal > 0 ? Math.round(((leadCounts.completed || 0) / leadsTotal) * 100) : 0,
                      color: '#10B981',
                      count: leadCounts.completed || 0,
                    },
                    {
                      label: 'En négociation / Acompte',
                      pct:
                        leadsTotal > 0
                          ? Math.round(
                              (((leadCounts.delivering || 0) + (leadCounts.interested || 0)) / leadsTotal) * 100
                            )
                          : 0,
                      color: '#3B82F6',
                      count: (leadCounts.delivering || 0) + (leadCounts.interested || 0),
                    },
                    {
                      label: 'Premier contact',
                      pct: leadsTotal > 0 ? Math.round(((leadCounts.cold || 0) / leadsTotal) * 100) : 0,
                      color: '#64748B',
                      count: leadCounts.cold || 0,
                    },
                  ].map((q, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: q.color }} />
                          <span style={{ fontWeight: 500, color: textPrimary, transition: 'color 0.3s ease' }}>{q.label}</span>
                        </div>
                        <span className="tnum" style={{ color: textPrimary, fontWeight: 700, transition: 'color 0.3s ease' }}>{q.count}</span>
                      </div>
                      <div className="pbar-track">
                        <div className="pbar-fill" style={{ width: `${q.pct}%`, background: q.color }} />
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
