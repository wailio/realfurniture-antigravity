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
  Activity,
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
import { IosMenu, IosSelect, IosToggle, type IosMenuItem } from '@/components/ui/ios-menu'

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
  developer: { label: 'Développeur', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Crown },
  admin:     { label: 'Administrateur', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: Shield },
}

const STATUS_META = {
  active:    { label: 'Actif',    color: '#047857', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircle2 },
  inactive:  { label: 'Inactif',  color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', icon: Clock },
  suspended: { label: 'Suspendu', color: '#DC2626', bg: '#FEF2F2', border: '#FEE2E2', icon: UserX },
}

const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard',    label: 'Dashboard',      desc: 'Vue globale et métriques' },
  { key: 'products',     label: 'Produits',       desc: 'Catalogue et stocks' },
  { key: 'orders',       label: 'Commandes',      desc: 'Messages et demandes clients' },
  { key: 'sales',        label: 'Ventes CRM',     desc: 'Funnel et leads commerciaux' },
  { key: 'website-info', label: 'Infos site',     desc: 'Textes et horaires' },
  { key: 'users',        label: 'Utilisateurs',   desc: 'Créer et gérer les comptes admin' },
]

function timeAgo(iso?: string) {
  if (!iso) return 'Jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)  return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Il y a ${hrs}h`
  return `Il y a ${Math.floor(hrs / 24)}j`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminUsersPage() {
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

  // Load current user and users list
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

  // Close popup menu on outside click
  useEffect(() => {
    if (!openMenu) return
    const handler = () => setOpenMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [openMenu])

  // Handle form permission toggle
  function togglePerm(key: string) {
    setForm(prev => {
      const exists = prev.permissions.includes(key)
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter(p => p !== key) : [...prev.permissions, key],
      }
    })
  }

  // Handle Create User Submit
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

      showIosToast('Utilisateur créé avec succès et prêt à se connecter !')
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

  // Handle Delete User
  async function confirmDeleteUser(user: AdminUser) {
    setOpenMenu(null)
    if (user.username === 'wailio') {
      showIosToast('Impossible de supprimer le compte développeur principal')
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
        showIosToast('Utilisateur supprimé')
        if (selectedId === user.id) setSelectedId(null)
        await loadUsers()
      } else {
        const data = await res.json()
        showIosToast(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      showIosToast('Erreur réseau lors de la suppression')
    }
  }

  // Handle updating user role via iOS Select
  async function handleUpdateUserRole(username: string, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role: newRole }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.username === username ? { ...u, role: newRole as any } : u))
        showIosToast(`Rôle mis à jour : ${newRole === 'developer' ? 'Développeur' : 'Administrateur'}`)
      } else {
        const data = await res.json()
        showIosToast(data.error || 'Erreur mise à jour rôle', 'error')
      }
    } catch {
      showIosToast('Erreur réseau', 'error')
    }
  }

  // Handle toggling permission via iOS Toggle switch
  async function handleToggleUserPermission(username: string, permKey: string, granted: boolean) {
    const user = users.find(u => u.username === username)
    if (!user) return
    const curPerms = user.permissions || []
    const newPerms = granted ? Array.from(new Set([...curPerms, permKey])) : curPerms.filter(p => p !== permKey)

    // Optimistic UI update
    setUsers(prev => prev.map(u => u.username === username ? { ...u, permissions: newPerms } : u))

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, permissions: newPerms }),
      })
      if (res.ok) {
        showIosToast(granted ? `Permission autorisée` : `Permission désactivée`)
      } else {
        // Revert on error
        setUsers(prev => prev.map(u => u.username === username ? { ...u, permissions: curPerms } : u))
        showIosToast('Erreur mise à jour permission', 'error')
      }
    } catch {
      setUsers(prev => prev.map(u => u.username === username ? { ...u, permissions: curPerms } : u))
      showIosToast('Erreur réseau', 'error')
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
      <style>{`
        .users-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 22px;
          box-shadow: 
            0 1px 2px rgba(15, 23, 42, 0.02),
            0 4px 16px -2px rgba(15, 23, 42, 0.04),
            0 12px 32px -4px rgba(15, 23, 42, 0.025);
        }
        .user-row {
          transition: all 0.15s ease;
          border-radius: 18px;
          cursor: pointer;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02), 0 4px 12px -2px rgba(15, 23, 42, 0.02);
        }
        .user-row:hover {
          border-color: rgba(0, 0, 0, 0.12);
          background: #FBFBFC;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.06);
        }
        .user-row-selected {
          border-color: #0F172A !important;
          border-width: 2px !important;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.06), 0 6px 20px -2px rgba(15, 23, 42, 0.06) !important;
        }
        .perm-pill {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }
        .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .detail-row:last-child { border-bottom: none; }
      `}</style>

      {/* ── Page Header: Apple frosted header with Thin+Bold contrast ── */}
      <div
        style={{
          background: 'rgba(245, 245, 247, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          padding: 'clamp(16px, 2vw, 22px) clamp(16px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Users2 className="w-6 h-6 text-[#0F172A] shrink-0" />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Utilisateurs <span style={{ fontWeight: 800 }}>• Comptes &amp; Accès</span>
            </h1>
            <p className="hidden sm:block" style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Gestion des comptes administrateurs &amp; autorisations
            </p>
          </div>
        </div>

        {/* Right side: role text and add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: '#334155',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              padding: '4px 10px',
              borderRadius: 99,
              whiteSpace: 'nowrap',
            }}
          >
            {currentUserRole === 'developer' ? 'Accès développeur' : 'Accès administrateur'}
          </span>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-[13px] transition-all"
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E293B')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0F172A')}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px,2.5vw,26px) clamp(14px,3vw,28px)' }}>

        {/* ── Status Info Bar: Count & Real-time Supabase sync notice ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '11px 16px',
            borderRadius: 12,
            marginBottom: 18,
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Lock style={{ width: 14, height: 14, color: '#2563EB', flexShrink: 0 }} />
            <p style={{ fontSize: 12.5, color: '#1E40AF', margin: 0 }}>
              Synchronisé en direct avec <strong>Supabase</strong> · Tout nouvel utilisateur peut se connecter instantanément.
            </p>
          </div>
          <div style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
                marginBottom: 16,
                background: '#FFFFFF',
                border: '1px solid #DFE3E8',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <Search style={{ width: 15, height: 15, color: '#94A3B8', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou identifiant..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13, color: '#0F172A',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>

            {/* User rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#0F172A]" />
                <span>Chargement des utilisateurs depuis Supabase...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: 13 }}>
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
                      className={`user-row ${isSelected ? 'user-row-selected' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: user.role === 'developer' ? '#FEF3C7' : '#EFF6FF',
                          border: `1.5px solid ${role.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, color: role.color,
                        }}
                      >
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user.displayName}</span>
                          <span style={{ fontSize: 11.5, color: '#64748B' }}>@{user.username}</span>
                          {user.isBuiltIn && (
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                              Principal
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: role.bg, border: `1px solid ${role.border}` }}>
                            <RoleIcon style={{ width: 10, height: 10, color: role.color }} />
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: role.color }}>{role.label}</span>
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: status.bg, border: `1px solid ${status.color}30` }}>
                            <StatusIcon style={{ width: 10, height: 10, color: status.color }} />
                            <span style={{ fontSize: 10.5, fontWeight: 500, color: status.color }}>{status.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* More menu — iOS Popover Menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                          style={{
                            background: openMenu === user.id ? '#0F172A' : '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: openMenu === user.id ? '#FFFFFF' : '#64748B',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 8,
                            display: 'flex',
                            transition: 'all 0.15s ease',
                          }}
                          title="Actions"
                        >
                          <MoreHorizontal style={{ width: 16, height: 16 }} />
                        </button>
                        <IosMenu
                          isOpen={openMenu === user.id}
                          onClose={() => setOpenMenu(null)}
                          align="right"
                          items={[
                            {
                              id: 'details',
                              label: 'Afficher les permissions',
                              icon: <Shield className="w-3.5 h-3.5" />,
                              onClick: () => { setSelectedId(user.id); setOpenMenu(null) },
                            },
                            {
                              id: 'copy',
                              label: "Copier l'identifiant",
                              icon: <KeyRound className="w-3.5 h-3.5" />,
                              onClick: () => {
                                navigator.clipboard?.writeText(user.username)
                                showIosToast(`@${user.username} copié`)
                              },
                            },
                            ...(user.username !== 'wailio' ? [{
                              id: 'delete',
                              label: 'Supprimer le compte',
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              destructive: true,
                              onClick: () => confirmDeleteUser(user),
                            }] : []),
                          ]}
                        />
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
                className="users-card"
                style={{ borderRadius: 22, padding: '22px', position: 'sticky', top: 80 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: 18,
                      background: selectedUser.role === 'developer' ? '#FEF3C7' : '#EFF6FF',
                      border: `2px solid ${ROLE_META[selectedUser.role]?.border || '#E5E7EB'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 800, color: ROLE_META[selectedUser.role]?.color || '#0F172A',
                      marginBottom: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    {selectedUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{selectedUser.displayName}</p>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 10 }}>@{selectedUser.username}</p>

                  {/* iOS Role Selector Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>RÔLE :</span>
                    <IosSelect
                      options={[
                        { id: 'admin', label: 'Administrateur', icon: <Shield className="w-3.5 h-3.5 text-blue-600 mr-1.5" /> },
                        { id: 'developer', label: 'Développeur', icon: <Crown className="w-3.5 h-3.5 text-amber-600 mr-1.5" /> },
                      ]}
                      value={selectedUser.role}
                      onChange={(newRole) => handleUpdateUserRole(selectedUser.username, newRole)}
                    />
                  </div>
                </div>

                <div>
                  {selectedUser.email && (
                    <div className="detail-row">
                      <Mail style={{ width: 14, height: 14, color: '#94A3B8', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10.5, color: '#64748B', marginBottom: 1, fontWeight: 600 }}>Email</p>
                        <p style={{ fontSize: 12.5, color: '#0F172A', fontWeight: 500 }}>{selectedUser.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div className="detail-row">
                      <Phone style={{ width: 14, height: 14, color: '#94A3B8', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10.5, color: '#64748B', marginBottom: 1, fontWeight: 600 }}>Téléphone</p>
                        <p style={{ fontSize: 12.5, color: '#0F172A', fontWeight: 500 }}>{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <Calendar style={{ width: 14, height: 14, color: '#94A3B8', marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10.5, color: '#64748B', marginBottom: 1, fontWeight: 600 }}>Créé le</p>
                      <p style={{ fontSize: 12.5, color: '#0F172A', fontWeight: 500 }}>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>

                  {/* iOS Permissions Switch Toggles (Matching Image 5) */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: 0 }}>
                        Permissions actives (iOS)
                      </p>
                      <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                        {(selectedUser.permissions || []).length} / {AVAILABLE_PERMISSIONS.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#F8F9FA', padding: '10px 12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                      {AVAILABLE_PERMISSIONS.map(p => {
                        const isGranted = (selectedUser.permissions || []).includes(p.key)
                        return (
                          <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <div style={{ minWidth: 0, paddingRight: 8 }}>
                              <p style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', margin: 0 }}>{p.label}</p>
                              <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{p.desc}</p>
                            </div>
                            <IosToggle
                              checked={isGranted}
                              size="sm"
                              onChange={(checked) => handleToggleUserPermission(selectedUser.username, p.key, checked)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {selectedUser.username !== 'wailio' && (
                  <button
                    type="button"
                    onClick={() => confirmDeleteUser(selectedUser)}
                    className="w-full mt-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer cet utilisateur</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  style={{
                    marginTop: 10, width: '100%', padding: '8px', borderRadius: 8,
                    background: '#F1F5F9', border: '1px solid #E2E8F0',
                    color: '#64748B', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div
                className="users-card"
                style={{
                  borderRadius: 16, padding: '36px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, minHeight: 180, position: 'sticky', top: 80,
                }}
              >
                <Users2 style={{ width: 22, height: 22, color: '#94A3B8' }} />
                <p style={{ fontSize: 12.5, color: '#64748B', textAlign: 'center' }}>
                  Sélectionnez un utilisateur<br />pour voir ses autorisations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE USER MODAL (Light SaaS Style) ── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => !createLoading && setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden relative bg-white border border-[#E5E7EB] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[#0F172A]" />
                <h3 className="text-base font-bold text-[#0F172A]">Nouvel utilisateur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Display name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom complet / Rôle
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Ex: Karim Hadj (Commercial)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Identifiant de connexion (username)
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="Ex: karim_commercial"
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-slate-100 transition-all"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">Lettres minuscules, chiffres, tirets uniquement.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 4 caractères"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permissions (iOS System UI) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Sections accessibles (iOS)
                </label>
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const active = form.permissions.includes(p.key)
                    return (
                      <div
                        key={p.key}
                        className="flex items-center justify-between py-1.5 px-1 border-b border-slate-200/60 last:border-none"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#0F172A]">{p.label}</p>
                          <p className="text-[10.5px] text-slate-500">{p.desc}</p>
                        </div>
                        <IosToggle
                          checked={active}
                          size="sm"
                          onChange={() => togglePerm(p.key)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 shadow-sm transition-all"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sauvegarde dans Supabase...</span>
                  </>
                ) : (
                  <span>Créer et autoriser l'accès</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
