'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  Phone,
  MoveRight,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  StickyNote,
  Check,
  X,
} from 'lucide-react'

interface Lead {
  id: string
  customer_name: string
  phone: string
  amount?: number | null
  funnel_stage: string
  notes: string
  created_at: string
  messages?: {
    product?: string
    message?: string
    email?: string
  } | null
}

const STAGES = [
  { key: 'cold', label: 'Cold lead', color: '#94A3B8', bg: '#F1F5F9', dot: '#94A3B8' },
  { key: 'interested', label: 'Intéressé', color: '#F59E0B', bg: '#FFFBEB', dot: '#F59E0B' },
  { key: 'delivering', label: 'En livraison', color: '#3B82F6', bg: '#EFF6FF', dot: '#3B82F6' },
  { key: 'completed', label: 'Vente conclue', color: '#10B981', bg: '#ECFDF5', dot: '#10B981' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'short',
  })
}

export default function AdminSalesPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [movingId, setMovingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/sales')
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch {
      setError('Impossible de charger le funnel. Vérifiez la configuration Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const moveStage = async (lead: Lead, direction: 'next' | 'prev') => {
    const idx = STAGES.findIndex(s => s.key === lead.funnel_stage)
    const newIdx = direction === 'next' ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= STAGES.length) return

    setMovingId(lead.id)
    try {
      await fetch('/api/admin/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, funnel_stage: STAGES[newIdx].key }),
      })
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, funnel_stage: STAGES[newIdx].key } : l))
    } catch {
      alert('Erreur lors du déplacement')
    } finally {
      setMovingId(null)
    }
  }

  const saveNotes = async (id: string) => {
    try {
      await fetch('/api/admin/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: notesValue }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: notesValue } : l))
      setEditingNotes(null)
    } catch {
      alert('Erreur lors de la sauvegarde des notes')
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Supprimer ce lead ?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/sales?id=${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const completedValue = leads
    .filter(l => l.funnel_stage === 'completed' && l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
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
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 300,
              color: '#0E0F10',
              letterSpacing: '-0.02em',
            }}
          >
            Funnel de vente
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} actif{leads.length !== 1 ? 's' : ''}
            {completedValue > 0 && (
              <span style={{ color: '#10B981', marginLeft: 10, fontWeight: 600 }}>
                · {completedValue.toLocaleString('fr-DZ')} DA conclus
              </span>
            )}
          </p>
        </div>
      </div>

      <div style={{ padding: '36px', overflowX: 'auto' }}>
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#9CA3AF' }} />
          </div>
        ) : (
          <>
            {/* Pipeline line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0,
                minWidth: 900,
                position: 'relative',
              }}
            >
              {/* Connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: '12.5%',
                  right: '12.5%',
                  height: 2,
                  background: 'linear-gradient(to right, #94A3B8, #F59E0B, #3B82F6, #10B981)',
                  zIndex: 0,
                  opacity: 0.3,
                }}
              />

              {STAGES.map((stage, si) => {
                const stageLeads = leads.filter(l => l.funnel_stage === stage.key)
                return (
                  <div
                    key={stage.key}
                    style={{ flex: 1, padding: '0 8px', position: 'relative', zIndex: 1 }}
                  >
                    {/* Stage header */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 99,
                          background: '#FFFFFF',
                          border: `3px solid ${stage.dot}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 10,
                          boxShadow: `0 0 0 4px ${stage.bg}`,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 99,
                            background: stage.dot,
                            display: 'block',
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: stage.color,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          textAlign: 'center',
                        }}
                      >
                        {stage.label}
                      </p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {stageLeads.length} lead{stageLeads.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Stage cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {stageLeads.length === 0 && (
                        <div
                          style={{
                            border: '1.5px dashed #E5E7EB',
                            borderRadius: 14,
                            padding: '28px 16px',
                            textAlign: 'center',
                          }}
                        >
                          <p style={{ fontSize: 12, color: '#D1D5DB' }}>Aucun lead</p>
                        </div>
                      )}
                      {stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: 14,
                            padding: '16px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            transition: 'box-shadow 0.2s',
                          }}
                          className="hover:shadow-md"
                        >
                          {/* Lead top */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 99,
                                background: stage.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                fontWeight: 700,
                                color: stage.color,
                              }}
                            >
                              {(lead.customer_name || '?')[0].toUpperCase()}
                            </div>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              disabled={deletingId === lead.id}
                              style={{
                                padding: 4,
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#D1D5DB',
                                display: 'flex',
                              }}
                            >
                              {deletingId === lead.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>

                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0E0F10', marginBottom: 4 }}>
                            {lead.customer_name}
                          </p>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginBottom: 6 }}
                            >
                              <Phone className="w-3 h-3" />{lead.phone}
                            </a>
                          )}
                          {lead.messages?.product && (
                            <p
                              style={{
                                fontSize: 11,
                                color: '#9CA3AF',
                                background: '#F6F5F3',
                                padding: '3px 8px',
                                borderRadius: 99,
                                display: 'inline-block',
                                marginBottom: 10,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {lead.messages.product}
                            </p>
                          )}
                          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>
                            {formatDate(lead.created_at)}
                          </p>

                          {/* Notes */}
                          {editingNotes === lead.id ? (
                            <div style={{ marginBottom: 10 }}>
                              <textarea
                                value={notesValue}
                                onChange={e => setNotesValue(e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  border: '1.5px solid #0E0F10',
                                  fontSize: 12,
                                  resize: 'vertical',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                }}
                              />
                              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <button
                                  onClick={() => saveNotes(lead.id)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: 7,
                                    border: 'none',
                                    background: '#0E0F10',
                                    color: '#fff',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <Check className="w-3 h-3" />Sauver
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: 7,
                                    border: 'none',
                                    background: '#F6F5F3',
                                    color: '#6B7280',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotes(lead.id)
                                setNotesValue(lead.notes || '')
                              }}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 8,
                                background: '#F6F5F3',
                                cursor: 'pointer',
                                marginBottom: 10,
                                minHeight: 36,
                              }}
                            >
                              {lead.notes ? (
                                <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                                  {lead.notes}
                                </p>
                              ) : (
                                <p style={{ fontSize: 12, color: '#D1D5DB', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <StickyNote className="w-3.5 h-3.5" />
                                  Ajouter une note...
                                </p>
                              )}
                            </div>
                          )}

                          {/* Move buttons */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            {si > 0 && (
                              <button
                                onClick={() => moveStage(lead, 'prev')}
                                disabled={movingId === lead.id}
                                style={{
                                  flex: 1,
                                  padding: '7px 0',
                                  borderRadius: 8,
                                  border: '1px solid #E5E7EB',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 11.5,
                                  color: '#6B7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  transform: 'scaleX(-1)',
                                }}
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {si < STAGES.length - 1 && (
                              <button
                                onClick={() => moveStage(lead, 'next')}
                                disabled={movingId === lead.id}
                                style={{
                                  flex: 1,
                                  padding: '7px 0',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: stage.bg,
                                  cursor: 'pointer',
                                  fontSize: 11.5,
                                  color: stage.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  fontWeight: 600,
                                }}
                              >
                                {movingId === lead.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <><MoveRight className="w-3.5 h-3.5" /> Avancer</>
                                }
                              </button>
                            )}
                            {si === STAGES.length - 1 && (
                              <div
                                style={{
                                  flex: 1,
                                  padding: '7px 0',
                                  textAlign: 'center',
                                  fontSize: 11.5,
                                  color: '#10B981',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                }}
                              >
                                <TrendingUp className="w-3.5 h-3.5" /> Conclus
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty state */}
            {leads.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.05)',
                  marginTop: 24,
                }}
              >
                <TrendingUp className="w-10 h-10 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 500 }}>Aucun lead dans le funnel</p>
                <p style={{ color: '#9CA3AF', fontSize: 12.5, marginTop: 6, maxWidth: 320, margin: '8px auto 0' }}>
                  Utilisez le bouton «Ajouter au funnel» depuis la page Commandes pour déplacer un lead ici
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
