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
  developer: { label: 'Développeur', color: '#d1aa5c', bg: 'rgba(209,170,92,0.12)', border: 'rgba(209,170,92,0.28)', icon: Crown },
  admin:     { label: 'Administrateur', color: '#64D2FF', bg: 'rgba(100,210,255,0.12)', border: 'rgba(100,210,255,0.28)', icon: Shield },
}

const STATUS_META = {
  active:    { label: 'Actif',    color: '#30D158', bg: 'rgba(48,209,88,0.10)',   icon: CheckCircle2 },
  inactive:  { label: 'Inactif', color: '#8E929B', bg: 'rgba(142,146,155,0.10)', icon: Clock },
  suspended: { label: 'Suspendu', color: '#FF453A', bg: 'rgba(255,69,58,0.10)',  icon: UserX },
}

const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard',    label: 'Dashboard',   desc: 'Vue globale et métriques' },
  { key: 'products',     label: 'Produits',    desc: 'Catalogue et stocks' },
  { key: 'orders',       label: 'Commandes',   desc: 'Messages et demandes clients' },
  { key: 'sales',        label: 'Ventes CRM',  desc: 'Funnel et leads commerciaux' },
  { key: 'website-info', label: 'Infos site',  desc: 'Textes et horaires' },
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
    if (user.isBuiltIn) {
      showIosToast('Impossible de supprimer le compte système principal')
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

  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedUser = users.find(u => u.id === selectedId) ?? null

  return (
    <div className="min-h-screen" style={{ background: 'transparent', fontFamily: 'var(--font-body)' }}>
      <style>{`
        .users-glass {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .user-row {
          transition: all 0.18s cubic-bezier(0.32,0.72,0,1);
          border-radius: 12px;
          cursor: pointer;
        }
        .user-row:hover {
          background: rgba(255,255,255,0.055) !important;
        }
        .user-row-selected {
          background: rgba(255,255,255,0.09) !important;
          border: 1px solid rgba(255,255,255,0.16) !important;
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
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .detail-row:last-child { border-bottom: none; }
      `}</style>

      {/* ── Page Header: Icon directly on bg, one-line role text directly on bg ── */}
      <div
        style={{
          background: 'rgba(10, 11, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
          {/* User icon directly in background without any shape around it */}
          <Users2 className="w-6 h-6 text-[#d1aa5c] shrink-0" />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 24,
                fontWeight: 400,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Utilisateurs
            </h1>
            <p className="hidden sm:block" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
              Gestion des comptes administrateurs &amp; autorisations
            </p>
          </div>
        </div>

        {/* Right side: role text directly in background, small, one line, no shape */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: '#d1aa5c', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {currentUserRole === 'developer' ? 'Accès développeur' : 'Accès administrateur'}
          </span>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-medium text-xs sm:text-[13px] transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
              color: '#0A0B0C',
              boxShadow: '0 4px 14px rgba(209, 170, 92, 0.3)',
            }}
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
            background: 'rgba(209,170,92,0.06)',
            border: '1px solid rgba(209,170,92,0.18)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Lock style={{ width: 14, height: 14, color: '#d1aa5c', flexShrink: 0 }} />
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Synchronisé en direct avec <strong>Supabase</strong> · Tout nouvel utilisateur peut se connecter instantanément.
            </p>
          </div>
          <div style={{ fontSize: 11.5, color: '#d1aa5c', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {customCount} / {maxCustomUsers} utilisateurs créés
          </div>
        </div>

        {/* ── Main Grid: User List (Left) + Detail Panel (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: 16 }}>

          {/* ── Left: User List ── */}
          <div>
            {/* Search bar */}
            <div
              className="users-glass"
              style={{ borderRadius: 12, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <Search style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou identifiant..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13, color: '#FFFFFF',
                  caretColor: '#d1aa5c',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>

            {/* User rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-white/50 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#d1aa5c]" />
                <span>Chargement des utilisateurs depuis Supabase...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
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
                        padding: '12px 14px',
                        background: isSelected ? undefined : 'rgba(255,255,255,0.03)',
                        border: isSelected ? undefined : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: user.role === 'developer'
                            ? 'linear-gradient(135deg, #2A2416 0%, #1A1710 100%)'
                            : 'linear-gradient(135deg, #12182A 0%, #0C1018 100%)',
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
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF' }}>{user.displayName}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>@{user.username}</span>
                          {user.isBuiltIn && (
                            <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                              Principal
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, flexWrap: 'wrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1.5px 7px', borderRadius: 5, background: role.bg, border: `1px solid ${role.border}` }}>
                            <RoleIcon style={{ width: 10, height: 10, color: role.color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: role.color }}>{role.label}</span>
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1.5px 7px', borderRadius: 5, background: status.bg, border: `1px solid ${status.color}25` }}>
                            <StatusIcon style={{ width: 10, height: 10, color: status.color }} />
                            <span style={{ fontSize: 10, fontWeight: 500, color: status.color }}>{status.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* More menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: '6px', borderRadius: 6, display: 'flex' }}
                          title="Actions"
                        >
                          <MoreHorizontal style={{ width: 16, height: 16 }} />
                        </button>
                        {openMenu === user.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 100,
                              background: 'rgba(22,24,28,0.97)', backdropFilter: 'blur(30px)',
                              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
                              padding: '5px', minWidth: 170,
                              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => { setSelectedId(user.id); setOpenMenu(null) }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12.5 }}
                            >
                              Détails
                            </button>
                            {!user.isBuiltIn && (
                              <button
                                type="button"
                                onClick={() => confirmDeleteUser(user)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#FF453A', cursor: 'pointer', fontSize: 12.5 }}
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
                className="users-glass"
                style={{ borderRadius: 16, padding: '20px', position: 'sticky', top: 80 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 58, height: 58, borderRadius: 16,
                      background: 'linear-gradient(135deg, #12182A, #0C1018)',
                      border: `2px solid ${ROLE_META[selectedUser.role]?.border || 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 700, color: ROLE_META[selectedUser.role]?.color || '#FFFFFF',
                      marginBottom: 10,
                    }}
                  >
                    {selectedUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{selectedUser.displayName}</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>@{selectedUser.username}</p>
                </div>

                <div>
                  {selectedUser.email && (
                    <div className="detail-row">
                      <Mail style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>Email</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{selectedUser.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div className="detail-row">
                      <Phone style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>Téléphone</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <Calendar style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>Créé le</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Permissions actives</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(selectedUser.permissions || []).map(p => (
                        <span key={p} className="perm-pill" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
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
                    className="w-full mt-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all"
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
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div
                className="users-glass"
                style={{
                  borderRadius: 16, padding: '36px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, minHeight: 180, position: 'sticky', top: 80,
                }}
              >
                <Users2 style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.25)' }} />
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                  Sélectionnez un utilisateur<br />pour voir ses autorisations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE USER MODAL (iOS Style) ── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => !createLoading && setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden relative"
            style={{
              background: 'rgba(24, 26, 30, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[#d1aa5c]" />
                <h3 className="text-base font-semibold text-white">Nouvel utilisateur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Display name */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Nom complet / Rôle
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Ex: Karim Hadj (Commercial)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] transition-colors"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Identifiant de connexion (username)
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="Ex: karim_commercial"
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] transition-colors"
                />
                <p className="text-[10.5px] text-white/35 mt-1">Lettres minuscules, chiffres, tirets uniquement.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">
                  Sections accessibles
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const active = form.permissions.includes(p.key)
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePerm(p.key)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          active
                            ? 'bg-[#d1aa5c]/10 border-[#d1aa5c]/40 text-white'
                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            active ? 'bg-[#d1aa5c] border-[#d1aa5c] text-black font-bold' : 'border-white/20'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{p.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                  color: '#0A0B0C',
                  boxShadow: '0 8px 24px rgba(209, 170, 92, 0.35)',
                }}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
