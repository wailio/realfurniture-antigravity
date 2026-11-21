'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Database,
  Bell,
  Palette,
  HardDrive,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShoppingBag,
  TrendingUp,
  Package,
} from 'lucide-react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'

interface StorageAudit {
  totalFiles: number
  totalSizeBytes: number
  totalSizeFormatted: string
  activeCount: number
  orphanCount: number
  orphanSizeBytes: number
  orphanSizeFormatted: string
  orphanFiles: { name: string; size: number; formattedSize: string; createdAt?: string }[]
}

interface DbCounts {
  products: number | null
  messages: number | null
  orders: number | null
}

export default function AdminSettingsPage() {
  const { isDark } = useAdminTheme()
  const [audit, setAudit] = useState<StorageAudit | null>(null)
  const [loadingAudit, setLoadingAudit] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [dbCounts, setDbCounts] = useState<DbCounts>({ products: null, messages: null, orders: null })

  const fetchStorageAudit = useCallback(async () => {
    setLoadingAudit(true)
    try {
      const res = await fetch('/api/admin/storage-cleanup')
      if (res.ok) {
        const data = await res.json()
        setAudit(data)
      }
    } catch (err) {
      console.error('Failed to load storage audit:', err)
    } finally {
      setLoadingAudit(false)
    }
  }, [])

  const fetchDbCounts = useCallback(async () => {
    try {
      const [prodsRes, ordersRes, salesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/sales'),
      ])

      const prods = prodsRes.ok ? await prodsRes.json() : []
      const orders = ordersRes.ok ? await ordersRes.json() : []
      const sales = salesRes.ok ? await salesRes.json() : []

      setDbCounts({
        products: Array.isArray(prods) ? prods.length : 0,
        messages: Array.isArray(orders) ? orders.length : 0,
        orders: Array.isArray(sales) ? sales.length : 0,
      })
    } catch (err) {
      console.error('Failed to fetch DB counts:', err)
    }
  }, [])

  useEffect(() => {
    fetchStorageAudit()
    fetchDbCounts()
  }, [fetchStorageAudit, fetchDbCounts])

  const handleCleanOrphans = async () => {
    if (!audit || audit.orphanCount === 0) {
      showIosToast('Aucun fichier orphelin à nettoyer ✓', 'info')
      return
    }

    const confirmed = await showIosConfirm({
      title: 'Libérer l\'espace Supabase',
      message: `Voulez-vous supprimer définitivement les ${audit.orphanCount} fichiers orphelins (${audit.orphanSizeFormatted}) du stockage Supabase ?`,
      confirmText: 'Nettoyer et libérer',
      isDestructive: true,
    })
    if (!confirmed) return

    setCleaning(true)
    try {
      const res = await fetch('/api/admin/storage-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean-orphans' }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur lors du nettoyage')
      }

      const data = await res.json()
      showIosToast(`${data.freedFormatted || ''} libérés avec succès dans Supabase ✓`, 'success')
      await fetchStorageAudit()
    } catch (err: any) {
      showIosToast(err.message || 'Erreur lors du nettoyage', 'error')
    } finally {
      setCleaning(false)
    }
  }

  const handleDeleteSingleFile = async (fileName: string) => {
    const confirmed = await showIosConfirm({
      title: 'Supprimer le fichier',
      message: `Supprimer définitivement "${fileName}" de Supabase ?`,
      confirmText: 'Supprimer',
      isDestructive: true,
    })
    if (!confirmed) return

    try {
      const res = await fetch('/api/admin/storage-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-file', fileName }),
      })
      if (!res.ok) throw new Error('Échec de la suppression')
      showIosToast('Fichier supprimé définitivement ✓', 'info')
      await fetchStorageAudit()
    } catch (err: any) {
      showIosToast(err.message || 'Erreur', 'error')
    }
  }

  const totalSizeBytes = audit?.totalSizeBytes || 0
  const FREE_TIER_BYTES = 1024 * 1024 * 1024 // 1 Go (Supabase free tier quota)
  const usedPercentage = Math.min(100, (totalSizeBytes / FREE_TIER_BYTES) * 100)

  let formattedPercent = '0%'
  if (usedPercentage > 0 && usedPercentage < 0.1) {
    formattedPercent = '<0.1%'
  } else if (usedPercentage >= 0.1) {
    formattedPercent = `${usedPercentage.toFixed(1)}%`
  }

  const ringRadius = 30
  const ringCircumference = 2 * Math.PI * ringRadius // ~188.5
  const visualProgress = totalSizeBytes > 0 ? Math.max(3, usedPercentage) : 0
  const strokeDashoffset = ringCircumference - (visualProgress / 100) * ringCircumference
  const ringColor =
    usedPercentage > 85 ? '#EF4444' : usedPercentage > 65 ? '#F59E0B' : '#10B981'

  const T = {
    pageBg: isDark ? '#000000' : 'transparent',
    headerBg: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(245, 245, 247, 0.85)',
    headerBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.05)',
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    elevatedBg: isDark ? '#2C2C2E' : '#F8FAFC',
    elevatedBorder: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    tertiaryBg: isDark ? '#3A3A3C' : '#F8FAFC',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
    textTertiary: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8',
    separator: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    iconBg: isDark ? '#2C2C2E' : '#F1F5F9',
    iconBgEmerald: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
    iconBorderEmerald: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
    iconBgBlue: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
    iconBorderBlue: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE',
    dangerBg: isDark ? 'rgba(255,69,58,0.08)' : '#FEF2F2',
    dangerBorder: isDark ? 'rgba(255,69,58,0.2)' : '#FECACA',
    warningText: isDark ? '#FF453A' : '#DC2626',
    actionBtnBg: isDark ? '#2C2C2E' : '#FFFFFF',
    actionBtnBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
    actionBtnText: isDark ? '#FFFFFF' : '#0F172A',
    ringTrack: isDark ? '#3A3A3C' : '#E2E8F0',
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: T.pageBg, transition: 'background 0.3s ease, color 0.3s ease' }}>
      {/* ── Apple Frosted Sticky Header ── */}
      <div
        style={{
          background: T.headerBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.headerBorder}`,
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
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontWeight: 400,
              color: T.textPrimary,
              letterSpacing: '-0.02em',
              margin: 0,
              transition: 'color 0.3s ease',
            }}
          >
            Paramètres &amp; Infrastructure <span style={{ fontWeight: 800 }}>• M&amp;F Meubles</span>
          </h1>
          <p style={{ fontSize: 11.5, color: T.textSecondary, marginTop: 2, margin: 0, transition: 'color 0.3s ease' }}>
            Gestion du stockage Supabase, base de données PostgreSQL et runtime Cloudflare
          </p>
        </div>

        <button
          onClick={() => {
            fetchStorageAudit()
            fetchDbCounts()
          }}
          disabled={loadingAudit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: T.actionBtnText,
            background: T.actionBtnBg,
            border: `1px solid ${T.actionBtnBorder}`,
            cursor: loadingAudit ? 'wait' : 'pointer',
            boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} style={{ color: T.actionBtnText }} />
          <span>Actualiser l&apos;état</span>
        </button>
      </div>

      <div style={{ padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: 880, margin: '0 auto' }} className="space-y-6">
        {/* ── Supabase Storage & Space Cleaner Card ── */}
        <div
          style={{
            background: T.cardBg,
            borderRadius: 20,
            padding: '24px 26px',
            border: `1px solid ${T.cardBorder}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.02)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: T.iconBgEmerald,
                  border: `1px solid ${T.iconBorderEmerald}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10B981',
                  transition: 'background 0.3s ease',
                }}
              >
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, transition: 'color 0.3s ease' }}>
                  Stockage Supabase (Photos &amp; Médias)
                </h2>
                <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 2, transition: 'color 0.3s ease' }}>
                  Bucket &laquo; products &raquo; connecté à Cloudflare Pages
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: 11, fontWeight: 600,
                color: '#10B981',
                background: T.iconBgEmerald,
                border: `1px solid ${T.iconBorderEmerald}`,
                padding: '3px 12px',
                borderRadius: 99,
                whiteSpace: 'nowrap',
              }}
            >
              Synchronisé en direct
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* Box 1: Espace total utilisé with circular progress ring */}
            <div
              style={{
                padding: 16, borderRadius: 12,
                background: T.elevatedBg,
                border: `1px solid ${T.elevatedBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            >
              <div>
                <p style={{ fontSize: 11, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, transition: 'color 0.3s ease' }}>
                  Espace total utilisé
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginTop: 4, transition: 'color 0.3s ease' }}>
                  {loadingAudit ? '...' : audit?.totalSizeFormatted || '0 Mo'}
                </p>
                <p style={{ fontSize: 11, color: T.textTertiary, marginTop: 4, transition: 'color 0.3s ease' }}>
                  {audit?.totalFiles || 0} fichiers &bull; Quota 1 Go
                </p>
              </div>

              {/* Progress Ring */}
              <div
                className="relative flex items-center justify-center shrink-0 w-[64px] h-[64px]"
                title={`Utilisation du stockage : ${formattedPercent} de 1 Go`}
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r={ringRadius} fill="none" stroke={T.ringTrack} strokeWidth="8" />
                  <circle
                    cx="38" cy="38" r={ringRadius} fill="none"
                    stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={ringCircumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: 'monospace', letterSpacing: '-0.02em', transition: 'color 0.3s ease' }}>
                    {loadingAudit ? '...' : formattedPercent}
                  </span>
                  <span style={{ fontSize: 8, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2, transition: 'color 0.3s ease' }}>
                    1 Go
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 16, borderRadius: 12,
                background: T.elevatedBg,
                border: `1px solid ${T.elevatedBorder}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            >
              <div>
                <p style={{ fontSize: 11, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, transition: 'color 0.3s ease' }}>
                  Fichiers actifs / En ligne
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                  {loadingAudit ? '...' : audit?.activeCount || 0}
                </p>
              </div>
              <p style={{ fontSize: 11, color: T.textTertiary, marginTop: 8, transition: 'color 0.3s ease' }}>
                Attachés au catalogue &amp; showroom
              </p>
            </div>

            <div
              style={{
                padding: 16, borderRadius: 12,
                background: T.elevatedBg,
                border: `1px solid ${T.elevatedBorder}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            >
              <div>
                <p style={{ fontSize: 11, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, transition: 'color 0.3s ease' }}>
                  Fichiers orphelins
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: audit && audit.orphanCount > 0 ? '#FF9F0A' : '#10B981', marginTop: 4 }}>
                  {loadingAudit ? '...' : audit?.orphanCount || 0}
                </p>
              </div>
              <p style={{ fontSize: 11, color: T.textTertiary, marginTop: 8, transition: 'color 0.3s ease' }}>
                {audit && audit.orphanCount > 0 ? `${audit.orphanSizeFormatted} récupérables` : 'Aucun espace gaspillé'}
              </p>
            </div>
          </div>

          {/* Action & Explanation */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              padding: 16, borderRadius: 12,
              background: T.elevatedBg, border: `1px solid ${T.elevatedBorder}`,
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
            className="sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.3s ease' }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                <span>Nettoyage sécurisé &amp; automatique</span>
              </p>
              <p style={{ fontSize: 11.5, color: T.textSecondary, maxWidth: 480, lineHeight: 1.6, transition: 'color 0.3s ease' }}>
                Toute suppression effectuée dans le panneau Produits efface immédiatement la fiche dans la base de données ET détruit physiquement les photos du stockage Supabase.
              </p>
            </div>

            <button
              onClick={handleCleanOrphans}
              disabled={cleaning || loadingAudit || (audit?.orphanCount || 0) === 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                audit && audit.orphanCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
              }`}
              style={
                isDark && !(audit && audit.orphanCount > 0)
                  ? { background: '#3A3A3C', color: 'rgba(235,235,245,0.3)' }
                  : {}
              }
            >
              {cleaning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Nettoyage en cours...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Libérer l&apos;espace ({audit?.orphanSizeFormatted || '0 Mo'})</span>
                </>
              )}
            </button>
          </div>

          {/* Detailed Orphan Files List (if any) */}
          {audit && audit.orphanFiles && audit.orphanFiles.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.separator}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#FF9F0A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{audit.orphanFiles.length} fichier(s) orphelin(s) détecté(s) (non rattachés) :</span>
              </p>
              <div style={{ maxHeight: 192, overflowY: 'auto' }} className="space-y-1.5 pr-1">
                {audit.orphanFiles.map((file) => (
                  <div
                    key={file.name}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 12, padding: '8px 12px',
                      background: T.tertiaryBg,
                      border: `1px solid ${T.elevatedBorder}`,
                      borderRadius: 10,
                      transition: 'background 0.3s ease',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: T.textPrimary, fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s ease' }}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span style={{ color: T.textTertiary, fontSize: 10, transition: 'color 0.3s ease' }}>{file.formattedSize}</span>
                      <button
                        onClick={() => handleDeleteSingleFile(file.name)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        style={isDark ? { background: 'transparent' } : {}}
                        title="Supprimer ce fichier"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Supabase PostgreSQL Database Records Card ── */}
        <div
          style={{
            background: T.cardBg,
            borderRadius: 20,
            padding: '24px 26px',
            border: `1px solid ${T.cardBorder}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.02)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.iconBgBlue, border: `1px solid ${T.iconBorderBlue}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0A84FF',
                transition: 'background 0.3s ease',
              }}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, transition: 'color 0.3s ease' }}>
                Base de Données PostgreSQL Supabase
              </h2>
              <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 2, transition: 'color 0.3s ease' }}>
                Tables synchronisées en temps réel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Package, label: 'Table « products »', value: dbCounts.products === null ? '...' : `${dbCounts.products} modèles` },
              { icon: ShoppingBag, label: 'Table « messages »', value: dbCounts.messages === null ? '...' : `${dbCounts.messages} demandes` },
              { icon: TrendingUp, label: 'Table « orders »', value: dbCounts.orders === null ? '...' : `${dbCounts.orders} ventes CRM` },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 14, borderRadius: 12,
                  background: T.elevatedBg, border: `1px solid ${T.elevatedBorder}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div
                  style={{
                    padding: 8, borderRadius: 8,
                    background: T.cardBg, border: `1px solid ${T.cardBorder}`,
                    color: T.textSecondary,
                    transition: 'background 0.3s ease',
                  }}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500, transition: 'color 0.3s ease' }}>{item.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, transition: 'color 0.3s ease' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── System Status Items ── */}
        <div className="space-y-3">
          {[
            {
              icon: Layers,
              title: 'Déploiement Cloudflare & GitHub',
              desc: 'Intégration continue via GitHub & runtime Edge Cloudflare Pages',
              status: 'Connecté (Live)',
              statusColor: '#30D158',
              statusBg: isDark ? 'rgba(48,209,88,0.15)' : '#ECFDF5',
              statusBorder: isDark ? 'rgba(48,209,88,0.25)' : '#A7F3D0',
            },
            {
              icon: Shield,
              title: 'Sécurité & Accès',
              desc: 'Sessions chiffrées et protection du panneau d\'administration',
              status: 'Actif',
              statusColor: '#30D158',
              statusBg: isDark ? 'rgba(48,209,88,0.15)' : '#ECFDF5',
              statusBorder: isDark ? 'rgba(48,209,88,0.25)' : '#A7F3D0',
            },
            {
              icon: Bell,
              title: 'Notifications & Alertes',
              desc: 'Alertes en direct lors de la réception de nouvelles commandes clients',
              status: 'Actif',
              statusColor: '#0A84FF',
              statusBg: isDark ? 'rgba(10,132,255,0.15)' : '#EFF6FF',
              statusBorder: isDark ? 'rgba(10,132,255,0.25)' : '#BFDBFE',
            },
            {
              icon: Palette,
              title: 'Design Apple Studio',
              desc: 'Thème épuré blanc & ardoise avec interactions iOS haute fidélité',
              status: 'Actif',
              statusColor: isDark ? '#FFFFFF' : '#0F172A',
              statusBg: isDark ? '#3A3A3C' : '#F1F5F9',
              statusBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: T.cardBg,
                borderRadius: 18,
                padding: '18px 22px',
                border: `1px solid ${T.cardBorder}`,
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: T.iconBg, border: `1px solid ${T.elevatedBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.3s ease',
                }}
              >
                <item.icon className="w-5 h-5" style={{ color: T.textPrimary }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0, transition: 'color 0.3s ease' }}>{item.title}</p>
                <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 2, margin: '2px 0 0 0', transition: 'color 0.3s ease' }}>{item.desc}</p>
              </div>
              <span
                style={{
                  fontSize: 11, fontWeight: 600,
                  color: item.statusColor,
                  background: item.statusBg,
                  border: `1px solid ${item.statusBorder}`,
                  padding: '3px 10px',
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
