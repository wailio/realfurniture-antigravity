'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Phone,
  Mail,
  Package,
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
  ExternalLink,
  Sparkles,
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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'Nouveau', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  read: { label: 'Lu', color: '#A1A1AA', bg: 'rgba(255, 255, 255, 0.06)', border: 'rgba(255, 255, 255, 0.1)' },
  processing: { label: 'En traitement', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  funnel: { label: 'Dans le funnel', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  closed: { label: 'Clôturé', color: '#71717A', bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)' },
}

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
    `Bonjour ${name || 'cher client'},\n\nNous faisons suite à votre demande sur Château d'art${product ? ` pour le modèle "${product}"` : ''}.\n\nComment pouvons-nous vous accompagner aujourd'hui ?`
  )
  return `https://wa.me/${clean}?text=${text}`
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
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
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError('Impossible de charger les commandes. Vérifiez la configuration Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Close active menu on Escape key
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
    } catch {
      alert('Erreur lors de la mise à jour')
    }
    setActiveMenu(null)
  }

  const addToFunnel = async (order: Order, redirectNow = true) => {
    setAddingToFunnel(order.id)
    try {
      // 1. Create or link a sales lead in /api/admin/sales
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

      // 2. Mark message as in funnel in Supabase
      await updateStatus(order.id, 'funnel')

      // 3. Smoothly navigate to /admin/sales as requested
      if (redirectNow) {
        window.location.href = '/admin/sales'
      } else {
        alert('Lead ajouté au funnel de vente avec succès ✓')
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout au funnel')
    } finally {
      setAddingToFunnel(null)
      setActiveMenu(null)
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Supprimer définitivement cette commande / message client ?')) return
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur de suppression')
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
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

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header — #0A0B0C matching dark sidebar */}
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 26,
                fontWeight: 300,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Commandes &amp; Demandes
            </h1>
            {newCount > 0 && (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 99,
                }}
              >
                {newCount} nouveau{newCount > 1 ? 'x' : ''}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
            Gestion centralisée des messages clients et conversion en opportunités de vente
          </p>
        </div>

        {/* CRM Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px 14px',
              borderRadius: 12,
            }}
          >
            <Clock className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span style={{ fontSize: 12, color: '#D4D4D8' }}>
              En cours: <strong style={{ color: '#FFFFFF' }}>{processingCount}</strong>
            </span>
          </div>

          <a
            href="/admin/sales"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
              color: '#0A0B0C',
              padding: '9px 18px',
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(209, 170, 92, 0.25)',
              transition: 'all 0.15s',
            }}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pipeline Ventes ({funnelCount})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div style={{ padding: '36px' }}>
        {/* Search & Status Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ value: 'all', label: `Tous (${orders.length})` }, ...Object.entries(STATUS_LABELS).map(([k, v]) => ({
              value: k,
              label: `${v.label} (${orders.filter(o => o.status === k).length})`,
            }))].map(tab => (
              <button
                type="button"
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: filterStatus === tab.value ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  background: filterStatus === tab.value ? '#111827' : '#FFFFFF',
                  color: filterStatus === tab.value ? '#FFFFFF' : '#374151',
                  boxShadow: filterStatus === tab.value
                    ? '0 3px 12px rgba(0, 0, 0, 0.2)'
                    : '0 1px 4px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={filterStatus !== tab.value ? 'hover:bg-[#F3F4F6] hover:text-[#111827]' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '9px 16px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              width: 280,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Rechercher client, téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#111827',
                width: '100%',
              }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              color: '#f87171',
              fontSize: 13.5,
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin text-[#d1aa5c]" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4 text-[#111827]" />
            <p style={{ color: '#111827', fontSize: 16, fontWeight: 600 }}>
              {search ? 'Aucune demande ne correspond à votre recherche' : 'Aucune commande dans cette sélection'}
            </p>
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6 }}>
              {search ? 'Essayez avec un autre nom, numéro ou terme de recherche.' : 'Les messages du formulaire de contact apparaîtront ici.'}
            </p>
            {(search || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setFilterStatus('all'); }}
                style={{
                  marginTop: 16,
                  padding: '9px 18px',
                  background: '#111827',
                  color: '#FFFFFF',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.new
              const isMenuOpen = activeMenu === order.id
              const isInFunnel = order.status === 'funnel'

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 18,
                    border: order.status === 'new' ? '1.5px solid rgba(0, 122, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isMenuOpen
                      ? '0 12px 30px -4px rgba(0, 0, 0, 0.12)'
                      : '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    position: 'relative',
                    zIndex: isMenuOpen ? 50 : 1,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="hover:shadow-lg"
                >
                  {/* Client Avatar */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: isInFunnel ? 'rgba(209, 170, 92, 0.15)' : '#F3F4F6',
                      border: isInFunnel ? '1px solid rgba(209, 170, 92, 0.3)' : '1px solid rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 17,
                      fontWeight: 700,
                      color: isInFunnel ? '#b89347' : '#111827',
                    }}
                  >
                    {(order.name || '?')[0].toUpperCase()}
                  </div>

                  {/* Main Card Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                            {order.name || 'Client sans nom'}
                          </p>
                          {order.status === 'new' && (
                            <span style={{ width: 7, height: 7, borderRadius: 99, background: '#007AFF' }} />
                          )}
                        </div>

                        {/* Customer contact links */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 5, flexWrap: 'wrap' }}>
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              style={{ fontSize: 13, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                              className="hover:text-[#007AFF]"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>{order.phone}</span>
                            </a>
                          )}
                          {order.email && (
                            <a
                              href={`mailto:${order.email}`}
                              style={{ fontSize: 13, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                              className="hover:text-[#007AFF]"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>{order.email}</span>
                            </a>
                          )}
                          {order.created_at && (
                            <span style={{ fontSize: 12.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                              {formatDate(order.created_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick Action Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* Status Badge */}
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: st.color,
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                            padding: '4px 11px',
                            borderRadius: 99,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: 99, background: st.color }} />
                          {st.label}
                        </span>

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
                              padding: '7px 13px',
                              borderRadius: 10,
                              background: 'rgba(37, 211, 102, 0.12)',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              color: '#16a34a',
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.15s',
                            }}
                            className="hover:bg-[#25D366] hover:text-white"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Primary Funnel Action Button */}
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
                              background: 'rgba(209, 170, 92, 0.15)',
                              border: '1px solid rgba(209, 170, 92, 0.4)',
                              color: '#b89347',
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.15s',
                            }}
                            className="hover:bg-[#d1aa5c] hover:text-[#0A0B0C]"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
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
                              gap: 6,
                              padding: '7px 13px',
                              borderRadius: 10,
                              background: '#111827',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: addingToFunnel === order.id ? 'wait' : 'pointer',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              transition: 'all 0.15s',
                            }}
                            className="hover:bg-[#d1aa5c] hover:text-[#0A0B0C]"
                          >
                            {addingToFunnel === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d1aa5c]" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5 text-[#d1aa5c]" />
                            )}
                            <span>+ Ajouter au funnel</span>
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
                              borderRadius: 10,
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              background: isMenuOpen ? '#E5E7EB' : '#F3F4F6',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#374151',
                              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                            title="Actions &amp; Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Apple-style Frosted Glass Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 6px)',
                                background: 'rgba(26, 28, 34, 0.98)',
                                backdropFilter: 'blur(30px)',
                                WebkitBackdropFilter: 'blur(30px)',
                                borderRadius: 16,
                                boxShadow: '0 24px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)',
                                minWidth: 240,
                                zIndex: 60,
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                              }}
                            >
                              {/* Funnel Redirection Item */}
                              <button
                                type="button"
                                onClick={() => addToFunnel(order, true)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '9px 12px',
                                  border: 'none',
                                  background: 'rgba(209, 170, 92, 0.12)',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: '#d1aa5c',
                                  borderRadius: 10,
                                  textAlign: 'left',
                                  transition: 'all 0.15s',
                                }}
                                className="hover:bg-[#d1aa5c] hover:text-[#0A0B0C]"
                              >
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                <span>{isInFunnel ? 'Ouvrir dans Ventes ↗' : 'Ajouter au funnel & Ouvrir'}</span>
                                {addingToFunnel === order.id && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />
                                )}
                              </button>

                              {/* WhatsApp Direct Action */}
                              {order.phone && (
                                <a
                                  href={getWhatsAppUrl(order.phone, order.name, order.product)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveMenu(null)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    padding: '9px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    color: '#4ade80',
                                    borderRadius: 10,
                                    textAlign: 'left',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s',
                                  }}
                                  className="hover:bg-white/10"
                                >
                                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>Contacter sur WhatsApp</span>
                                </a>
                              )}

                              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '4px 6px' }} />

                              {/* Status Sub-options */}
                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'read')}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#E5E7EB',
                                  borderRadius: 10,
                                  textAlign: 'left',
                                  transition: 'all 0.15s',
                                }}
                                className="hover:bg-white/10"
                              >
                                <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#9CA3AF]" />
                                <span>Marquer comme lu</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'processing')}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#E5E7EB',
                                  borderRadius: 10,
                                  textAlign: 'left',
                                  transition: 'all 0.15s',
                                }}
                                className="hover:bg-white/10"
                              >
                                <Clock className="w-4 h-4 flex-shrink-0 text-[#60a5fa]" />
                                <span>Marquer en traitement</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'closed')}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#E5E7EB',
                                  borderRadius: 10,
                                  textAlign: 'left',
                                  transition: 'all 0.15s',
                                }}
                                className="hover:bg-white/10"
                              >
                                <X className="w-4 h-4 flex-shrink-0 text-[#9CA3AF]" />
                                <span>Clôturer le dossier</span>
                              </button>

                              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '4px 6px' }} />

                              {/* Delete message item */}
                              <button
                                type="button"
                                onClick={() => deleteOrder(order.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#f87171',
                                  borderRadius: 10,
                                  textAlign: 'left',
                                  transition: 'all 0.15s',
                                }}
                                className="hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4 flex-shrink-0" />
                                <span>Supprimer la demande</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product requested tag */}
                    {order.product && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#F3F4F6',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: 99,
                          padding: '4px 12px',
                          fontSize: 12,
                          color: '#1F2937',
                          marginTop: 10,
                          fontWeight: 500,
                        }}
                      >
                        <Package className="w-3.5 h-3.5 text-[#d1aa5c]" />
                        <span>Modèle demandé : <strong>{order.product}</strong></span>
                      </div>
                    )}

                    {/* Message content box */}
                    {order.message && (
                      <div
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        style={{
                          cursor: 'pointer',
                          marginTop: 12,
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: '#F9FAFB',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: '#374151',
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
                            color: '#007AFF',
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
        )}
      </div>

      {/* Invisible Full-Screen Backdrop to smoothly dismiss open 3-dots menu */}
      {activeMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'transparent',
          }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}
