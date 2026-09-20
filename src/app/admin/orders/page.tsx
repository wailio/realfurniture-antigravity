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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'Nouveau', color: '#d97706', bg: '#fffbeb' },
  read: { label: 'Lu', color: '#6B7280', bg: '#F6F5F3' },
  processing: { label: 'En traitement', color: '#2563eb', bg: '#eff6ff' },
  funnel: { label: 'Dans le funnel', color: '#059669', bg: '#ecfdf5' },
  closed: { label: 'Clôturé', color: '#9CA3AF', bg: '#F9FAFB' },
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1E1912 0%, #2c2418 50%, #8b7344 100%)' }}>
      {/* Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
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
                color: '#0E0F10',
                letterSpacing: '-0.02em',
              }}
            >
              Commandes
            </h1>
            {newCount > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#fff',
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
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            Messages et demandes reçus via le formulaire de contact
          </p>
        </div>
      </div>

      <div style={{ padding: '36px' }}>
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {[{ value: 'all', label: `Tous (${orders.length})` }, ...Object.entries(STATUS_LABELS).map(([k, v]) => ({
            value: k,
            label: `${v.label} (${orders.filter(o => o.status === k).length})`,
          }))].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              style={{
                padding: '7px 15px',
                borderRadius: 99,
                fontSize: 12.5,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: filterStatus === tab.value ? '#0E0F10' : '#FFFFFF',
                color: filterStatus === tab.value ? '#F2F1EF' : '#6B7280',
                boxShadow: filterStatus === tab.value ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
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
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              color: '#dc2626',
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
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#9CA3AF' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
            <p style={{ color: '#6B7280', fontSize: 14 }}>Aucune commande pour le moment</p>
            <p style={{ color: '#9CA3AF', fontSize: 12.5, marginTop: 6 }}>
              Les messages du formulaire de contact apparaîtront ici
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.new
              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: `1px solid ${order.status === 'new' ? '#fde68a' : 'rgba(0,0,0,0.05)'}`,
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    transition: 'box-shadow 0.2s',
                    position: 'relative',
                  }}
                  className="hover:shadow-sm"
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 99,
                      background: '#F6F5F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    {(order.name || '?')[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0E0F10' }}>{order.name || '—'}</p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              style={{ fontSize: 12.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                            >
                              <Phone className="w-3.5 h-3.5" />{order.phone}
                            </a>
                          )}
                          {order.email && (
                            <a
                              href={`mailto:${order.email}`}
                              style={{ fontSize: 12.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                            >
                              <Mail className="w-3.5 h-3.5" />{order.email}
                            </a>
                          )}
                          {order.created_at && (
                            <span style={{ fontSize: 12.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar className="w-3.5 h-3.5" />
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
                              border: 'none',
                              background: activeMenu === order.id ? '#F6F5F3' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#6B7280',
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
                                marginTop: 4,
                                background: '#FFFFFF',
                                borderRadius: 12,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                                border: '1px solid rgba(0,0,0,0.06)',
                                minWidth: 200,
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
                                    padding: '11px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: action.highlight ? '#059669' : '#374151',
                                    textAlign: 'left',
                                    transition: 'background 0.1s',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#F6F5F3')}
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
                          background: '#F6F5F3',
                          borderRadius: 99,
                          padding: '3px 10px',
                          fontSize: 12,
                          color: '#374151',
                          marginTop: 8,
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
                            color: '#6B7280',
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
                            color: '#9CA3AF',
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
