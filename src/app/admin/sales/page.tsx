'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'
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
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Armchair,
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
  { key: 'cold', label: 'Prospect (Froid)', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', dot: '#94A3B8', darkBg: 'rgba(100,116,139,0.15)', darkBorder: 'rgba(100,116,139,0.25)' },
  { key: 'interested', label: 'Intéressé & Contacté', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B', darkBg: 'rgba(245,158,11,0.15)', darkBorder: 'rgba(245,158,11,0.3)' },
  { key: 'delivering', label: 'En Livraison / Montage', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6', darkBg: 'rgba(59,130,246,0.15)', darkBorder: 'rgba(59,130,246,0.3)' },
  { key: 'completed', label: 'Vente Conclue', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', darkBg: 'rgba(16,185,129,0.15)', darkBorder: 'rgba(16,185,129,0.3)' },
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
    `Bonjour ${name || 'cher client'},\n\nNous faisons suite à votre sélection sur M&F Meubles${product ? ` concernant le ${product}` : ''}.\n\nPouvons-nous vous assister pour finaliser votre commande et planifier la livraison ?`
  )
  return `https://wa.me/${clean}?text=${text}`
}

export default function AdminSalesPage() {
  const { isDark } = useAdminTheme()
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

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
    autoScrollSpeedRef.current = 0
    autoScrollDirRef.current = null
    setAutoScrollDir(null)
  }, [])

  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    autoScrollSpeedRef.current = speed
    autoScrollDirRef.current = direction
    setAutoScrollDir(direction)

    if (autoScrollRafRef.current) return

    const tick = () => {
      if (!kanbanScrollRef.current || autoScrollSpeedRef.current === 0 || !autoScrollDirRef.current) {
        autoScrollRafRef.current = null
        return
      }

      const delta = autoScrollDirRef.current === 'right'
        ? autoScrollSpeedRef.current
        : -autoScrollSpeedRef.current

      kanbanScrollRef.current.scrollLeft += delta

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

  useEffect(() => {
    if (!touchLeadId) return

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const pos = { x: touch.clientX, y: touch.clientY }
      touchPosRef.current = pos
      setTouchPos(pos)

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
      showIosToast('Notes sauvegardées ✓', 'success')
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
          gap: 10,
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
            CRM Ventes &amp; Funnel <span style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>• M&amp;F Meubles</span>
          </h1>
          <span
            style={{
              background: isDark ? '#2C2C2E' : '#E2E8F0',
              color: isDark ? 'rgba(235,235,245,0.85)' : '#0F172A',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 99,
              whiteSpace: 'nowrap',
            }}
          >
            {leads.length} lead{leads.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Right Action: Revenue KPIs & Add Lead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Revenue Pill */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,23,42,0.03)',
            }}
          >
            <span style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
              Conclu :
            </span>
            <strong style={{ fontSize: 12, color: isDark ? '#30D158' : '#047857', fontWeight: 700 }}>
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
              gap: 6,
              background: isDark ? '#FFFFFF' : '#0F172A',
              color: isDark ? '#000000' : '#FFFFFF',
              padding: '7px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,23,42,0.12)',
              transition: 'background 0.15s ease',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Lead</span>
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
        {/* Search Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
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
              placeholder="Rechercher lead, téléphone, produit..."
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

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: isDark ? '#2C2C2E' : '#E8EAED',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
              padding: '6px 14px',
              borderRadius: 12,
              fontSize: 11.5,
              color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
            }}
          >
            <span>Volume total estimé :</span>
            <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>{pipelineValue.toLocaleString('fr-DZ')} DA</strong>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
          </div>
        ) : (
          <>
            {/* ── Kanban Scroll Wrapper (mobile: horizontal scroll) ── */}
            <div
              ref={kanbanScrollRef}
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                marginLeft: 'clamp(-14px,-2.5vw,-28px)',
                marginRight: 'clamp(-14px,-2.5vw,-28px)',
                paddingLeft: 'clamp(14px,2.5vw,28px)',
                paddingRight: 'clamp(14px,2.5vw,28px)',
                position: 'relative',
              } as React.CSSProperties}
            >
              {/* ── Visual Connecting Pipeline Lane with Stage Dots ── */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 24,
                  padding: '0 8px',
                  minWidth: 720,
                }}
              >
                {/* Clean Hairline Pipeline Connector Track */}
                <div
                  style={{
                    position: 'absolute',
                    top: 22,
                    left: '12.5%',
                    right: '12.5%',
                    height: 2,
                    background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                    zIndex: 0,
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
                            background: isDark ? '#1C1C1E' : '#FFFFFF',
                            border: `2.5px solid ${stage.dot}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                            boxShadow: isDropTarget
                              ? `0 0 20px ${stage.dot}80, 0 4px 12px rgba(0,0,0,0.3)`
                              : (isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(15,23,42,0.06)'),
                            transform: isDropTarget ? 'scale(1.15)' : 'scale(1)',
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
                            letterSpacing: '0.02em',
                          }}
                        >
                          {stage.label}
                        </span>

                        {/* Count & Value */}
                        <span
                          style={{
                            fontSize: 11,
                            color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
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
                        background: isDropTarget ? (isDark ? '#2C2C2E' : '#F1F5F9') : (isDark ? '#1C1C1E' : '#FFFFFF'),
                        borderRadius: 18,
                        border: isDropTarget
                          ? `2px dashed ${stage.dot}`
                          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB'),
                        padding: '16px',
                        boxShadow: isDropTarget
                          ? `0 0 24px ${stage.dot}30, 0 8px 30px rgba(0,0,0,0.3)`
                          : (isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px rgba(15,23,42,0.02)'),
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 99,
                              background: stage.dot,
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                            {stage.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: stage.color,
                            background: isDark ? stage.darkBg : stage.bg,
                            border: `1px solid ${isDark ? stage.darkBorder : stage.border}`,
                            padding: '2px 8px',
                            borderRadius: 99,
                          }}
                        >
                          {stageLeads.length}
                        </span>
                      </div>

                      {stageValue > 0 && (
                        <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginBottom: 12, fontWeight: 500 }}>
                          Total : <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{stageValue.toLocaleString('fr-DZ')} DA</strong>
                        </p>
                      )}

                      {/* Stage Cards Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {stageLeads.length === 0 && (
                          <div
                            style={{
                              border: isDark ? '1.5px dashed rgba(255,255,255,0.08)' : '1.5px dashed #E2E8F0',
                              borderRadius: 14,
                              padding: '36px 16px',
                              textAlign: 'center',
                              background: isDark ? '#2C2C2E' : '#F8FAFC',
                            }}
                          >
                            <p style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', fontWeight: 500 }}>
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
                                  ? (isDark ? '#3A3A3C' : '#F1F5F9')
                                  : (isDark ? '#2C2C2E' : '#FFFFFF'),
                                borderRadius: 14,
                                padding: '12px 14px',
                                border: isBeingTouchDragged
                                  ? (isDark ? '1.5px dashed #FFFFFF' : '1.5px dashed #0F172A')
                                  : isBeingMouseDragged
                                  ? (isDark ? '2px solid #FFFFFF' : '2px solid #0F172A')
                                  : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                                boxShadow: isBeingMouseDragged
                                  ? (isDark ? '0 16px 36px rgba(0,0,0,0.6)' : '0 16px 36px rgba(15,23,42,0.18)')
                                  : (isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15,23,42,0.04), 0 2px 6px rgba(15,23,42,0.02)'),
                                opacity: isBeingTouchDragged ? 0.35 : 1,
                                transform: isBeingMouseDragged
                                  ? 'scale(1.03) rotate(1deg)'
                                  : isBeingTouchDragged
                                  ? 'scale(0.97)'
                                  : 'none',
                                animation: isJustDropped
                                  ? 'kanbanDropCelebrate 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                                  : undefined,
                                cursor: 'grab',
                                transition: isBeingTouchDragged ? 'none' : 'all 0.15s ease',
                                userSelect: 'none',
                                touchAction: 'none',
                                position: 'relative',
                                zIndex: isBeingMouseDragged ? 50 : 1,
                              }}
                            >
                              {/* Holding badge feedback */}
                              {isBeingMouseDragged && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: -9,
                                    right: 8,
                                    background: isDark ? '#FFFFFF' : '#0F172A',
                                    color: isDark ? '#000000' : '#FFFFFF',
                                    fontSize: 9.5,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 4,
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
                                      borderRadius: 8,
                                      background: isDark ? stage.darkBg : stage.bg,
                                      border: `1px solid ${isDark ? stage.darkBorder : stage.border}`,
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
                                    <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', lineHeight: 1.2 }}>
                                      {lead.customer_name}
                                    </p>
                                    <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }}>{formatDate(lead.created_at)}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <div
                                    title="Glisser-déposer vers une autre étape"
                                    style={{
                                      cursor: 'grab',
                                      color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8',
                                      padding: '2px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
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
                                      color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8',
                                      display: 'flex',
                                      transition: 'all 0.15s ease',
                                    }}
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
                                      color: isDark ? 'rgba(235,235,245,0.7)' : '#64748B',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      textDecoration: 'none',
                                      background: isDark ? '#3A3A3C' : '#F1F5F9',
                                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                      padding: '3px 7px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Phone className="w-2.5 h-2.5 text-[#94A3B8]" />
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
                                      color: isDark ? '#30D158' : '#047857',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      textDecoration: 'none',
                                      background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                                      border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                                      padding: '3px 7px',
                                      borderRadius: 6,
                                    }}
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
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    background: isDark ? '#3A3A3C' : '#F8FAFC',
                                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    marginBottom: 6,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Armchair className="w-3 h-3 text-[#F59E0B] shrink-0" />
                                  <span>{lead.messages.product}</span>
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
                                        border: isDark ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #0F172A',
                                        fontSize: 11,
                                        outline: 'none',
                                        background: isDark ? '#3A3A3C' : '#F8FAFC',
                                        color: isDark ? '#FFFFFF' : '#0F172A',
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => saveAmount(lead.id)}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        border: 'none',
                                        background: isDark ? '#FFFFFF' : '#0F172A',
                                        color: isDark ? '#000000' : '#FFFFFF',
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
                                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                        background: isDark ? '#3A3A3C' : '#F1F5F9',
                                        color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
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
                                      padding: '5px 8px',
                                      borderRadius: 6,
                                      background: lead.amount
                                        ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5')
                                        : (isDark ? '#3A3A3C' : '#F8FAFC'),
                                      border: lead.amount
                                        ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0')
                                        : (isDark ? '1px dashed rgba(255,255,255,0.15)' : '1px dashed #CBD5E1'),
                                      cursor: 'pointer',
                                    }}
                                    title="Cliquer pour définir le montant"
                                  >
                                    <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 500 }}>Devis :</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: lead.amount ? (isDark ? '#30D158' : '#047857') : (isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8') }}>
                                      {lead.amount ? `${lead.amount.toLocaleString('fr-DZ')} DA` : '+ Définir montant'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Notes / Message section */}
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
                                      border: isDark ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #0F172A',
                                      background: isDark ? '#3A3A3C' : '#F8FAFC',
                                      color: isDark ? '#FFFFFF' : '#0F172A',
                                      fontSize: 11.5,
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
                                        background: isDark ? '#FFFFFF' : '#0F172A',
                                        color: isDark ? '#000000' : '#FFFFFF',
                                        fontWeight: 600,
                                        fontSize: 11.5,
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
                                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                        background: isDark ? '#3A3A3C' : '#F1F5F9',
                                        color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                                        fontSize: 11.5,
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
                                    background: isDark ? '#3A3A3C' : '#F8FAFC',
                                    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
                                    cursor: 'pointer',
                                    marginBottom: 8,
                                    minHeight: 28,
                                  }}
                                  title="Cliquer pour modifier les notes"
                                >
                                  {lead.notes ? (
                                    <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.85)' : '#334155', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                      {lead.notes}
                                    </p>
                                  ) : (
                                    <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <StickyNote className="w-3 h-3 text-[#3B82F6]" />
                                      <span>Ajouter une note de suivi...</span>
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
                                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                                      background: isDark ? '#3A3A3C' : '#F8FAFC',
                                      cursor: 'pointer',
                                      fontSize: 11,
                                      color: isDark ? 'rgba(235,235,245,0.7)' : '#475569',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 600,
                                    }}
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
                                      padding: '6px 0',
                                      borderRadius: 8,
                                      border: 'none',
                                      background: isDark ? '#FFFFFF' : '#0F172A',
                                      boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.1)',
                                      cursor: 'pointer',
                                      fontSize: 11,
                                      color: isDark ? '#000000' : '#FFFFFF',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                      fontWeight: 600,
                                      transition: 'background 0.15s ease',
                                    }}
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
                                      padding: '6px 0',
                                      textAlign: 'center',
                                      fontSize: 11,
                                      color: isDark ? '#30D158' : '#047857',
                                      background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                                      border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                                      borderRadius: 8,
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    <Check className="w-3 h-3" /> Vente conclue ✓
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
            </div>

            {/* Empty state */}
            {leads.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderRadius: 20,
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: isDark ? '#2C2C2E' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
                </div>
                <p style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 16, fontWeight: 700 }}>Le pipeline de vente est vide</p>
                <p style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontSize: 13, marginTop: 6, maxWidth: 360, margin: '8px auto 16px' }}>
                  Ajoutez un prospect manuellement ou cliquez sur « + CRM Ventes » depuis la page Commandes pour commencer à suivre vos opportunités.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '9px 20px',
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    borderRadius: 10,
                    fontSize: 12.5,
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

      {/* ── Modal: Ajouter un Lead manuellement ── */}
      {showAddModal && (
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
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false)
          }}
        >
          <div
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 480,
              padding: '24px 26px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
              boxShadow: isDark
                ? '0 24px 60px -12px rgba(0,0,0,0.8)'
                : '0 24px 60px -12px rgba(15,23,42,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', paddingBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>Ajouter un Lead Commercial</h2>
                <p style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2 }}>Enregistrez une opportunité dans le CRM</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
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
                    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    fontSize: 13,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
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
                    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    fontSize: 13,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
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
                    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    fontSize: 13,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
                  Notes &amp; Modèles d&apos;intérêt
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Intéressé par le Salon Majestueux velours marron. Rendez-vous prévu samedi au showroom."
                  value={newLeadNotes}
                  onChange={e => setNewLeadNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    fontSize: 13,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10, borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    color: isDark ? 'rgba(235,235,245,0.7)' : '#475569',
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
                    padding: '9px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: creatingLead ? 'wait' : 'pointer',
                    boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,23,42,0.12)',
                  }}
                >
                  {creatingLead ? 'Création...' : 'Créer l\'opportunité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile Touch Floating Ghost Card ── */}
      {touchLead && touchPos && (
        <div
          style={{
            position: 'fixed',
            left: touchPos.x,
            top: touchPos.y,
            transform: 'translate(-50%, -50%) scale(0.9) rotate(1.5deg)',
            width: 270,
            pointerEvents: 'none',
            zIndex: 99999,
            boxShadow: isDark ? '0 20px 45px -10px rgba(0,0,0,0.7)' : '0 20px 45px -10px rgba(15, 23, 42, 0.25)',
            borderRadius: 16,
            border: isDark ? '2px solid #FFFFFF' : '2px solid #0F172A',
            background: isDark ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '12px 14px',
            color: isDark ? '#FFFFFF' : '#0F172A',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
            }}
          >
            <span
              style={{
                background: isDark ? '#FFFFFF' : '#0F172A',
                color: isDark ? '#000000' : '#FFFFFF',
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
            <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }}>
              {formatDate(touchLead.created_at)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: isDark ? '#2C2C2E' : '#F1F5F9',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: isDark ? '#FFFFFF' : '#0F172A',
                flexShrink: 0,
              }}
            >
              {(touchLead.customer_name || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {touchLead.customer_name}
              </p>
              <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', margin: 0 }}>
                {touchLead.phone || 'Sans numéro'}
              </p>
            </div>
          </div>

          {touchLead.messages?.product && (
            <div
              style={{
                fontSize: 10.5,
                color: isDark ? '#FFFFFF' : '#0F172A',
                background: isDark ? '#2C2C2E' : '#F8FAFC',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                padding: '3px 8px',
                borderRadius: 6,
                marginBottom: 8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 600,
              }}
            >
              🛋️ {touchLead.messages.product}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', textTransform: 'uppercase' }}>
              Montant devis
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: touchLead.amount ? (isDark ? '#30D158' : '#047857') : (isDark ? '#FFFFFF' : '#0F172A') }}>
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
            background: isDark
              ? 'linear-gradient(to left, rgba(255, 255, 255, 0.1), transparent)'
              : 'linear-gradient(to left, rgba(15, 23, 42, 0.15), transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 10,
          }}
        >
          <div style={{ animation: 'edgeSwipePulse 0.7s infinite alternate', color: isDark ? '#FFFFFF' : '#0F172A' }}>
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
            background: isDark
              ? 'linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent)'
              : 'linear-gradient(to right, rgba(15, 23, 42, 0.15), transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 10,
          }}
        >
          <div style={{ animation: 'edgeSwipePulseLeft 0.7s infinite alternate', color: isDark ? '#FFFFFF' : '#0F172A' }}>
            <ChevronLeft className="w-7 h-7" />
          </div>
        </div>
      )}

      {/* ── Keyframe Animations for D&D Celebrations ── */}
      <style>{`
        @keyframes kanbanDropCelebrate {
          0% {
            transform: scale(0.92);
          }
          40% {
            transform: scale(1.04);
            border-color: ${isDark ? '#FFFFFF' : '#0F172A'} !important;
            box-shadow: ${isDark ? '0 12px 30px rgba(0, 0, 0, 0.6)' : '0 12px 30px rgba(15, 23, 42, 0.18)'} !important;
          }
          70% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1);
            box-shadow: ${isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15, 23, 42, 0.04)'};
          }
        }
        @keyframes kanbanStagePulse {
          0% {
            border-color: ${isDark ? '#FFFFFF' : '#0F172A'} !important;
            box-shadow: ${isDark ? '0 0 20px rgba(255, 255, 255, 0.15)' : '0 0 20px rgba(15, 23, 42, 0.12)'} !important;
          }
          100% {
            border-color: ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'};
            box-shadow: ${isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(15,23,42,0.03)'};
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
