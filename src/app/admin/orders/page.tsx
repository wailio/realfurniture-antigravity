'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { IosMenu } from '@/components/ui/ios-menu'
import { useAdminTheme } from '@/contexts/theme-context'
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  Search,
  MessageCircle,
  Trash2,
  ArrowUpRight,
  Armchair,
} from 'lucide-react'

interface Order {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  product: string
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string; darkBg: string; darkBorder: string }> = {
  new: { label: 'Nouveau', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', darkBg: 'rgba(245,158,11,0.15)', darkBorder: 'rgba(245,158,11,0.3)' },
  read: { label: 'Lu', color: '#94A3B8', bg: '#F1F5F9', border: '#E2E8F0', darkBg: 'rgba(255,255,255,0.08)', darkBorder: 'rgba(255,255,255,0.12)' },
  processing: { label: 'En traitement', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', darkBg: 'rgba(59,130,246,0.15)', darkBorder: 'rgba(59,130,246,0.3)' },
  funnel: { label: 'Dans le CRM Ventes', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', darkBg: 'rgba(16,185,129,0.15)', darkBorder: 'rgba(16,185,129,0.3)' },
  closed: { label: 'Clôturé', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', darkBg: 'rgba(255,255,255,0.05)', darkBorder: 'rgba(255,255,255,0.08)' },
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    name: 'Karim Hadj-Ali',
    email: 'karim.hadjali@gmail.com',
    phone: '0550 44 21 98',
    subject: 'Demande Devis Salon Modulable Royal',
    message: 'Bonjour M&F Meubles, je souhaite un devis personnalisé pour le Salon Modulable Royal en velours taupe avec livraison à Hydra, Alger. Pouvez-vous me confirmer les délais de fabrication ?',
    product: 'Salon Modulable Royal',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'ord-102',
    name: 'Amina Benali',
    email: 'amina.benali@outlook.com',
    phone: '0661 72 39 40',
    subject: 'Visite Showroom & Chambre Prestige',
    message: 'Bonjour, je prépare mon trousseau et je souhaite visiter votre showroom de Kouba ce samedi pour découvrir la Suite Parentale Prestige et les finitions noyer.',
    product: 'Suite Parentale Prestige',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
  },
  {
    id: 'ord-103',
    name: 'Rachid Mebarki',
    email: 'r.mebarki@yahoo.fr',
    phone: '0770 19 88 34',
    subject: 'Table Salle à Manger Toscane 8 Couverts',
    message: 'Demande pour une table de salle à manger marbre céramique blanc avec 8 chaises velours vert émeraude. Livraison demandée sur Oran.',
    product: 'Salle à Manger Toscane',
    status: 'processing',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
  {
    id: 'ord-104',
    name: 'Selma Khelifi',
    email: 'selma.khelifi@gmail.com',
    phone: '0555 88 12 04',
    subject: 'Fauteuil Bouclette & Table Basse',
    message: 'Est-il possible de commander le fauteuil bouclette avec pied laqué laiton brossé ? Merci de me faire parvenir la fiche technique.',
    product: 'Fauteuil Sculptural Bouclette',
    status: 'read',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(),
  },
  {
    id: 'ord-105',
    name: 'Nadir Brahimi',
    email: 'nadir.brahimi@gmail.com',
    phone: '0770 34 56 78',
    subject: 'Agencement Villa Bir Mourad Raïs',
    message: 'Projet complet salon de réception + salle à manger + dressing sur mesure. Demande de contact direct avec votre architecte d\'intérieur.',
    product: 'Agencement Sur-Mesure',
    status: 'funnel',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-DZ', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function getWhatsAppUrl(phone: string, name: string, product?: string) {
  let clean = (phone || '').replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) {
    clean = '213' + clean.slice(1)
  } else if (!clean.startsWith('213') && clean.length === 9) {
    clean = '213' + clean
  }
  const text = encodeURIComponent(
    `Bonjour ${name || 'cher client'},\n\nNous faisons suite à votre demande sur M&F Meubles${product ? ` pour le modèle "${product}"` : ''}.\n\nComment pouvons-nous vous accompagner aujourd'hui ?`
  )
  return `https://wa.me/${clean}?text=${text}`
}

export default function AdminOrdersPage() {
  const { isDark } = useAdminTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailModalOrder, setDetailModalOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [addingToFunnel, setAddingToFunnel] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/orders?t=' + Date.now(), { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      const rawList = Array.isArray(data) && data.length > 0 ? data : DEFAULT_ORDERS
      setOrders(rawList)
    } catch {
      setOrders(DEFAULT_ORDERS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      showIosToast('Statut mis à jour avec succès ✓', 'success')
    } catch {
      showIosToast('Erreur lors de la mise à jour', 'error')
    }
    setActiveMenu(null)
  }

  const addToFunnel = async (order: Order, redirectNow = true) => {
    setAddingToFunnel(order.id)
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: order.name,
          phone: order.phone,
          source_message_id: order.id,
          notes: `Produit: ${order.product || 'Demande générale'}\nEmail: ${order.email || '—'}\n\nMessage client:\n${order.message || ''}`,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur lors de la création du lead')
      }

      await updateStatus(order.id, 'funnel')

      if (redirectNow) {
        window.location.href = '/admin/sales'
      } else {
        showIosToast('Lead ajouté au CRM Ventes avec succès ✓', 'success')
      }
    } catch (err: any) {
      showIosToast(err.message || 'Erreur lors de l\'ajout au funnel', 'error')
    } finally {
      setAddingToFunnel(null)
      setActiveMenu(null)
    }
  }

  const deleteOrder = async (id: string) => {
    const confirmed = await showIosConfirm({
      title: 'Supprimer le message',
      message: 'Voulez-vous supprimer définitivement cette demande client ?',
      confirmText: 'Supprimer',
      isDestructive: true,
    })
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur de suppression')
      setOrders(prev => prev.filter(o => o.id !== id))
      showIosToast('Demande client supprimée ✓', 'info')
    } catch {
      showIosToast('Erreur lors de la suppression', 'error')
    } finally {
      setActiveMenu(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    const q = search.toLowerCase().trim()
    const matchesSearch =
      q === '' ||
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.phone && o.phone.toLowerCase().includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q)) ||
      (o.product && o.product.toLowerCase().includes(q)) ||
      (o.message && o.message.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const newCount = orders.filter(o => o.status === 'new').length
  const funnelCount = orders.filter(o => o.status === 'funnel').length
  const processingCount = orders.filter(o => o.status === 'processing').length

  const getBadgeStyle = (stKey: string) => {
    const st = STATUS_LABELS[stKey] || STATUS_LABELS.new
    return {
      color: st.color,
      background: isDark ? st.darkBg : st.bg,
      border: `1px solid ${isDark ? st.darkBorder : st.border}`,
    }
  }

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
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontWeight: 400,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            Commandes &amp; Demandes <span style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>• M&amp;F Meubles</span>
          </h1>
          {newCount > 0 && (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 99,
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: 10.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={`${newCount} nouvelle(s) demande(s)`}
            >
              {newCount}
            </span>
          )}
        </div>

        {/* CRM Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              background: isDark ? '#2C2C2E' : '#E8EAED',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
              padding: '6px 12px',
              borderRadius: 12,
            }}
          >
            <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>
              En cours: <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>{processingCount}</strong>
            </span>
          </div>

          <a
            href="/admin/sales"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isDark ? 'rgba(255,255,255,0.12)' : '#0F172A',
              color: '#FFFFFF',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : 'none',
              padding: '7px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,23,42,0.12)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : '#1E293B')}
            onMouseLeave={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : '#0F172A')}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>CRM Ventes ({funnelCount})</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
        {/* Search & Status Filter Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status filter tabs (Apple iOS segmented control) */}
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
            {[{ value: 'all', label: `Tous (${orders.length})` }, ...Object.entries(STATUS_LABELS).map(([k, v]) => ({
              value: k,
              label: `${v.label} (${orders.filter(o => o.status === k).length})`,
            }))].map(tab => {
              const isActive = filterStatus === tab.value
              return (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 11,
                    fontSize: 11.5,
                    fontWeight: isActive ? 600 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
                    color: isActive ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? 'rgba(235,235,245,0.6)' : '#64748B'),
                    boxShadow: isActive ? (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.08)') : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  className={!isActive ? (isDark ? 'hover:text-white' : 'hover:text-[#0F172A]') : ''}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search box (Apple capsule pill) */}
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
              placeholder="Rechercher client, téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
              <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <X className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
              border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              color: isDark ? '#FF453A' : '#DC2626',
              fontSize: 13,
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 20,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4 text-[#94A3B8]" />
            <p style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 16, fontWeight: 700 }}>
              {search ? 'Aucune demande ne correspond à votre recherche' : 'Aucune commande dans cette sélection'}
            </p>
            <p style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontSize: 13, marginTop: 6 }}>
              {search ? 'Essayez avec un autre nom, numéro ou terme de recherche.' : 'Les messages du formulaire de contact et devis apparaîtront ici.'}
            </p>
            {(search || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setFilterStatus('all'); }}
                style={{
                  marginTop: 16,
                  padding: '8px 18px',
                  background: isDark ? '#FFFFFF' : '#0F172A',
                  color: isDark ? '#000000' : '#FFFFFF',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── MOBILE LEADS GRID (2 per line) ── */}
            <div className="grid grid-cols-2 gap-2.5 md:hidden mb-4">
              {filtered.map(order => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.new
                const isInFunnel = order.status === 'funnel'

                return (
                  <div
                    key={order.id}
                    onClick={() => setDetailModalOrder(order)}
                    style={{
                      background: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderRadius: 18,
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #DFE3E8',
                      padding: '14px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 160,
                      boxShadow: isDark
                        ? '0 2px 8px rgba(0,0,0,0.3)'
                        : '0 1px 2px rgba(15, 23, 42, 0.03), 0 4px 14px -2px rgba(15, 23, 42, 0.05)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s ease, border-color 0.2s ease',
                    }}
                    className="hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {/* Top Row: Initial Avatar + Status Dot */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isInFunnel
                            ? (isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5')
                            : (isDark ? '#2C2C2E' : '#F1F5F9'),
                          border: isInFunnel
                            ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0')
                            : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          color: isInFunnel ? '#10B981' : (isDark ? '#FFFFFF' : '#0F172A'),
                        }}
                      >
                        {(order.name || '?')[0].toUpperCase()}
                      </div>
                      {order.status === 'new' ? (
                        <span style={{ width: 8, height: 8, borderRadius: 99, background: '#EF4444' }} />
                      ) : (
                        <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }}>
                          {formatDate(order.created_at).split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Middle: Name & Phone */}
                    <div style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {order.name || 'Client sans nom'}
                      </p>
                      {order.phone && (
                        <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Phone className="w-3 h-3 text-[#94A3B8] shrink-0" />
                          <span className="truncate">{order.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Bottom: Status & Product Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                      {order.status === 'new' ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#F59E0B',
                            borderBottom: '1.5px solid #F59E0B',
                            paddingBottom: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            width: 'fit-content',
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444' }} />
                          Nouveau
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            ...getBadgeStyle(order.status),
                            padding: '2px 7px',
                            borderRadius: 99,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            width: 'fit-content',
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
                          {st.label}
                        </span>
                      )}

                      {order.product ? (
                        <span
                          style={{
                            fontSize: 10,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            background: isDark ? '#2C2C2E' : '#F1F5F9',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                            padding: '2px 6px',
                            borderRadius: 6,
                            width: 'fit-content',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            fontWeight: 600,
                          }}
                        >
                          {order.product}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }}>Demande générale</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── DESKTOP ORDERS LIST (Visible on md and larger) ── */}
            <div className="hidden md:flex flex-col gap-3.5">
              {filtered.map(order => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.new
                const isMenuOpen = activeMenu === order.id
                const isInFunnel = order.status === 'funnel'

                return (
                  <div
                    key={order.id}
                    style={{
                      background: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderRadius: 18,
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                      boxShadow: isMenuOpen
                        ? (isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(15,23,42,0.08)')
                        : (isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px rgba(15,23,42,0.02)'),
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      position: 'relative',
                      zIndex: isMenuOpen ? 50 : 1,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    }}
                  >
                    {/* Client Avatar */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isInFunnel
                          ? (isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5')
                          : (isDark ? '#2C2C2E' : '#F1F5F9'),
                        border: isInFunnel
                          ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0')
                          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: isInFunnel ? '#10B981' : (isDark ? '#FFFFFF' : '#0F172A'),
                      }}
                    >
                      {(order.name || '?')[0].toUpperCase()}
                    </div>

                    {/* Main Card Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontSize: 15.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                              {order.name || 'Client sans nom'}
                            </p>
                            {order.status === 'new' && (
                              <span style={{ width: 7, height: 7, borderRadius: 99, background: '#EF4444' }} />
                            )}
                          </div>

                          {/* Customer contact links */}
                          <div style={{ display: 'flex', gap: 14, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {order.phone && (
                              <a
                                href={`tel:${order.phone}`}
                                style={{ fontSize: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                                className={isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'}
                              >
                                <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                                <span>{order.phone}</span>
                              </a>
                            )}
                            {order.email && (
                              <a
                                href={`mailto:${order.email}`}
                                style={{ fontSize: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                                className={isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'}
                              >
                                <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                                <span>{order.email}</span>
                              </a>
                            )}
                            {order.created_at && (
                              <span style={{ fontSize: 12.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                                {formatDate(order.created_at)}
                              </span>
                            )}

                            {order.product && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '3px 9px',
                                  borderRadius: 8,
                                  background: isDark ? '#2C2C2E' : '#F8FAFC',
                                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                  color: isDark ? '#FFFFFF' : '#0F172A',
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                <Armchair className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                                <span style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 500, fontSize: 11 }}>Pièce :</span>
                                <span style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>{order.product}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Action Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          {/* Status Badge */}
                          {order.status === 'new' ? (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#F59E0B',
                                borderBottom: '1.5px solid #F59E0B',
                                paddingBottom: 2,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                cursor: 'default',
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                              Nouveau
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                ...getBadgeStyle(order.status),
                                padding: '4px 10px',
                                borderRadius: 99,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                              }}
                            >
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
                              {st.label}
                            </span>
                          )}

                          {/* Quick WhatsApp CRM Button */}
                          {order.phone && (
                            <a
                              href={getWhatsAppUrl(order.phone, order.name, order.product)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ouvrir conversation WhatsApp"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 12px',
                                borderRadius: 10,
                                background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                                border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                                color: isDark ? '#30D158' : '#047857',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* Primary Action Button: Funnel de vente */}
                          {isInFunnel ? (
                            <a
                              href="/admin/sales"
                              title="Voir dans le CRM Ventes"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 13px',
                                borderRadius: 10,
                                background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                                border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                                color: isDark ? '#30D158' : '#047857',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>Dans Ventes ↗</span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToFunnel(order, true)}
                              disabled={addingToFunnel === order.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '7px 14px',
                                borderRadius: 10,
                                background: isDark ? 'rgba(255,255,255,0.15)' : '#0F172A',
                                color: '#FFFFFF',
                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: addingToFunnel === order.id ? 'wait' : 'pointer',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              {addingToFunnel === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              ) : (
                                <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                              )}
                              <span>+ CRM Ventes</span>
                            </button>
                          )}

                          {/* 3-Dots Settings Menu Container */}
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setActiveMenu(isMenuOpen ? null : order.id)
                              }}
                              style={{
                                padding: '7px 9px',
                                borderRadius: 8,
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                                background: isMenuOpen ? (isDark ? '#3A3A3C' : '#F1F5F9') : (isDark ? '#2C2C2E' : '#FFFFFF'),
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                                transition: 'all 0.15s',
                              }}
                              title="Actions &amp; Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* iOS Frosted Glass Context Menu */}
                            <IosMenu
                              isOpen={isMenuOpen}
                              onClose={() => setActiveMenu(null)}
                              align="right"
                              minWidth={230}
                              items={[
                                {
                                  id: 'funnel',
                                  label: isInFunnel ? 'Ouvrir dans Ventes ↗' : 'Ajouter au CRM Ventes',
                                  icon: <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />,
                                  onClick: () => addToFunnel(order, true),
                                },
                                ...(order.phone ? [{
                                  id: 'whatsapp',
                                  label: 'Contacter sur WhatsApp',
                                  icon: <MessageCircle className="w-3.5 h-3.5 text-[#30D158]" />,
                                  onClick: () => window.open(getWhatsAppUrl(order.phone, order.name, order.product), '_blank'),
                                }] : []),
                                {
                                  id: 'mark-read',
                                  label: 'Marquer comme lu',
                                  icon: <CheckCircle className="w-3.5 h-3.5" />,
                                  checked: order.status === 'read',
                                  onClick: () => updateStatus(order.id, 'read'),
                                },
                                {
                                  id: 'mark-processing',
                                  label: 'Marquer en traitement',
                                  icon: <Clock className="w-3.5 h-3.5" />,
                                  checked: order.status === 'processing',
                                  onClick: () => updateStatus(order.id, 'processing'),
                                },
                                {
                                  id: 'mark-closed',
                                  label: 'Clôturer le dossier',
                                  icon: <X className="w-3.5 h-3.5" />,
                                  checked: order.status === 'closed',
                                  onClick: () => updateStatus(order.id, 'closed'),
                                },
                                {
                                  id: 'delete',
                                  label: 'Supprimer la demande',
                                  icon: <Trash2 className="w-3.5 h-3.5" />,
                                  destructive: true,
                                  onClick: () => deleteOrder(order.id),
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message content box */}
                      {order.message && (
                        <div
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          style={{
                            cursor: 'pointer',
                            marginTop: 12,
                            padding: '12px 16px',
                            borderRadius: 12,
                            background: isDark ? '#2C2C2E' : '#F8FAFC',
                            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: isDark ? 'rgba(235,235,245,0.85)' : '#334155',
                              lineHeight: 1.6,
                              display: selectedOrder?.id === order.id ? 'block' : '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: selectedOrder?.id === order.id ? 'visible' : 'hidden',
                            }}
                          >
                            {order.message}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 6,
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: isDark ? '#0A84FF' : '#2563EB',
                            }}
                          >
                            <ChevronDown
                              className="w-3.5 h-3.5"
                              style={{
                                transform: selectedOrder?.id === order.id ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s',
                              }}
                            />
                            <span>{selectedOrder?.id === order.id ? 'Réduire' : 'Afficher tout le message'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── FULL SCREEN iOS DETAIL MODAL ── */}
      {detailModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
          }}
          onClick={() => setDetailModalOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
              borderRadius: 20,
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: isDark
                ? '0 25px 60px -10px rgba(0,0,0,0.8)'
                : '0 25px 60px -10px rgba(15,23,42,0.2)',
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: detailModalOrder.status === 'funnel'
                      ? (isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5')
                      : (isDark ? '#2C2C2E' : '#F1F5F9'),
                    border: detailModalOrder.status === 'funnel'
                      ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0')
                      : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    color: detailModalOrder.status === 'funnel' ? '#10B981' : (isDark ? '#FFFFFF' : '#0F172A'),
                  }}
                >
                  {(detailModalOrder.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>
                    {detailModalOrder.name || 'Client sans nom'}
                  </h3>
                  <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2 }}>
                    Reçu le {formatDate(detailModalOrder.created_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOrder(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  background: isDark ? '#2C2C2E' : '#F1F5F9',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions (Call & WhatsApp) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {detailModalOrder.phone ? (
                <a
                  href={`tel:${detailModalOrder.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px',
                    borderRadius: 10,
                    background: isDark ? '#2C2C2E' : '#F1F5F9',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  <span>Appeler</span>
                </a>
              ) : null}

              {detailModalOrder.phone ? (
                <a
                  href={getWhatsAppUrl(detailModalOrder.phone, detailModalOrder.name, detailModalOrder.product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px',
                    borderRadius: 10,
                    background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                    border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                    color: isDark ? '#30D158' : '#047857',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle className="w-4 h-4 text-[#10B981]" />
                  <span>WhatsApp</span>
                </a>
              ) : null}
            </div>

            {/* Contact Details */}
            <div style={{ background: isDark ? '#2C2C2E' : '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' }}>
              {detailModalOrder.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0', fontSize: 12.5 }}>
                  <span style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>Téléphone</span>
                  <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 600 }}>{detailModalOrder.phone}</span>
                </div>
              )}
              {detailModalOrder.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0', fontSize: 12.5 }}>
                  <span style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>Email</span>
                  <a href={`mailto:${detailModalOrder.email}`} style={{ color: isDark ? '#0A84FF' : '#2563EB', textDecoration: 'none', fontWeight: 500 }}>{detailModalOrder.email}</a>
                </div>
              )}
              {detailModalOrder.product && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                  <span style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>Modèle demandé</span>
                  <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 600 }}>{detailModalOrder.product}</span>
                </div>
              )}
            </div>

            {/* Full Message */}
            {detailModalOrder.message && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>
                  Message du client
                </label>
                <div style={{ background: isDark ? '#2C2C2E' : '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', color: isDark ? 'rgba(235,235,245,0.9)' : '#334155', fontSize: 13, lineHeight: 1.55 }}>
                  {detailModalOrder.message}
                </div>
              </div>
            )}

            {/* Change Status Pills */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                Statut du dossier
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_LABELS).map(([stKey, stVal]) => (
                  <button
                    key={stKey}
                    type="button"
                    onClick={() => {
                      updateStatus(detailModalOrder.id, stKey)
                      setDetailModalOrder(prev => prev ? { ...prev, status: stKey } : null)
                    }}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: detailModalOrder.status === stKey ? `1.5px solid ${stVal.color}` : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                      background: detailModalOrder.status === stKey ? (isDark ? stVal.darkBg : stVal.bg) : (isDark ? '#2C2C2E' : '#F8FAFC'),
                      color: detailModalOrder.status === stKey ? stVal.color : (isDark ? 'rgba(235,235,245,0.6)' : '#64748B'),
                    }}
                  >
                    {stVal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, paddingTop: 10, borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9' }}>
              {detailModalOrder.status === 'funnel' ? (
                <a
                  href="/admin/sales"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                  }}
                >
                  <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                  <span>Ouvrir dans le CRM Ventes ↗</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await addToFunnel(detailModalOrder, true)
                    setDetailModalOrder(prev => prev ? { ...prev, status: 'funnel' } : null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    border: 'none',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                  }}
                >
                  <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                  <span>+ Ajouter au CRM Ventes</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  deleteOrder(detailModalOrder.id)
                  setDetailModalOrder(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '9px',
                  borderRadius: 10,
                  background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                  border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA',
                  color: isDark ? '#FF453A' : '#DC2626',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer cette demande</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
