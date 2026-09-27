'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
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
  MessageCircle,
  Search,
  DollarSign,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  GripVertical,
  ChevronRight,
  ChevronLeft,
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
  { key: 'cold', label: 'Prospect (Froid)', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', dot: '#94A3B8' },
  { key: 'interested', label: 'Intéressé & Contacté', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', dot: '#F59E0B' },
  { key: 'delivering', label: 'En Livraison / Montage', color: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)', dot: '#3B82F6' },
  { key: 'completed', label: 'Vente Conclue', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', dot: '#10B981' },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-DZ', {
      day: '2-digit', month: 'short',
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
    `Bonjour ${name || 'cher client'},\n\nNous faisons suite à votre sélection sur Château d'art${product ? ` concernant le ${product}` : ''}.\n\nPouvons-nous vous assister pour finaliser votre commande et planifier la livraison ?`
  )
  return `https://wa.me/${clean}?text=${text}`
}

export default function AdminSalesPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [editingAmount, setEditingAmount] = useState<string | null>(null)
  const [amountValue, setAmountValue] = useState('')
  const [movingId, setMovingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Drag and Drop (Mouse & Mobile Touch) state
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [touchLeadId, setTouchLeadId] = useState<string | null>(null)
  const [touchOverStage, setTouchOverStage] = useState<string | null>(null)
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null)
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null)
  const [justDroppedStage, setJustDroppedStage] = useState<string | null>(null)
  const [autoScrollDir, setAutoScrollDir] = useState<'left' | 'right' | null>(null)

  const kanbanScrollRef = useRef<HTMLDivElement>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const touchPosRef = useRef<{ x: number; y: number } | null>(null)
  const touchLeadRef = useRef<Lead | null>(null)
  const touchOverStageRef = useRef<string | null>(null)
  const autoScrollRafRef = useRef<number | null>(null)
  const autoScrollSpeedRef = useRef<number>(0)
  const autoScrollDirRef = useRef<'left' | 'right' | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/sales?t=' + Date.now(), { cache: 'no-store' })
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

  const moveToStage = useCallback(async (leadId: string, targetStage: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.funnel_stage === targetStage) return

    setMovingId(leadId)
    // Optimistic update
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, funnel_stage: targetStage } : l))
    )

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lead_funnel_updated', { detail: { leadId, targetStage } }))
      try { localStorage.setItem('lead_funnel_updated_at', Date.now().toString()) } catch {}
    }

    try {
      const res = await fetch('/api/admin/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, funnel_stage: targetStage }),
      })
      if (!res.ok) throw new Error('Erreur lors du déplacement')
      showIosToast('Étape mise à jour ✓', 'success')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lead_funnel_updated', { detail: { leadId, targetStage } }))
        try { localStorage.setItem('lead_funnel_updated_at', Date.now().toString()) } catch {}
      }
    } catch {
      showIosToast('Erreur lors du déplacement', 'error')
      fetchLeads()
    } finally {
      setMovingId(null)
    }
  }, [leads, fetchLeads])

  // Stop edge auto-scroll loop
  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
    autoScrollSpeedRef.current = 0
    autoScrollDirRef.current = null
    setAutoScrollDir(null)
  }, [])

  // Start smart edge auto-scroll loop
  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    autoScrollSpeedRef.current = speed
    autoScrollDirRef.current = direction
    setAutoScrollDir(direction)

    if (autoScrollRafRef.current) return // Already running

    const tick = () => {
      if (!kanbanScrollRef.current || autoScrollSpeedRef.current === 0 || !autoScrollDirRef.current) {
        autoScrollRafRef.current = null
        return
      }

      const delta = autoScrollDirRef.current === 'right'
        ? autoScrollSpeedRef.current
        : -autoScrollSpeedRef.current

      kanbanScrollRef.current.scrollLeft += delta

      // While scrolling, dynamically detect the stage currently under the finger
      if (touchPosRef.current) {
        const elem = document.elementFromPoint(touchPosRef.current.x, touchPosRef.current.y)
        const stageElem = elem?.closest('[data-stage]')
        const stageKey = stageElem?.getAttribute('data-stage')
        if (stageKey && stageKey !== touchOverStageRef.current) {
          touchOverStageRef.current = stageKey
          setTouchOverStage(stageKey)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15)
          }
        }
      }

      autoScrollRafRef.current = requestAnimationFrame(tick)
    }

    autoScrollRafRef.current = requestAnimationFrame(tick)
  }, [])

  // Global touch listeners when dragging a lead on mobile
  useEffect(() => {
    if (!touchLeadId) return

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const pos = { x: touch.clientX, y: touch.clientY }
      touchPosRef.current = pos
      setTouchPos(pos)

      // Edge proximity detection for smart horizontal auto-scroll
      const screenWidth = window.innerWidth
      const EDGE_ZONE = 75
      if (touch.clientX > screenWidth - EDGE_ZONE) {
        const intensity = Math.min(1, Math.max(0.2, (touch.clientX - (screenWidth - EDGE_ZONE)) / EDGE_ZONE))
        const speed = Math.round(intensity * 14)
        startAutoScroll('right', speed)
      } else if (touch.clientX < EDGE_ZONE) {
        const intensity = Math.min(1, Math.max(0.2, (EDGE_ZONE - touch.clientX) / EDGE_ZONE))
        const speed = Math.round(intensity * 14)
        startAutoScroll('left', speed)
      } else {
        stopAutoScroll()
      }

      // Dynamically detect which funnel stage is currently underneath finger
      const elem = document.elementFromPoint(touch.clientX, touch.clientY)
      const stageElem = elem?.closest('[data-stage]')
      const stageKey = stageElem?.getAttribute('data-stage')
      if (stageKey && stageKey !== touchOverStageRef.current) {
        touchOverStageRef.current = stageKey
        setTouchOverStage(stageKey)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15)
        }
      }
    }

    const handleGlobalTouchEnd = () => {
      stopAutoScroll()
      const activeLead = touchLeadRef.current
      const targetStage = touchOverStageRef.current

      if (activeLead && targetStage && targetStage !== activeLead.funnel_stage) {
        // Trigger celebratory drop effect
        setJustDroppedId(activeLead.id)
        setJustDroppedStage(targetStage)
        setTimeout(() => {
          setJustDroppedId(null)
          setJustDroppedStage(null)
        }, 1500)

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([20, 60, 20])
        }

        moveToStage(activeLead.id, targetStage)
      }

      setTouchLeadId(null)
      setTouchOverStage(null)
      setTouchPos(null)
      touchPosRef.current = null
      touchLeadRef.current = null
      touchOverStageRef.current = null
    }

    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    window.addEventListener('touchend', handleGlobalTouchEnd)
    window.addEventListener('touchcancel', handleGlobalTouchEnd)

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove)
      window.removeEventListener('touchend', handleGlobalTouchEnd)
      window.removeEventListener('touchcancel', handleGlobalTouchEnd)
      stopAutoScroll()
    }
  }, [touchLeadId, moveToStage, startAutoScroll, stopAutoScroll])

  const touchLead = leads.find(l => l.id === touchLeadId) || null
  touchLeadRef.current = touchLead

  // Modal to add direct/offline lead
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLeadName, setNewLeadName] = useState('')
  const [newLeadPhone, setNewLeadPhone] = useState('')
  const [newLeadAmount, setNewLeadAmount] = useState('')
  const [newLeadNotes, setNewLeadNotes] = useState('')
  const [creatingLead, setCreatingLead] = useState(false)

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
      showIosToast(`Avancé vers "${STAGES[newIdx].label}" ✓`, 'success')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lead_funnel_updated', { detail: { leadId: lead.id, targetStage: STAGES[newIdx].key } }))
        try { localStorage.setItem('lead_funnel_updated_at', Date.now().toString()) } catch {}
      }
    } catch {
      showIosToast('Erreur lors du déplacement', 'error')
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
      showIosToast('Notes de suivi sauvegardées ✓', 'success')
    } catch {
      showIosToast('Erreur lors de la sauvegarde des notes', 'error')
    }
  }

  const saveAmount = async (id: string) => {
    try {
      const parsed = amountValue ? Number(amountValue) : null
      await fetch('/api/admin/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount: parsed }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, amount: parsed } : l))
      setEditingAmount(null)
      showIosToast('Montant du devis enregistré ✓', 'success')
    } catch {
      showIosToast('Erreur lors de la mise à jour du montant', 'error')
    }
  }

  const deleteLead = async (id: string) => {
    const confirmed = await showIosConfirm({
      title: 'Supprimer du funnel',
      message: 'Supprimer définitivement cette opportunité du funnel de vente ?',
      confirmText: 'Supprimer',
      isDestructive: true,
    })
    if (!confirmed) return

    setDeletingId(id)
    try {
      await fetch(`/api/admin/sales?id=${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
      showIosToast('Opportunité supprimée ✓', 'info')
    } catch {
      showIosToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      showIosToast('Veuillez renseigner au moins le nom et le téléphone.', 'error')
      return
    }
    setCreatingLead(true)
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: newLeadName.trim(),
          phone: newLeadPhone.trim(),
          amount: newLeadAmount ? Number(newLeadAmount) : null,
          notes: newLeadNotes.trim(),
        }),
      })

      if (!res.ok) throw new Error('Erreur lors de la création')

      setShowAddModal(false)
      setNewLeadName('')
      setNewLeadPhone('')
      setNewLeadAmount('')
      setNewLeadNotes('')
      await fetchLeads()
      showIosToast('Nouvelle opportunité ajoutée au funnel ✓', 'success')
    } catch (e: any) {
      showIosToast(e.message || 'Erreur lors de la création du lead', 'error')
    } finally {
      setCreatingLead(false)
    }
  }

  const filteredLeads = leads.filter(l => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (l.customer_name && l.customer_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.notes && l.notes.toLowerCase().includes(q)) ||
      (l.messages?.product && l.messages.product.toLowerCase().includes(q))
    )
  })

  const completedValue = leads
    .filter(l => l.funnel_stage === 'completed' && l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0)

  const pipelineValue = leads
    .filter(l => l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header — big bar restored */}
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: 'clamp(16px, 2vw, 22px) clamp(16px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 400,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            Ventes CRM
          </h1>
          <span
            style={{
              background: 'rgba(209, 170, 92, 0.18)',
              border: '1px solid rgba(209, 170, 92, 0.35)',
              color: '#d1aa5c',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            {leads.length} lead{leads.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Right Action: Revenue KPIs & Add Lead in direct line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Revenue Pill */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '5px 10px',
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              Conclu:
            </span>
            <strong style={{ fontSize: 11.5, color: '#34D399', fontWeight: 700 }}>
              {completedValue.toLocaleString('fr-DZ')} DA
            </strong>
          </div>

          {/* New Lead Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
              color: '#0A0B0C',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(209, 170, 92, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Lead</span>
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(16px, 3.5vw, 36px)' }}>
        {/* Search Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 6,
              padding: '9px 16px',
              border: '1px solid rgba(255,255,255,0.12)',
              width: '100%',
              maxWidth: 320,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Rechercher lead, téléphone, produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#FFFFFF',
                width: '100%',
              }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            )}
          </div>

          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)' }}>
            Volume total en cours : <strong style={{ color: '#FFFFFF' }}>{pipelineValue.toLocaleString('fr-DZ')} DA</strong>
          </span>
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin text-[#d1aa5c]" />
          </div>
        ) : (
          <>
            {/* ── Kanban Scroll Wrapper (mobile: horizontal scroll) ── */}
            <div
              ref={kanbanScrollRef}
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                marginLeft: 'clamp(-16px,-3.5vw,-36px)',
                marginRight: 'clamp(-16px,-3.5vw,-36px)',
                paddingLeft: 'clamp(16px,3.5vw,36px)',
                paddingRight: 'clamp(16px,3.5vw,36px)',
                position: 'relative',
              } as React.CSSProperties}
            >
            {/* ── Visual Connecting Pipeline Lane with Stage Dots ── */}
            <div
              style={{
                position: 'relative',
                marginBottom: 26,
                padding: '0 8px',
                minWidth: 720,
              }}
            >
              {/* Continuous Gradient Track */}
              <div
                style={{
                  position: 'absolute',
                  top: 22,
                  left: '12.5%',
                  right: '12.5%',
                  height: 3,
                  background: 'linear-gradient(to right, #94A3B8 0%, #F59E0B 35%, #3B82F6 70%, #10B981 100%)',
                  borderRadius: 99,
                  zIndex: 0,
                  opacity: 0.5,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {STAGES.map((stage, si) => {
                  const stageLeads = filteredLeads.filter(l => l.funnel_stage === stage.key)
                  const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.amount || 0), 0)
                  const isDropTarget = dragOverStage === stage.key || touchOverStage === stage.key

                  return (
                    <div
                      key={stage.key}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'default',
                      }}
                    >
                      {/* Numbered Circular Dot */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 99,
                          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                          border: `2.5px solid ${stage.dot}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                          boxShadow: isDropTarget
                            ? `0 0 22px ${stage.dot}, 0 4px 14px rgba(0,0,0,0.12)`
                            : `0 0 14px ${stage.dot}40, 0 2px 6px rgba(0,0,0,0.06)`,
                          transform: isDropTarget ? 'scale(1.18)' : 'scale(1)',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: stage.color,
                          }}
                        >
                          {si + 1}
                        </span>
                      </div>

                      {/* Stage Name */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: stage.color,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {stage.label}
                      </span>

                      {/* Count & Value */}
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.42)',
                          marginTop: 3,
                          fontWeight: 500,
                        }}
                      >
                        {stageLeads.length} lead{stageLeads.length > 1 ? 's' : ''}
                        {stageValue > 0 ? ` · ${stageValue.toLocaleString('fr-DZ')} DA` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kanban Pipeline Column Container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                minWidth: 720,
                position: 'relative',
              }}
            >
              {STAGES.map((stage, si) => {
                const stageLeads = filteredLeads.filter(l => l.funnel_stage === stage.key)
                const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.amount || 0), 0)
                const isDropTarget = dragOverStage === stage.key || touchOverStage === stage.key

                return (
                  <div
                    key={stage.key}
                    data-stage={stage.key}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      if (dragOverStage !== stage.key) {
                        setDragOverStage(stage.key)
                      }
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return
                      if (dragOverStage === stage.key) {
                        setDragOverStage(null)
                      }
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      const droppedLeadId = e.dataTransfer.getData('text/plain') || draggingLeadId
                      if (droppedLeadId) {
                        setJustDroppedId(droppedLeadId)
                        setJustDroppedStage(stage.key)
                        setTimeout(() => {
                          setJustDroppedId(null)
                          setJustDroppedStage(null)
                        }, 1500)
                        await moveToStage(droppedLeadId, stage.key)
                      }
                      setDraggingLeadId(null)
                      setDragOverStage(null)
                    }}
                    style={{
                      flex: 1,
                      background: isDropTarget ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: 10,
                      border: isDropTarget ? `2px dashed ${stage.dot}` : '1px solid rgba(255,255,255,0.10)',
                      padding: '16px',
                      boxShadow: isDropTarget
                        ? `0 0 24px ${stage.dot}30, 0 8px 30px rgba(0, 0, 0, 0.08)`
                        : '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      animation: justDroppedStage === stage.key ? 'kanbanStagePulse 0.9s ease-out' : undefined,
                      minHeight: 280,
                    }}
                  >
                    {/* Stage Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: 12,
                        marginBottom: 14,
                        borderBottom: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: stage.dot,
                            boxShadow: `0 0 10px ${stage.dot}80`,
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                          {stage.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: stage.color,
                          background: stage.bg,
                          padding: '2px 8px',
                          borderRadius: 5,
                        }}
                      >
                        {stageLeads.length}
                      </span>
                    </div>

                    {stageValue > 0 && (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', marginBottom: 12, fontWeight: 500 }}>
                        Total: <strong style={{ color: '#FFFFFF' }}>{stageValue.toLocaleString('fr-DZ')} DA</strong>
                      </p>
                    )}

                    {/* Stage Cards Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {stageLeads.length === 0 && (
                        <div
                          style={{
                            border: '1.5px dashed rgba(255,255,255,0.12)',
                            borderRadius: 14,
                            padding: '36px 16px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                          }}
                        >
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', fontWeight: 500 }}>
                            {isDropTarget ? 'Déposer ici' : 'Aucune opportunité'}
                          </p>
                        </div>
                      )}

                      {stageLeads.map(lead => {
                        const isBeingTouchDragged = touchLeadId === lead.id
                        const isBeingMouseDragged = draggingLeadId === lead.id
                        const isJustDropped = justDroppedId === lead.id

                        return (
                          <div
                            key={lead.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', lead.id)
                              e.dataTransfer.effectAllowed = 'move'
                              setDraggingLeadId(lead.id)
                            }}
                            onDragEnd={() => {
                              setDraggingLeadId(null)
                              setDragOverStage(null)
                            }}
                            onTouchStart={(e) => {
                              const target = e.target as HTMLElement
                              if (target.closest('button, a, input, textarea')) return

                              const touch = e.touches[0]
                              if (!touch) return
                              touchStartPos.current = { x: touch.clientX, y: touch.clientY }
                              touchPosRef.current = { x: touch.clientX, y: touch.clientY }
                              touchLeadRef.current = lead
                              touchOverStageRef.current = lead.funnel_stage
                              setTouchPos({ x: touch.clientX, y: touch.clientY })
                              setTouchLeadId(lead.id)
                              setTouchOverStage(lead.funnel_stage)
                              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                navigator.vibrate(30)
                              }
                            }}
                            style={{
                              background: isBeingTouchDragged
                                ? 'rgba(209, 170, 92, 0.05)'
                                : 'rgba(255,255,255,0.07)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              borderRadius: 10,
                              padding: '11px 12px',
                              border: isBeingTouchDragged
                                ? '1.5px dashed rgba(209, 170, 92, 0.6)'
                                : isBeingMouseDragged
                                ? '2px solid #d1aa5c'
                                : '1px solid rgba(255,255,255,0.10)',
                              boxShadow: isBeingMouseDragged
                                ? '0 16px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(209, 170, 92, 0.6)'
                                : '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
                              opacity: isBeingTouchDragged ? 0.35 : 1,
                              transform: isBeingMouseDragged
                                ? 'scale(1.04) rotate(1.2deg)'
                                : isBeingTouchDragged
                                ? 'scale(0.97)'
                                : 'none',
                              animation: isJustDropped
                                ? 'kanbanDropCelebrate 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                                : undefined,
                              cursor: 'grab',
                              transition: isBeingTouchDragged ? 'none' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              userSelect: 'none',
                              touchAction: 'none',
                              position: 'relative',
                              zIndex: isBeingMouseDragged ? 50 : 1,
                            }}
                            className="hover:shadow-lg"
                          >
                            {/* Holding badge feedback */}
                            {isBeingMouseDragged && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: -9,
                                  right: 8,
                                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
                                  color: '#0A0B0C',
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 99,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                  zIndex: 60,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                }}
                              >
                                <span>✋ Déplacement...</span>
                              </div>
                            )}

                            {/* Card Top: Avatar, Name & Delete */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    background: stage.bg,
                                    border: `1px solid ${stage.color}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: stage.color,
                                    flexShrink: 0,
                                  }}
                                >
                                  {(lead.customer_name || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                                    {lead.customer_name}
                                  </p>
                                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)' }}>{formatDate(lead.created_at)}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <div
                                  title="Glisser-déposer vers une autre étape"
                                  style={{
                                    cursor: 'grab',
                                    color: 'rgba(255,255,255,0.35)',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  className="hover:text-white"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteLead(lead.id)}
                                  disabled={deletingId === lead.id}
                                  style={{
                                    padding: 4,
                                    borderRadius: 6,
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.30)',
                                    display: 'flex',
                                    transition: 'all 0.15s ease',
                                  }}
                                  className="hover:text-red-500 hover:bg-red-50/10"
                                  title="Supprimer ce lead"
                                >
                                  {deletingId === lead.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>

                          {/* Contact Channels: Phone & WhatsApp */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0 8px', flexWrap: 'wrap' }}>
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                style={{
                                  fontSize: 11,
                                  color: 'rgba(255,255,255,0.60)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  textDecoration: 'none',
                                  background: 'rgba(255,255,255,0.07)',
                                  padding: '3px 7px',
                                  borderRadius: 6,
                                }}
                                className="hover:text-[#007AFF]"
                              >
                                <Phone className="w-2.5 h-2.5 text-[#6B7280]" />
                                <span>{lead.phone}</span>
                              </a>
                            )}

                            {lead.phone && (
                              <a
                                href={getWhatsAppUrl(lead.phone, lead.customer_name, lead.messages?.product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Contacter sur WhatsApp"
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: '#16a34a',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  textDecoration: 'none',
                                  background: 'rgba(37,211,102,0.12)',
                                  border: '1px solid rgba(37, 211, 102, 0.25)',
                                  padding: '3px 7px',
                                  borderRadius: 6,
                                }}
                                className="hover:bg-[#25D366] hover:text-white"
                              >
                                <MessageCircle className="w-2.5 h-2.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>

                          {/* Product requested tag */}
                          {lead.messages?.product && (
                            <p
                              style={{
                                fontSize: 10.5,
                                color: 'rgba(255,255,255,0.90)',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                padding: '2px 8px',
                                borderRadius: 6,
                                display: 'inline-block',
                                marginBottom: 6,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 500,
                              }}
                            >
                              🛋️ {lead.messages.product}
                            </p>
                          )}

                          {/* Deal Amount Editor */}
                          <div style={{ margin: '6px 0 8px' }}>
                            {editingAmount === lead.id ? (
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <input
                                  type="number"
                                  placeholder="Montant en DA..."
                                  value={amountValue}
                                  onChange={e => setAmountValue(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '4px 6px',
                                    borderRadius: 6,
                                    border: '1px solid #d1aa5c',
                                    fontSize: 11,
                                    outline: 'none',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => saveAmount(lead.id)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#d1aa5c',
                                    color: '#0A0B0C',
                                    fontWeight: 700,
                                    fontSize: 10.5,
                                    cursor: 'pointer',
                                  }}
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingAmount(null)}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: 6,
                                    border: '1px solid #E5E7EB',
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'rgba(255,255,255,0.60)',
                                    fontSize: 10.5,
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingAmount(lead.id)
                                  setAmountValue(lead.amount ? String(lead.amount) : '')
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  background: lead.amount ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255,255,255,0.04)',
                                  border: lead.amount ? '1px solid rgba(52, 211, 153, 0.3)' : '1px dashed rgba(255,255,255,0.10)',
                                  cursor: 'pointer',
                                }}
                                title="Cliquer pour définir le montant"
                              >
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', fontWeight: 500 }}>Devis :</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: lead.amount ? '#34D399' : '#9CA3AF' }}>
                                  {lead.amount ? `${lead.amount.toLocaleString('fr-DZ')} DA` : '+ Définir'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Notes / Message section */}
                          {editingNotes === lead.id ? (
                            <div style={{ marginBottom: 12 }}>
                              <textarea
                                value={notesValue}
                                onChange={e => setNotesValue(e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  border: '1px solid #007AFF',
                                  background: 'rgba(255,255,255,0.05)',
                                  color: '#FFFFFF',
                                  fontSize: 12,
                                  resize: 'vertical',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                }}
                              />
                              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => saveNotes(lead.id)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: 7,
                                    border: 'none',
                                    background: '#007AFF',
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Sauvegarder
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingNotes(null)}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: 7,
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'rgba(255,255,255,0.60)',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Annuler
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
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                marginBottom: 8,
                                minHeight: 28,
                              }}
                              title="Cliquer pour modifier les notes"
                              className="hover:bg-white/10"
                            >
                              {lead.notes ? (
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                  {lead.notes}
                                </p>
                              ) : (
                                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <StickyNote className="w-3 h-3 text-[#007AFF]" />
                                  <span>Ajouter une note...</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* Stage Transition Buttons */}
                          <div style={{ display: 'flex', gap: 4 }}>
                            {si > 0 && (
                              <button
                                type="button"
                                onClick={() => moveStage(lead, 'prev')}
                                disabled={movingId === lead.id}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  background: 'rgba(255,255,255,0.07)',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  color: 'rgba(255,255,255,0.75)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                className="hover:bg-white/15"
                                title="Reculer à l'étape précédente"
                              >
                                ←
                              </button>
                            )}
                            {si < STAGES.length - 1 ? (
                              <button
                                type="button"
                                onClick={() => moveStage(lead, 'next')}
                                disabled={movingId === lead.id}
                                style={{
                                  flex: 1,
                                  padding: '5px 0',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: '#111827',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  fontWeight: 600,
                                  transition: 'background 0.15s',
                                }}
                                className="hover:bg-[#d1aa5c] hover:text-[#0A0B0C]"
                              >
                                {movingId === lead.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <span>Avancer</span>
                                    <MoveRight className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            ) : (
                              <div
                                style={{
                                  flex: 1,
                                  padding: '7px 0',
                                  textAlign: 'center',
                                  fontSize: 11.5,
                                  color: '#10B981',
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                }}
                              >
                                <Check className="w-3.5 h-3.5" /> Vente conclue ✓
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* End kanban scroll wrapper */}
            </div>

            {/* Empty state */}
            {leads.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <TrendingUp className="w-6 h-6 text-[#d1aa5c]" />
                </div>
                <p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>Le pipeline de vente est vide</p>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, marginTop: 6, maxWidth: 360, margin: '8px auto 16px' }}>
                  Ajoutez un prospect manuellement ou cliquez sur « Ajouter au funnel » depuis la page Commandes pour commencer à suivre vos opportunités.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#111827',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Ajouter le premier lead
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Ajouter un Lead manuellement */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 10,
              width: '100%',
              maxWidth: 480,
              padding: 28,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>Ajouter un Lead Commercial</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mohamed B."
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0550123456"
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
                  Montant estimé (DA)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 180000"
                  value={newLeadAmount}
                  onChange={e => setNewLeadAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
                  Notes &amp; Modèles d&apos;intérêt
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Intéressé par le Salon Majestueux velours marron. Rendez-vous prévu samedi."
                  value={newLeadNotes}
                  onChange={e => setNewLeadNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingLead}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#111827',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: creatingLead ? 'wait' : 'pointer',
                  }}
                >
                  {creatingLead ? 'Création...' : 'Créer l\'opportunité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile Touch Floating Ghost Card (Travels smoothly with user's finger) ── */}
      {touchLead && touchPos && (
        <div
          style={{
            position: 'fixed',
            left: touchPos.x,
            top: touchPos.y,
            transform: 'translate(-50%, -50%) scale(0.86) rotate(1.5deg)',
            width: 270,
            pointerEvents: 'none',
            zIndex: 99999,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 25px rgba(209, 170, 92, 0.55)',
            borderRadius: 12,
            border: '2px solid #d1aa5c',
            background: 'rgba(14, 16, 20, 0.96)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            padding: '12px 14px',
            color: '#FFFFFF',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          {/* Floating Header indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span
              style={{
                background: '#d1aa5c',
                color: '#0A0B0C',
                fontSize: 9.5,
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {touchOverStage
                ? `Déposer → ${STAGES.find(s => s.key === touchOverStage)?.label || ''}`
                : 'Glisser vers une étape'}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)' }}>
              {formatDate(touchLead.created_at)}
            </span>
          </div>

          {/* Lead Name & Initial */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: '#0A0B0C',
                flexShrink: 0,
              }}
            >
              {(touchLead.customer_name || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {touchLead.customer_name}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                {touchLead.phone || 'Sans numéro'}
              </p>
            </div>
          </div>

          {/* Product requested (if any) */}
          {touchLead.messages?.product && (
            <div
              style={{
                fontSize: 10.5,
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '3px 8px',
                borderRadius: 6,
                marginBottom: 8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              🛋️ {touchLead.messages.product}
            </div>
          )}

          {/* Amount badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
              Montant devis
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: touchLead.amount ? '#34D399' : '#d1aa5c' }}>
              {touchLead.amount ? `${touchLead.amount.toLocaleString('fr-DZ')} DA` : 'À fixer'}
            </span>
          </div>
        </div>
      )}

      {/* ── Smart Edge Auto-Scroll Visual Hints ── */}
      {autoScrollDir === 'right' && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 54,
            pointerEvents: 'none',
            zIndex: 99998,
            background: 'linear-gradient(to left, rgba(209, 170, 92, 0.4), transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 10,
          }}
        >
          <div style={{ animation: 'edgeSwipePulse 0.7s infinite alternate', color: '#d1aa5c' }}>
            <ChevronRight className="w-7 h-7" />
          </div>
        </div>
      )}

      {autoScrollDir === 'left' && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 54,
            pointerEvents: 'none',
            zIndex: 99998,
            background: 'linear-gradient(to right, rgba(209, 170, 92, 0.4), transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 10,
          }}
        >
          <div style={{ animation: 'edgeSwipePulseLeft 0.7s infinite alternate', color: '#d1aa5c' }}>
            <ChevronLeft className="w-7 h-7" />
          </div>
        </div>
      )}

      {/* ── Keyframe Animations for D&D Celebrations ── */}
      <style>{`
        @keyframes kanbanDropCelebrate {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 rgba(209, 170, 92, 0);
          }
          40% {
            transform: scale(1.06);
            border-color: #d1aa5c !important;
            box-shadow: 0 0 32px rgba(209, 170, 92, 0.85) !important;
          }
          70% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.05);
          }
        }
        @keyframes kanbanStagePulse {
          0% {
            border-color: #d1aa5c !important;
            box-shadow: 0 0 30px rgba(209, 170, 92, 0.45) !important;
          }
          100% {
            border-color: rgba(255, 255, 255, 0.10);
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
          }
        }
        @keyframes edgeSwipePulse {
          0% { opacity: 0.35; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(5px); }
          100% { opacity: 0.35; transform: translateX(0); }
        }
        @keyframes edgeSwipePulseLeft {
          0% { opacity: 0.35; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(-5px); }
          100% { opacity: 0.35; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
