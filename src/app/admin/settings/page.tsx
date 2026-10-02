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

  return (
    <div className="min-h-screen pb-16" style={{ background: 'transparent' }}>
      {/* Header */}
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '28px 36px',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              Paramètres &amp; Infrastructure
            </h1>
            <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
              Gestion du stockage Supabase, base de données et déploiement Cloudflare
            </p>
          </div>

          <button
            onClick={() => {
              fetchStorageAudit()
              fetchDbCounts()
            }}
            disabled={loadingAudit}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin text-[#007AFF]' : ''}`} />
            <span>Actualiser l&apos;état</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '36px', maxWidth: 840 }} className="space-y-6">
        {/* ── Supabase Storage & Space Cleaner Card ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '24px 28px',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Stockage Supabase (Photos &amp; Médias)</h2>
                <p className="text-xs text-white/50 mt-0.5">Bucket &laquo; products &raquo; connecté à Cloudflare Pages</p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Synchronisé en direct
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-medium">Espace total utilisé</p>
              <p className="text-xl font-bold text-white mt-1">
                {loadingAudit ? '...' : audit?.totalSizeFormatted || '0 Mo'}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">{audit?.totalFiles || 0} fichiers enregistrés</p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-medium">Fichiers actifs / En ligne</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {loadingAudit ? '...' : audit?.activeCount || 0}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">Attachés au catalogue &amp; config</p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-medium">Fichiers orphelins</p>
              <p className={`text-xl font-bold mt-1 ${audit && audit.orphanCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {loadingAudit ? '...' : audit?.orphanCount || 0}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {audit && audit.orphanCount > 0 ? `${audit.orphanSizeFormatted} récupérables` : 'Aucun espace gaspillé'}
              </p>
            </div>
          </div>

          {/* Action & Explanation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suppression automatique garantie à 100%</span>
              </p>
              <p className="text-[11px] text-white/50 max-w-lg leading-relaxed">
                Toute suppression effectuée dans le panneau Produits efface immédiatement la ligne dans la base de données ET détruit physiquement les fichiers photos du stockage Supabase.
              </p>
            </div>

            <button
              onClick={handleCleanOrphans}
              disabled={cleaning || loadingAudit || (audit?.orphanCount || 0) === 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                audit && audit.orphanCount > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
              }`}
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
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{audit.orphanFiles.length} fichier(s) orphelin(s) détecté(s) (non rattachés) :</span>
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {audit.orphanFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between text-xs px-3 py-2 bg-black/40 border border-white/5 rounded-lg"
                  >
                    <span className="font-mono text-white/70 truncate max-w-md text-[11px]">{file.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-white/40 text-[10px]">{file.formattedSize}</span>
                      <button
                        onClick={() => handleDeleteSingleFile(file.name)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded transition-colors"
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
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '24px 28px',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#007AFF]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Base de Données PostgreSQL Supabase</h2>
              <p className="text-xs text-white/50 mt-0.5">Tables synchronisées en temps réel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white/70">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-white/50">Table &laquo; products &raquo;</p>
                <p className="text-lg font-bold text-white">
                  {dbCounts.products === null ? '...' : `${dbCounts.products} modèles`}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white/70">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-white/50">Table &laquo; messages &raquo;</p>
                <p className="text-lg font-bold text-white">
                  {dbCounts.messages === null ? '...' : `${dbCounts.messages} commandes`}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white/70">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-white/50">Table &laquo; orders &raquo;</p>
                <p className="text-lg font-bold text-white">
                  {dbCounts.orders === null ? '...' : `${dbCounts.orders} ventes/leads`}
                </p>
              </div>
            </div>
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
              statusColor: '#10B981',
              statusBg: 'rgba(16, 185, 129, 0.12)',
              statusBorder: 'rgba(16, 185, 129, 0.25)',
            },
            {
              icon: Shield,
              title: 'Sécurité & Accès',
              desc: 'Sessions sécurisées et protection du panneau d\'administration',
              status: 'Actif',
              statusColor: '#10B981',
              statusBg: 'rgba(16, 185, 129, 0.12)',
              statusBorder: 'rgba(16, 185, 129, 0.25)',
            },
            {
              icon: Bell,
              title: 'Notifications & Alertes',
              desc: 'Alertes en direct lors de la réception de nouvelles commandes clients',
              status: 'Actif',
              statusColor: '#007AFF',
              statusBg: 'rgba(0, 122, 255, 0.12)',
              statusBorder: 'rgba(0, 122, 255, 0.25)',
            },
            {
              icon: Palette,
              title: 'Design Apple Studio',
              desc: 'Interface exclusive Graphite & Platinum haute performance',
              status: 'Actif',
              statusColor: '#007AFF',
              statusBg: 'rgba(0, 122, 255, 0.12)',
              statusBorder: 'rgba(0, 122, 255, 0.25)',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 18,
                padding: '18px 22px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <item.icon className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: '#FFFFFF' }}>{item.title}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{item.desc}</p>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
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
