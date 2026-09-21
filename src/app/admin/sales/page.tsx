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
  { key: 'cold', label: 'Cold lead', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', dot: '#94A3B8' },
  { key: 'interested', label: 'Intéressé', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', dot: '#F59E0B' },
  { key: 'delivering', label: 'En livraison', color: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)', dot: '#3B82F6' },
  { key: 'completed', label: 'Vente conclue', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', dot: '#10B981' },
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
        body: JSON.stringify({ id, funnel_stage: STAGES[newIdx].key }),
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
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 300,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Funnel de vente
          </h1>
          <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} actif{leads.length !== 1 ? 's' : ''}
            {completedValue > 0 && (
              <span style={{ color: '#34D399', marginLeft: 10, fontWeight: 600 }}>
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin text-[#d1aa5c]" />
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
                          background: 'rgba(6, 11, 25, 0.92)',
                          border: `2.5px solid ${stage.dot}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 10,
                          boxShadow: `0 0 14px ${stage.dot}40`,
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
                      <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>
                        {stageLeads.length} lead{stageLeads.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Stage cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {stageLeads.length === 0 && (
                        <div
                          style={{
                            border: '1.5px dashed rgba(255, 255, 255, 0.12)',
                            borderRadius: 14,
                            padding: '28px 16px',
                            textAlign: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <p style={{ fontSize: 12, color: '#71717A' }}>Aucun lead</p>
                        </div>
                      )}
                      {stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          style={{
                            background: 'rgba(6, 11, 25, 0.92)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: 16,
                            padding: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.09)',
                            boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
                            transition: 'all 0.2s ease',
                          }}
                          className="hover:shadow-2xl hover:border-[#60a5fa]/40 hover:-translate-y-0.5"
                        >
                          {/* Lead top */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 99,
                                background: stage.bg,
                                border: `1px solid ${stage.color}30`,
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
                                color: '#71717A',
                                display: 'flex',
                              }}
                              className="hover:text-red-400"
                            >
                              {deletingId === lead.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>

                          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                            {lead.customer_name}
                          </p>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              style={{ fontSize: 12, color: '#D4D4D8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginBottom: 6 }}
                              className="hover:text-[#d1aa5c]"
                            >
                              <Phone className="w-3 h-3 text-[#d1aa5c]" />{lead.phone}
                            </a>
                          )}
                          {lead.messages?.product && (
                            <p
                              style={{
                                fontSize: 11,
                                color: '#d1aa5c',
                                background: 'rgba(209, 170, 92, 0.12)',
                                border: '1px solid rgba(209, 170, 92, 0.25)',
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
                                  border: '1px solid rgba(209, 170, 92, 0.4)',
                                  background: 'rgba(0, 0, 0, 0.35)',
                                  color: '#FFFFFF',
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
                                    background: '#d1aa5c',
                                    color: '#14120f',
                                    fontWeight: 600,
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
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#A1A1AA',
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
                                background: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                cursor: 'pointer',
                                marginBottom: 10,
                                minHeight: 36,
                              }}
                            >
                              {lead.notes ? (
                                <p style={{ fontSize: 12, color: '#D4D4D8', lineHeight: 1.5 }}>
                                  {lead.notes}
                                </p>
                              ) : (
                                <p style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <StickyNote className="w-3.5 h-3.5 text-[#d1aa5c]" />
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
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  cursor: 'pointer',
                                  fontSize: 11.5,
                                  color: '#D4D4D8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  transform: 'scaleX(-1)',
                                }}
                                className="hover:bg-white/10"
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
                                  border: `1px solid ${stage.color}40`,
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
                                  color: '#34D399',
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
                  background: 'rgba(7, 11, 24, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 20,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
                  marginTop: 24,
                }}
              >
                <TrendingUp className="w-10 h-10 mx-auto mb-4 text-[#d1aa5c]" />
                <p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>Aucun lead dans le funnel</p>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginTop: 6, maxWidth: 320, margin: '8px auto 0' }}>
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
