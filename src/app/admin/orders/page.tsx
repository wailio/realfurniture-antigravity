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
  return new Date(iso).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [addingToFunnel, setAddingToFunnel] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/orders')
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

  const addToFunnel = async (order: Order) => {
    setAddingToFunnel(order.id)
    try {
      // Create a sales lead from this message
      await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: order.name,
          phone: order.phone,
          source_message_id: order.id,
          notes: `Produit: ${order.product || '—'}\n\nMessage: ${order.message}`,
        }),
      })
      // Mark message as in funnel
      await updateStatus(order.id, 'funnel')
      alert('Lead ajouté au funnel de vente ✓')
    } catch {
      alert('Erreur lors de l\'ajout au funnel')
    } finally {
      setAddingToFunnel(null)
      setActiveMenu(null)
    }
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const newCount = orders.filter(o => o.status === 'new').length

  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
      {/* Header */}
      <div
        style={{
          background: 'rgba(6, 11, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              Commandes
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
            Messages et demandes reçus via le formulaire de contact
          </p>
        </div>
      </div>

      <div style={{ padding: '36px' }}>
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[{ value: 'all', label: `Tous (${orders.length})` }, ...Object.entries(STATUS_LABELS).map(([k, v]) => ({
            value: k,
            label: `${v.label} (${orders.filter(o => o.status === k).length})`,
          }))].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                fontSize: 12.5,
                fontWeight: 600,
                border: filterStatus === tab.value ? 'none' : '1px solid rgba(255, 255, 255, 0.09)',
                cursor: 'pointer',
                background: filterStatus === tab.value ? '#d1aa5c' : 'rgba(6, 11, 25, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: filterStatus === tab.value ? '#14120f' : '#D4D4D8',
                boxShadow: filterStatus === tab.value
                  ? '0 4px 14px rgba(209, 170, 92, 0.3)'
                  : '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
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

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin text-[#d1aa5c]" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(6, 11, 25, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
            }}
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4 text-[#d1aa5c]" />
            <p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>Aucune commande pour le moment</p>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginTop: 6 }}>
              Les messages du formulaire de contact apparaîtront ici
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.new
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(6, 11, 25, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: 18,
                    border: order.status === 'new' ? '1px solid rgba(209, 170, 92, 0.45)' : '1px solid rgba(255, 255, 255, 0.09)',
                    boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  className="hover:shadow-2xl hover:border-[#60a5fa]/40"
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 99,
                      background: 'rgba(209, 170, 92, 0.12)',
                      border: '1px solid rgba(209, 170, 92, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#d1aa5c',
                    }}
                  >
                    {(order.name || '?')[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{order.name || '—'}</p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              style={{ fontSize: 12.5, color: '#D4D4D8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                              className="hover:text-[#d1aa5c]"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#d1aa5c]" />{order.phone}
                            </a>
                          )}
                          {order.email && (
                            <a
                              href={`mailto:${order.email}`}
                              style={{ fontSize: 12.5, color: '#D4D4D8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                              className="hover:text-[#d1aa5c]"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#d1aa5c]" />{order.email}
                            </a>
                          )}
                          {order.created_at && (
                            <span style={{ fontSize: 12.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                              {formatDate(order.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: st.color,
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                            padding: '3px 10px',
                            borderRadius: 99,
                          }}
                        >
                          {st.label}
                        </span>
                        {/* Actions menu */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                            style={{
                              padding: '6px',
                              borderRadius: 8,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              background: activeMenu === order.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#D4D4D8',
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenu === order.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: 6,
                                background: 'rgba(5, 9, 22, 0.96)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: 14,
                                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                minWidth: 210,
                                zIndex: 10,
                                overflow: 'hidden',
                              }}
                            >
                              {[
                                { label: 'Marquer comme lu', action: () => updateStatus(order.id, 'read'), icon: CheckCircle },
                                { label: 'Marquer en traitement', action: () => updateStatus(order.id, 'processing'), icon: Clock },
                                { label: 'Ajouter au funnel', action: () => addToFunnel(order), icon: TrendingUp, highlight: true },
                                { label: 'Clôturer', action: () => updateStatus(order.id, 'closed'), icon: X },
                              ].map((action) => (
                                <button
                                  key={action.label}
                                  onClick={action.action}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: action.highlight ? '#34d399' : '#E5E7EB',
                                    textAlign: 'left',
                                    transition: 'background 0.1s',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <action.icon className="w-4 h-4" />
                                  {action.label}
                                  {action.highlight && addingToFunnel === order.id && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {order.product && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: 'rgba(209, 170, 92, 0.12)',
                          border: '1px solid rgba(209, 170, 92, 0.25)',
                          borderRadius: 99,
                          padding: '3px 10px',
                          fontSize: 12,
                          color: '#d1aa5c',
                          marginTop: 8,
                          fontWeight: 500,
                        }}
                      >
                        <Package className="w-3 h-3" />
                        {order.product}
                      </div>
                    )}

                    {order.message && (
                      <div
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        style={{ cursor: 'pointer', marginTop: 10 }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: '#D4D4D8',
                            lineHeight: 1.6,
                            display: selectedOrder?.id === order.id ? 'block' : '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: selectedOrder?.id === order.id ? 'visible' : 'hidden',
                          }}
                        >
                          {order.message}
                        </p>
                        <button
                          style={{
                            fontSize: 12,
                            color: '#d1aa5c',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            marginTop: 4,
                            padding: 0,
                          }}
                        >
                          <ChevronDown
                            className="w-3.5 h-3.5"
                            style={{
                              transform: selectedOrder?.id === order.id ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s',
                            }}
                          />
                          {selectedOrder?.id === order.id ? 'Réduire' : 'Voir tout'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9 }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}
