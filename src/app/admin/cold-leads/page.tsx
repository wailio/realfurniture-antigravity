'use client'

export const runtime = 'edge'

import { useState, useEffect, useMemo } from 'react'
import {
  MessageCircle,
  Phone,
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  Sliders,
  Armchair,
  X,
} from 'lucide-react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'

// Handcrafted bespoke furniture icons (anti-AI slop, architectural line art)
function SalonIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
      <path d="M2 13a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
      <path d="M4 15h16" />
      <path d="M5 19v2" />
      <path d="M19 19v2" />
      <path d="M8 11V8" />
      <path d="M16 11V8" />
    </svg>
  )
}

function DiningTableIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 10h18" />
      <path d="M6 10v9" />
      <path d="M18 10v9" />
      <path d="M4 10V6a2 2 0 0 1 2-2h1" />
      <path d="M20 10V6a2 2 0 0 0-2-2h-1" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

function BedroomIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 5v14" />
      <path d="M21 5v14" />
      <path d="M3 9h18" />
      <rect x="5.5" y="7" width="5" height="3" rx="1" />
      <rect x="13.5" y="7" width="5" height="3" rx="1" />
      <path d="M3 14h18" />
      <path d="M3 17h18" />
    </svg>
  )
}

function WardrobeIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M12 3v18" />
      <circle cx="10" cy="12" r="0.75" fill="currentColor" />
      <circle cx="14" cy="12" r="0.75" fill="currentColor" />
      <path d="M4 17h16" />
    </svg>
  )
}

function DecorIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 2v6" />
      <path d="M7 12l2.5-4h5L17 12z" />
      <path d="M9.5 12a2.5 2.5 0 0 0 5 0" />
      <path d="M4 19h16" />
      <circle cx="12" cy="19" r="1.5" />
      <path d="M19 7l1 1-1 1-1-1z" fill="currentColor" />
    </svg>
  )
}

function FullProjectIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 11h8v10" />
      <path d="M15 3v6h6" />
      <path d="M15 9h-4" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
    </svg>
  )
}

const CATEGORIES: Record<
  string,
  { title: string; subtitle: string; icon: any; color: string }
> = {
  salon: {
    title: 'Salons & Canapés',
    subtitle: 'Modulables, velours & cuir',
    icon: SalonIcon,
    color: '#3B82F6',
  },
  'salle-a-manger': {
    title: 'Salles à Manger',
    subtitle: 'Tables, chaises & buffets',
    icon: DiningTableIcon,
    color: '#0A84FF',
  },
  chambre: {
    title: 'Chambres à Coucher',
    subtitle: 'Lits, chevets & dressings',
    icon: BedroomIcon,
    color: '#A855F7',
  },
  armoire: {
    title: 'Dressings & Armoires',
    subtitle: 'Sur-mesure & rangements',
    icon: WardrobeIcon,
    color: '#10B981',
  },
  deco: {
    title: 'Décoration & Art',
    subtitle: 'Miroirs, consoles & luminaires',
    icon: DecorIcon,
    color: '#EC4899',
  },
  complet: {
    title: 'Aménagement Complet',
    subtitle: 'Villa, appartement ou bureau',
    icon: FullProjectIcon,
    color: '#F59E0B',
  },
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; darkBg: string; darkBorder: string }
> = {
  nouveau: {
    label: 'Nouveau Choix',
    color: '#F59E0B',
    bg: '#FEF3C7',
    border: '#FDE68A',
    darkBg: 'rgba(245,158,11,0.15)',
    darkBorder: 'rgba(245,158,11,0.3)',
  },
  contacted: {
    label: 'Contacté',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    darkBg: 'rgba(59,130,246,0.15)',
    darkBorder: 'rgba(59,130,246,0.3)',
  },
  negotiating: {
    label: 'En Négociation',
    color: '#A855F7',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    darkBg: 'rgba(168,85,247,0.15)',
    darkBorder: 'rgba(168,85,247,0.3)',
  },
  converted: {
    label: 'Vente Conclue',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    darkBg: 'rgba(16,185,129,0.15)',
    darkBorder: 'rgba(16,185,129,0.3)',
  },
  archived: {
    label: 'Classé',
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    darkBg: 'rgba(255,255,255,0.06)',
    darkBorder: 'rgba(255,255,255,0.1)',
  },
}

interface ColdLead {
  id: string
  customer_name: string
  phone: string
  furniture_type: string
  furniture_title: string
  budget: number
  formatted_budget: string
  status: 'nouveau' | 'contacted' | 'negotiating' | 'converted' | 'archived'
  created_at: string
  notes?: string
}

