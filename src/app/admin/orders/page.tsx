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
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header — Exact #0A0B0C matching sidebar, restored original size */}
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4 text-[#111827]" />
            <p style={{ color: '#111827', fontSize: 16, fontWeight: 600 }}>Aucune commande pour le moment</p>
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6 }}>
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
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: order.status === 'new' ? '1.5px solid rgba(0, 122, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                  }}
                  className="hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 99,
                      background: '#F3F4F6',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    {(order.name || '?')[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{order.name || '—'}</p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              style={{ fontSize: 12.5, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', transition: 'color 0.2s' }}
                              className="hover:text-[#007AFF]"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#6B7280]" />{order.phone}
                            </a>
                          )}
                          {order.email && (
                            <a
                              href={`mailto:${order.email}`}
                              style={{ fontSize: 12.5, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', transition: 'color 0.2s' }}
                              className="hover:text-[#007AFF]"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#6B7280]" />{order.email}
                            </a>
                          )}
                          {order.created_at && (
                            <span style={{ fontSize: 12.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                              padding: '6px 8px',
                              borderRadius: 8,
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              background: activeMenu === order.id ? '#E5E7EB' : '#F3F4F6',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#374151',
                              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
                                background: 'rgba(28, 30, 36, 0.95)',
                                backdropFilter: 'blur(28px)',
                                WebkitBackdropFilter: 'blur(28px)',
                                borderRadius: 14,
                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12)',
                                minWidth: 220,
                                zIndex: 20,
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                              }}
                            >
                              {[
                                { label: 'Marquer comme lu', action: () => updateStatus(order.id, 'read'), icon: CheckCircle },
                                { label: 'Marquer en traitement', action: () => updateStatus(order.id, 'processing'), icon: Clock },
                                { label: 'Ajouter au funnel', action: () => addToFunnel(order), icon: TrendingUp },
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
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: '#F3F4F6',
                                    borderRadius: 8,
                                    textAlign: 'left',
                                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#007AFF'
                                    e.currentTarget.style.color = '#FFFFFF'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#F3F4F6'
                                  }}
                                >
                                  <action.icon className="w-4 h-4 flex-shrink-0" />
                                  <span>{action.label}</span>
                                  {action.label === 'Ajouter au funnel' && addingToFunnel === order.id && (
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
                          gap: 6,
                          background: '#F3F4F6',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: 99,
                          padding: '3px 12px',
                          fontSize: 12,
                          color: '#1F2937',
                          marginTop: 10,
                          fontWeight: 500,
                        }}
                      >
                        <Package className="w-3.5 h-3.5 text-[#007AFF]" />
                        {order.product}
                      </div>
                    )}

                    {order.message && (
                      <div
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        style={{ cursor: 'pointer', marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#F9FAFB', border: '1px solid rgba(0, 0, 0, 0.04)' }}
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
                        <button
                          style={{
                            fontSize: 12,
                            color: '#007AFF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            marginTop: 6,
                            padding: 0,
                            fontWeight: 500,
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
