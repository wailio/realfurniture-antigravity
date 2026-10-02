'use client'

export const runtime = 'edge'

import { useState, useEffect, useMemo } from 'react'
import {
  Sofa,
  Utensils,
  BedDouble,
  DoorClosed,
  Palette,
  Home,
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
} from 'lucide-react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'

// Category metadata with icons & colors
const CATEGORIES: Record<
  string,
  { title: string; subtitle: string; icon: any; color: string; bg: string; border: string }
> = {
  salon: {
    title: 'Salons & Canapés',
    subtitle: 'Modulables, velours & cuir',
    icon: Sofa,
    color: '#d1aa5c',
    bg: 'rgba(209, 170, 92, 0.12)',
    border: 'rgba(209, 170, 92, 0.3)',
  },
  'salle-a-manger': {
    title: 'Salles à Manger',
    subtitle: 'Tables, chaises & buffets',
    icon: Utensils,
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  chambre: {
    title: 'Chambres à Coucher',
    subtitle: 'Lits, chevets & dressings',
    icon: BedDouble,
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.3)',
  },
  armoire: {
    title: 'Dressings & Armoires',
    subtitle: 'Sur-mesure & rangements',
    icon: DoorClosed,
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  deco: {
    title: 'Décoration & Art',
    subtitle: 'Miroirs, consoles & luminaires',
    icon: Palette,
    color: '#F472B6',
    bg: 'rgba(244, 114, 182, 0.12)',
    border: 'rgba(244, 114, 182, 0.3)',
  },
  complet: {
    title: 'Aménagement Complet',
    subtitle: 'Villa, appartement ou bureau',
    icon: Home,
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  nouveau: {
    label: 'Nouveau Choix',
    color: '#d1aa5c',
    bg: 'rgba(209, 170, 92, 0.15)',
    border: 'rgba(209, 170, 92, 0.35)',
  },
  contacted: {
    label: 'Contacté',
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.15)',
    border: 'rgba(96, 165, 250, 0.35)',
  },
  negotiating: {
    label: 'En Négociation',
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.15)',
    border: 'rgba(192, 132, 252, 0.35)',
  },
  converted: {
    label: 'Vente Conclue',
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.15)',
    border: 'rgba(52, 211, 153, 0.35)',
  },
  archived: {
    label: 'Classé',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.10)',
    border: 'rgba(148, 163, 184, 0.20)',
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

  // Update lead status
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
        showIosToast('Statut mis à jour')
      } else {
        showIosToast('Erreur de mise à jour')
      }
    } catch {
      showIosToast('Erreur réseau')
    }
  }

  // Delete lead
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
        showIosToast('Demande supprimée')
      }
    } catch {
      showIosToast('Erreur lors de la suppression')
    }
  }

  // Filtered list
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
    <div className="min-h-screen text-white" style={{ fontFamily: 'var(--font-body)', background: 'transparent' }}>
      {/* ── Page Header ── */}
      <div
        className="sticky top-0 z-30 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08]"
        style={{
          background: 'rgba(10, 11, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#d1aa5c] shadow-[0_0_8px_#d1aa5c]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d1aa5c]">
              Suivi · Entonnoir Hero
            </span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-light text-white tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Cold Lead choices
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Choix et budgets sélectionnés en direct par les visiteurs depuis le widget d'accueil
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-white/80 bg-white/[0.05] hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer"
            style={{ cursor: refreshing ? 'wait' : 'pointer' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d1aa5c] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* ── Key Metrics: Clear Visual Hierarchy (Primary Hero + 3 Secondary) ── */}
        <div
          className="rounded-xl border p-5 md:p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Primary Hero Metric */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                Nouveaux choix à traiter
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {leads.filter((l) => l.status === 'nouveau').length}
                </p>
                <span className="text-xs text-[#d1aa5c] font-medium">
                  {leads.filter((l) => l.status === 'nouveau').length > 0 ? 'En attente de premier contact' : 'Toutes les demandes traitées'}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Prospects qualifiés via le configurateur hero
              </p>
            </div>

            {/* 3 Secondary Metrics with subtle hairline dividers */}
            <div className="grid grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
              <div>
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {leads.length}
                </p>
                <p className="text-[11px] text-white/50 font-medium mt-0.5">Total demandes</p>
                <p className="text-[10px] text-white/30 mt-0.5">Depuis l&apos;ouverture</p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold text-[#d1aa5c] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(avgBudget)}
                </p>
                <p className="text-[11px] text-white/50 font-medium mt-0.5">Budget moyen</p>
                <p className="text-[10px] text-white/30 mt-0.5">Par sélection</p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold text-[#34D399] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {leads.filter((l) => l.status === 'converted').length}
                </p>
                <p className="text-[11px] text-white/50 font-medium mt-0.5">Ventes conclues</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {leads.length > 0 ? `${Math.round((leads.filter((l) => l.status === 'converted').length / leads.length) * 100)}% taux` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Breakdown Grid (Creative Product Type Visual System) ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Distribution par type de mobilier
            </h2>
            <span className="text-xs text-white/40">Cliquez sur une catégorie pour filtrer</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
                  className={`text-left p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-[#d1aa5c] shadow-[0_0_20px_rgba(209,170,92,0.25)]'
                      : 'border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(209, 170, 92, 0.15)' : undefined,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <p className="text-xs font-bold text-white truncate leading-tight">{cat.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-base font-light font-fraunces text-white">{count}</span>
                    <span className="text-[10px] font-mono text-[#d1aa5c] font-semibold">
                      {percentage}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Search & Filter Tabs ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, type..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#d1aa5c] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                ×
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d1aa5c] text-[#0E0F10] font-bold shadow-md'
                      : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/5'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Leads Feed / List ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin text-[#d1aa5c]" />
            <span className="text-xs">Chargement des choix clients...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl border border-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.02)' }}
          >
            <Sliders className="w-8 h-8 mx-auto text-white/20 mb-2" />
            <p className="text-sm text-white/60 font-medium">Aucun résultat trouvé</p>
            <p className="text-xs text-white/30 mt-1">
              {search || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Essayez de réinitialiser vos filtres.'
                : 'Les choix des visiteurs via le widget apparaîtront ici en direct.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => {
              const catMeta = CATEGORIES[lead.furniture_type] || CATEGORIES.salon
              const IconComp = catMeta.icon
              const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.nouveau
              const budgetRatio = Math.min(
                100,
                Math.max(0, ((lead.budget - 20000) / (180000 - 20000)) * 100)
              )

              // WhatsApp message with lead info
              const waText = encodeURIComponent(
                `Bonjour ${lead.customer_name} ! Nous avons bien reçu votre demande sur Château d'art pour : ${lead.furniture_title} (Budget estimé : ${lead.formatted_budget}). Êtes-vous disponible pour que notre architecte d'intérieur vous présente notre catalogue ?`
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
                  className="rounded-2xl border transition-all duration-300 p-4 md:p-5 flex flex-col justify-between group hover:border-[#d1aa5c]/40"
                  style={{
                    background: 'rgba(20, 21, 24, 0.75)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  <div>
                    {/* Top row: Category badge + Time ago */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: catMeta.bg,
                            color: catMeta.color,
                            border: `1px solid ${catMeta.border}`,
                          }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {lead.furniture_title}
                          </p>
                          <p className="text-[10px] text-white/40">{catMeta.subtitle}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-white/30" />
                        <span>{timeAgo(lead.created_at)}</span>
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                      <p className="text-sm font-semibold text-white tracking-tight">
                        {lead.customer_name}
                      </p>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs text-[#d1aa5c] hover:underline flex items-center gap-1.5 mt-0.5 font-mono cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                    </div>

                    {/* Budget Scale Visual Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-white/50 text-[10px] uppercase font-semibold">
                          Budget sélectionné
                        </span>
                        <span className="font-fraunces text-base font-light text-[#d1aa5c]">
                          {lead.formatted_budget}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${budgetRatio}%`,
                            background:
                              'linear-gradient(90deg, #b68d40 0%, #d1aa5c 50%, #f5d78e 100%)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
                        <span>20k DA</span>
                        <span>180k DA</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Status Dropdown + WhatsApp / Call Actions */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    {/* Status selector */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer"
                      style={{
                        cursor: 'pointer',
                        background: statusMeta.bg,
                        color: statusMeta.color,
                        borderColor: statusMeta.border,
                      }}
                    >
                      <option value="nouveau" className="bg-[#141518] text-[#d1aa5c]">
                        Nouveau
                      </option>
                      <option value="contacted" className="bg-[#141518] text-[#60A5FA]">
                        Contacté
                      </option>
                      <option value="negotiating" className="bg-[#141518] text-[#C084FC]">
                        En Négociation
                      </option>
                      <option value="converted" className="bg-[#141518] text-[#34D399]">
                        Vente Conclue
                      </option>
                      <option value="archived" className="bg-[#141518] text-[#94A3B8]">
                        Classé
                      </option>
                    </select>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] transition-all cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        title="Contacter sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 transition-all cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        title="Appeler directement"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(lead)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        title="Supprimer"
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