function timeAgo(dateString?: string) {
  if (!dateString) return 'Récemment'
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

function formatPrice(val: number) {
  return new Intl.NumberFormat('fr-DZ').format(val) + ' DA'
}

export default function ColdLeadsPage() {
  const { isDark } = useAdminTheme()
  const [leads, setLeads] = useState<ColdLead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [typeDistribution, setTypeDistribution] = useState<Record<string, { count: number; totalBudget: number }>>({})
  const [avgBudget, setAvgBudget] = useState(0)

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch('/api/admin/cold-leads', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        setTypeDistribution(data.typeDistribution || {})
        setAvgBudget(data.avgBudget || 0)
      }
    } catch (err) {
      console.error('Failed to load cold leads:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/cold-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      })
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
        )
        showIosToast('Statut mis à jour ✓', 'success')
      } else {
        showIosToast('Erreur de mise à jour', 'error')
      }
    } catch {
      showIosToast('Erreur réseau', 'error')
    }
  }

  const handleDelete = async (lead: ColdLead) => {
    const confirmed = await showIosConfirm({
      title: 'Supprimer ce choix ?',
      message: `Voulez-vous supprimer la demande de ${lead.customer_name} (${lead.furniture_title}) ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDestructive: true,
    })
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/cold-leads?id=${lead.id}`, { method: 'DELETE' })
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== lead.id))
        showIosToast('Demande supprimée ✓', 'info')
      }
    } catch {
      showIosToast('Erreur lors de la suppression', 'error')
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        search === '' ||
        l.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        l.furniture_title.toLowerCase().includes(search.toLowerCase())

      const matchCat = selectedCategory === 'all' || l.furniture_type === selectedCategory
      const matchStatus = selectedStatus === 'all' || l.status === selectedStatus

      return matchSearch && matchCat && matchStatus
    })
  }, [leads, search, selectedCategory, selectedStatus])

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* ── Apple Frosted Sticky Header ── */}
      <div
        style={{
          background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(245, 245, 247, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
          padding: 'clamp(14px, 2vw, 20px) clamp(16px, 3vw, 28px)',
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#10B981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#30D158' : '#047857' }}>
              Entonnoir Hero • M&amp;F Meubles
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontWeight: 400,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Cold Leads <span style={{ fontWeight: 800 }}>• Choix &amp; Budgets Visiteurs</span>
          </h1>
          <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2 }}>
            Demandes et sélections enregistrées en direct depuis le configurateur d&apos;accueil
          </p>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#0F172A',
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              cursor: refreshing ? 'wait' : 'pointer',
              boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,23,42,0.03)',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px, 2.5vw, 28px)', maxWidth: 1400, margin: '0 auto' }}>
        {/* ── Key Metrics (Apple Light/Dark Squircle Card) ── */}
        <div
          style={{
            background: isDark ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 20,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            padding: '24px 28px',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.02)',
            marginBottom: 24,
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            {/* Primary Hero Metric */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginBottom: 4 }}>
                Nouveaux choix à traiter
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.03em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {leads.filter((l) => l.status === 'nouveau').length}
                </p>
                <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                  {leads.filter((l) => l.status === 'nouveau').length > 0 ? 'En attente de premier contact' : 'Toutes les demandes traitées ✓'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 4 }}>
                Prospects qualifiés via le configurateur interactif
              </p>
            </div>

            {/* 3 Secondary Metrics with subtle hairline dividers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingLeft: 24, borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9' }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.02em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {leads.length}
                </p>
                <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 600, marginTop: 2 }}>Total demandes</p>
                <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 2 }}>Depuis le début</p>
              </div>

              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(avgBudget)}
                </p>
                <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 600, marginTop: 2 }}>Budget moyen</p>
                <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 2 }}>Par sélection</p>
              </div>

              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#30D158' : '#047857', letterSpacing: '-0.02em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {leads.filter((l) => l.status === 'converted').length}
                </p>
                <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 600, marginTop: 2 }}>Ventes conclues</p>
                <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 2 }}>
                  {leads.length > 0 ? `${Math.round((leads.filter((l) => l.status === 'converted').length / leads.length) * 100)}% taux` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Breakdown Grid (Apple Squircle Cards) ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>
              Distribution par type de mobilier
            </h2>
            <span style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>Cliquez sur une catégorie pour filtrer</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {Object.entries(CATEGORIES).map(([catKey, cat]) => {
              const IconComp = cat.icon
              const count = typeDistribution[catKey]?.count || 0
              const isSelected = selectedCategory === catKey
              const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : catKey)}
                  style={{
                    textAlign: 'left',
                    padding: '16px 14px',
                    borderRadius: 16,
                    border: isSelected
                      ? (isDark ? '2px solid #FFFFFF' : '2px solid #0F172A')
                      : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                    background: isSelected
                      ? (isDark ? '#2C2C2E' : '#F8FAFC')
                      : (isDark ? '#1C1C1E' : '#FFFFFF'),
                    boxShadow: isSelected
                      ? (isDark ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(15,23,42,0.08)')
                      : (isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.02)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ marginBottom: 10, color: cat.color }}>
                    <IconComp className="w-6 h-6" />
                  </div>

                  <p style={{ fontSize: 12.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {cat.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>{count}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>
                      {percentage}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Search & Filter Tabs ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search Capsule Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 9999,
              padding: '9px 16px',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #DFE3E8',
              width: '100%',
              maxWidth: 320,
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, type..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12.5,
                color: isDark ? '#FFFFFF' : '#0F172A',
                width: '100%',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
          </div>

          {/* Status Filter Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              gap: 2,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              background: isDark ? '#2C2C2E' : '#DFE4EA',
              padding: '3px',
              borderRadius: 14,
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #D5DBE2',
            } as React.CSSProperties}
          >
            {['all', 'nouveau', 'contacted', 'negotiating', 'converted', 'archived'].map((statusKey) => {
              const isSelected = selectedStatus === statusKey
              const label =
                statusKey === 'all'
                  ? 'Tous'
                  : STATUS_CONFIG[statusKey]?.label || statusKey

              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setSelectedStatus(statusKey)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 11,
                    fontSize: 11.5,
                    fontWeight: isSelected ? 600 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: isSelected ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
                    color: isSelected ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? 'rgba(235,235,245,0.6)' : '#64748B'),
                    boxShadow: isSelected ? (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.08)') : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Leads Feed / List ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 20,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Sliders className="w-10 h-10 mx-auto text-[#94A3B8] mb-3" />
            <p style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 16, fontWeight: 700, margin: 0 }}>Aucun résultat trouvé</p>
            <p style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontSize: 13, marginTop: 6 }}>
              {search || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Essayez de réinitialiser vos filtres de recherche.'
                : 'Les choix des visiteurs via le widget d’accueil apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filteredLeads.map((lead) => {
              const catMeta = CATEGORIES[lead.furniture_type] || CATEGORIES.salon
              const IconComp = catMeta.icon
              const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.nouveau
              const budgetRatio = Math.min(
                100,
                Math.max(0, ((lead.budget - 20000) / (180000 - 20000)) * 100)
              )

              const waText = encodeURIComponent(
                `Bonjour ${lead.customer_name} ! Nous avons bien reçu votre demande sur M&F Meubles pour : ${lead.furniture_title} (Budget estimé : ${lead.formatted_budget}). Êtes-vous disponible pour que notre architecte d'intérieur vous présente notre showroom ?`
              )
              const cleanPhone = lead.phone.replace(/[^0-9]/g, '')
              const waPhone = cleanPhone.startsWith('0')
                ? '213' + cleanPhone.substring(1)
                : cleanPhone.startsWith('213')
                ? cleanPhone
                : '213' + cleanPhone
              const whatsappLink = `https://wa.me/${waPhone}?text=${waText}`

              return (
                <div
                  key={lead.id}
                  style={{
                    background: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderRadius: 18,
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px rgba(15,23,42,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    {/* Top row: Category icon & title + Time ago */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isDark ? '#2C2C2E' : '#F8FAFC',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: catMeta.color,
                            flexShrink: 0,
                          }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', lineHeight: 1.25, margin: 0 }}>
                            {lead.furniture_title}
                          </p>
                          <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', margin: '2px 0 0 0' }}>{catMeta.subtitle}</p>
                        </div>
                      </div>

                      <span style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock className="w-3 h-3 text-[#94A3B8]" />
                        <span>{timeAgo(lead.created_at)}</span>
                      </span>
                    </div>

                    {/* Customer Info Box */}
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: isDark ? '#2C2C2E' : '#F8FAFC',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                        marginBottom: 14,
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>
                        {lead.customer_name}
                      </p>
                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          fontSize: 12.5,
                          color: isDark ? '#0A84FF' : '#2563EB',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 4,
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lead.phone}</span>
                      </a>
                    </div>

                    {/* Budget Scale Visual Bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                          Budget sélectionné
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                          {lead.formatted_budget}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: isDark ? '#3A3A3C' : '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 99,
                            width: `${budgetRatio}%`,
                            background: isDark ? '#FFFFFF' : '#0F172A',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 4 }}>
                        <span>20k DA</span>
                        <span>180k DA</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Status Select + WhatsApp / Call Actions */}
                  <div style={{ paddingTop: 14, borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: '6px 10px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? statusMeta.darkBorder : statusMeta.border}`,
                        background: isDark ? statusMeta.darkBg : statusMeta.bg,
                        color: statusMeta.color,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="contacted">Contacté</option>
                      <option value="negotiating">En Négociation</option>
                      <option value="converted">Vente Conclue</option>
                      <option value="archived">Classé</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '7px 10px',
                          borderRadius: 8,
                          background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                          border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                          color: isDark ? '#30D158' : '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Contacter sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 8,
                          background: isDark ? '#2C2C2E' : '#F1F5F9',
                          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Appeler directement"
                      >
                        <Phone className="w-4 h-4 text-[#3B82F6]" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(lead)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 8,
                          background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                          border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA',
                          color: isDark ? '#FF453A' : '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Supprimer ce lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
