'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import {
  Users2,
  Shield,
  Crown,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  UserX,
  Mail,
  Phone,
  Calendar,
  Lock,
  Plus,
  X,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  AlertCircle,
  KeyRound,
  Check,
} from 'lucide-react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'

// ── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string
  username: string
  displayName: string
  role: 'developer' | 'admin'
  email?: string
  phone?: string
  lastLogin?: string
  createdAt?: string
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  isBuiltIn?: boolean
}

const ROLE_META = {
  developer: { label: 'Développeur', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', darkBg: 'rgba(245,158,11,0.15)', darkBorder: 'rgba(245,158,11,0.3)', icon: Crown },
  admin:     { label: 'Administrateur', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', darkBg: 'rgba(59,130,246,0.15)', darkBorder: 'rgba(59,130,246,0.3)', icon: Shield },
}

const STATUS_META = {
  active:    { label: 'Actif',    color: '#10B981', bg: '#ECFDF5', darkBg: 'rgba(16,185,129,0.15)', icon: CheckCircle2 },
  inactive:  { label: 'Inactif', color: '#64748B', bg: '#F8FAFC', darkBg: 'rgba(255,255,255,0.06)', icon: Clock },
  suspended: { label: 'Suspendu', color: '#EF4444', bg: '#FEF2F2', darkBg: 'rgba(239,68,68,0.15)', icon: UserX },
}

const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard',    label: 'Dashboard',   desc: 'Vue globale et métriques' },
  { key: 'products',     label: 'Produits',    desc: 'Catalogue et stocks' },
  { key: 'orders',       label: 'Commandes',   desc: 'Messages et demandes clients' },
  { key: 'sales',        label: 'Ventes CRM',  desc: 'Funnel et leads commerciaux' },
  { key: 'website-info', label: 'Infos site',  desc: 'Textes et horaires' },
]

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminUsersPage() {
  const { isDark } = useAdminTheme()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [customCount, setCustomCount] = useState(0)
  const [maxCustomUsers, setMaxCustomUsers] = useState(20)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Modal create state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    email: '',
    phone: '',
    permissions: ['products', 'orders', 'sales', 'website-info'],
  })

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_user')
      if (stored) {
        const u = JSON.parse(stored)
        setCurrentUserRole(u.role || 'admin')
      }
    } catch {}

    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.authenticated && d.user) setCurrentUserRole(d.user.role || 'admin')
      })
      .catch(() => {})

    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setCustomCount(data.customCount || 0)
        setMaxCustomUsers(data.maxCustomUsers || 20)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!openMenu) return
    const handler = () => setOpenMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [openMenu])

  function togglePerm(key: string) {
    setForm(prev => {
      const exists = prev.permissions.includes(key)
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter(p => p !== key) : [...prev.permissions, key],
      }
    })
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      setCreateError('Identifiant et mot de passe requis')
      return
    }

    setCreateLoading(true)
    setCreateError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password.trim(),
          displayName: form.displayName.trim() || form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          permissions: form.permissions,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || 'Erreur lors de la création')
        setCreateLoading(false)
        return
      }

      if (data.user) {
        setUsers(prev => [data.user, ...prev.filter(u => u.username !== data.user.username)])
        setCustomCount(prev => prev + 1)
        setSelectedId(data.user.id)
      }

      showIosToast('Utilisateur créé avec succès !', 'success')
      setShowCreateModal(false)
      setForm({
        username: '',
        password: '',
        displayName: '',
        email: '',
        phone: '',
        permissions: ['products', 'orders', 'sales', 'website-info'],
      })
      await loadUsers()
    } catch {
      setCreateError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setCreateLoading(false)
    }
  }

  async function confirmDeleteUser(user: AdminUser) {
    setOpenMenu(null)
    if (user.isBuiltIn) {
      showIosToast('Impossible de supprimer le compte système principal', 'error')
      return
    }

    const confirmed = await showIosConfirm({
      title: 'Supprimer cet utilisateur ?',
      message: `L'utilisateur "${user.displayName}" (@${user.username}) ne pourra plus accéder à l'espace admin. Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDestructive: true,
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/users?username=${encodeURIComponent(user.username)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showIosToast('Utilisateur supprimé ✓', 'info')
        if (selectedId === user.id) setSelectedId(null)
        await loadUsers()
      } else {
        const data = await res.json()
        showIosToast(data.error || 'Erreur lors de la suppression', 'error')
      }
    } catch {
      showIosToast('Erreur réseau lors de la suppression', 'error')
    }
  }

  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedUser = users.find(u => u.id === selectedId) ?? null

  return (
    <div className="min-h-screen" style={{ background: 'transparent', fontFamily: 'var(--font-body)' }}>
      {/* ── Page Header: Apple Frosted Header ── */}
      <div
        style={{
          background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(245, 245, 247, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Users2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 400,
                color: isDark ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Utilisateurs &amp; Accès <span style={{ fontWeight: 800 }}>• M&amp;F Meubles</span>
            </h1>
            <p className="hidden sm:block" style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2 }}>
              Gestion des comptes administrateurs &amp; autorisations
            </p>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: isDark ? '#F59E0B' : '#B45309', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {currentUserRole === 'developer' ? 'Accès Développeur' : 'Accès Administrateur'}
          </span>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              background: isDark ? '#FFFFFF' : '#0F172A',
              color: isDark ? '#000000' : '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,23,42,0.12)',
              transition: 'background 0.15s ease',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px,2.5vw,26px) clamp(14px,3vw,28px)', maxWidth: 1400, margin: '0 auto' }}>
        {/* ── Status Info Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '11px 16px',
            borderRadius: 14,
            marginBottom: 18,
            background: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF',
            border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid #BFDBFE',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Lock style={{ width: 14, height: 14, color: '#3B82F6', flexShrink: 0 }} />
            <p style={{ fontSize: 12.5, color: isDark ? 'rgba(235,235,245,0.85)' : '#1E3A8A', margin: 0 }}>
              Synchronisé en direct avec <strong>Supabase</strong> · Tout nouvel utilisateur peut se connecter instantanément.
            </p>
          </div>
          <div style={{ fontSize: 11.5, color: isDark ? '#60A5FA' : '#1D4ED8', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {customCount} / {maxCustomUsers} utilisateurs créés
          </div>
        </div>

        {/* ── Main Grid: User List (Left) + Detail Panel (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: 16 }}>
          {/* ── Left: User List ── */}
          <div>
            {/* Search bar */}
            <div
              style={{
                borderRadius: 9999,
                padding: '9px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 14,
                background: isDark ? '#1C1C1E' : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #DFE3E8',
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <Search style={{ width: 15, height: 15, color: '#94A3B8', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou identifiant..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* User rows */}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px 20px',
                      background: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderRadius: 18,
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                      color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                      fontSize: 13,
                    }}
                  >
                    Aucun utilisateur trouvé
                  </div>
                ) : filtered.map(user => {
                  const role = ROLE_META[user.role] || ROLE_META.admin
                  const status = STATUS_META[user.status] || STATUS_META.active
                  const RoleIcon = role.icon
                  const StatusIcon = status.icon
                  const isSelected = selectedId === user.id

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedId(isSelected ? null : user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        background: isSelected
                          ? (isDark ? '#2C2C2E' : '#F1F5F9')
                          : (isDark ? '#1C1C1E' : '#FFFFFF'),
                        borderRadius: 16,
                        border: isSelected
                          ? (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #CBD5E1')
                          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB'),
                        boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          flexShrink: 0,
                          background: isDark ? '#2C2C2E' : '#F1F5F9',
                          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 700,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                        }}
                      >
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>{user.displayName}</span>
                          <span style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }}>@{user.username}</span>
                          {user.isBuiltIn && (
                            <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 4, background: isDark ? '#2C2C2E' : '#F1F5F9', color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 600 }}>
                              Principal
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: isDark ? role.darkBg : role.bg,
                              border: `1px solid ${isDark ? role.darkBorder : role.border}`,
                            }}
                          >
                            <RoleIcon style={{ width: 10, height: 10, color: role.color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: role.color }}>{role.label}</span>
                          </div>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: isDark ? status.darkBg : status.bg,
                            }}
                          >
                            <StatusIcon style={{ width: 10, height: 10, color: status.color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: status.color }}>{status.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* More menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 6,
                            display: 'flex',
                          }}
                          title="Actions"
                        >
                          <MoreHorizontal style={{ width: 16, height: 16 }} />
                        </button>
                        {openMenu === user.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              marginTop: 4,
                              zIndex: 100,
                              background: isDark ? '#2C2C2E' : '#FFFFFF',
                              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                              borderRadius: 12,
                              padding: '5px',
                              minWidth: 170,
                              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 30px rgba(15,23,42,0.1)',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => { setSelectedId(user.id); setOpenMenu(null) }}
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: 'none',
                                background: 'transparent',
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                cursor: 'pointer',
                                fontSize: 12.5,
                              }}
                            >
                              Détails
                            </button>
                            {!user.isBuiltIn && (
                              <button
                                type="button"
                                onClick={() => confirmDeleteUser(user)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: 'transparent',
                                  color: isDark ? '#FF453A' : '#DC2626',
                                  cursor: 'pointer',
                                  fontSize: 12.5,
                                }}
                              >
                                <Trash2 style={{ width: 13, height: 13 }} />
                                <span>Supprimer</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Right: Detail Panel ── */}
          <div>
            {selectedUser ? (
              <div
                style={{
                  background: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderRadius: 18,
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                  padding: '20px',
                  position: 'sticky',
                  top: 80,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 16, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      background: isDark ? '#2C2C2E' : '#F1F5F9',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      marginBottom: 10,
                    }}
                  >
                    {selectedUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>{selectedUser.displayName}</p>
                  <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2 }}>@{selectedUser.username}</p>
                </div>

                <div>
                  {selectedUser.email && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9' }}>
                      <Mail style={{ width: 13, height: 13, color: '#94A3B8', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', margin: 0 }}>Email</p>
                        <p style={{ fontSize: 12, color: isDark ? '#FFFFFF' : '#0F172A', margin: '2px 0 0' }}>{selectedUser.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9' }}>
                      <Phone style={{ width: 13, height: 13, color: '#94A3B8', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', margin: 0 }}>Téléphone</p>
                        <p style={{ fontSize: 12, color: isDark ? '#FFFFFF' : '#0F172A', margin: '2px 0 0' }}>{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9' }}>
                    <Calendar style={{ width: 13, height: 13, color: '#94A3B8', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', margin: 0 }}>Créé le</p>
                      <p style={{ fontSize: 12, color: isDark ? '#FFFFFF' : '#0F172A', margin: '2px 0 0' }}>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Permissions actives
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(selectedUser.permissions || []).map(p => (
                        <span
                          key={p}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            background: isDark ? '#2C2C2E' : '#F1F5F9',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                            color: isDark ? '#FFFFFF' : '#0F172A',
                          }}
                        >
                          {p === 'dashboard' ? 'Dashboard' : p === 'products' ? 'Produits' : p === 'orders' ? 'Commandes' : p === 'sales' ? 'Ventes' : p === 'website-info' ? 'Infos site' : p === 'users' ? 'Utilisateurs' : p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!selectedUser.isBuiltIn && (
                  <button
                    type="button"
                    onClick={() => confirmDeleteUser(selectedUser)}
                    style={{
                      width: '100%',
                      marginTop: 18,
                      padding: '9px',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isDark ? '#FF453A' : '#DC2626',
                      background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                      border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer cet utilisateur</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    padding: '8px',
                    borderRadius: 8,
                    background: isDark ? '#2C2C2E' : '#F1F5F9',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                    color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderRadius: 18,
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  minHeight: 180,
                  position: 'sticky',
                  top: 80,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.03)',
                }}
              >
                <Users2 style={{ width: 24, height: 24, color: '#94A3B8' }} />
                <p style={{ fontSize: 12.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', textAlign: 'center', margin: 0 }}>
                  Sélectionnez un utilisateur<br />pour voir ses autorisations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE USER MODAL ── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)' }}
          onClick={() => !createLoading && setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden relative"
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E5E7EB',
              boxShadow: isDark ? '0 24px 70px rgba(0, 0, 0, 0.8)' : '0 24px 60px -12px rgba(15,23,42,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound className="w-5 h-5 text-[#3B82F6]" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>Nouvel utilisateur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDark ? '#2C2C2E' : '#F1F5F9',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {createError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 10,
                    background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                    border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA',
                    color: isDark ? '#FF453A' : '#DC2626',
                    fontSize: 12,
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Display name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
                  Nom complet / Rôle
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Ex: Karim Hadj (Commercial)"
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

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
                  Identifiant de connexion (username)
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="Ex: karim_commercial"
                  autoComplete="off"
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
                <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8', marginTop: 4, margin: 0 }}>
                  Lettres minuscules, chiffres, tirets uniquement.
                </p>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 6 }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 4 caractères"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      paddingRight: '40px',
                      borderRadius: 10,
                      border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                      background: isDark ? '#2C2C2E' : '#F8FAFC',
                      fontSize: 13,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(235,235,245,0.8)' : '#334155', marginBottom: 8 }}>
                  Sections accessibles
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const active = form.permissions.includes(p.key)
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePerm(p.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: active
                            ? (isDark ? '1px solid rgba(59,130,246,0.4)' : '1px solid #93C5FD')
                            : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                          background: active
                            ? (isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF')
                            : (isDark ? '#2C2C2E' : '#F8FAFC'),
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: active ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid #CBD5E1'),
                            background: active ? '#3B82F6' : 'transparent',
                            color: '#FFFFFF',
                          }}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#FFFFFF' : '#0F172A' }}>{p.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: isDark ? '#FFFFFF' : '#0F172A',
                  color: isDark ? '#000000' : '#FFFFFF',
                  border: 'none',
                  cursor: createLoading ? 'wait' : 'pointer',
                  boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,23,42,0.12)',
                }}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde dans Supabase...</span>
                  </>
                ) : (
                  <span>Créer et autoriser l&apos;accès</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
