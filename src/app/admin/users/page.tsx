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
} from 'lucide-react'

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
}

// ── Static user list (developer and admin only — you won't appear as a user) ─
const USERS: AdminUser[] = [
  {
    id: '1',
    username: 'wailio',
    displayName: 'Admin',
    role: 'admin',
    email: 'admin@chateauart.dz',
    phone: '',
    lastLogin: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    status: 'active',
    permissions: ['products', 'orders', 'website-info', 'sales'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_META = {
  developer: { label: 'Développeur', color: '#d1aa5c', bg: 'rgba(209,170,92,0.12)', border: 'rgba(209,170,92,0.28)', icon: Crown },
  admin:     { label: 'Administrateur', color: '#64D2FF', bg: 'rgba(100,210,255,0.12)', border: 'rgba(100,210,255,0.28)', icon: Shield },
}

const STATUS_META = {
  active:    { label: 'Actif',    color: '#30D158', bg: 'rgba(48,209,88,0.10)',   icon: CheckCircle2 },
  inactive:  { label: 'Inactif', color: '#8E929B', bg: 'rgba(142,146,155,0.10)', icon: Clock },
  suspended: { label: 'Suspendu', color: '#FF453A', bg: 'rgba(255,69,58,0.10)',  icon: UserX },
}

const PERMISSION_LABELS: Record<string, string> = {
  products:       'Produits',
  orders:         'Commandes',
  'website-info': 'Infos site',
  sales:          'Ventes',
  users:          'Utilisateurs',
  settings:       'Paramètres',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)  return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Il y a ${hrs}h`
  return `Il y a ${Math.floor(hrs / 24)}j`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_user')
      if (stored) {
        const u = JSON.parse(stored)
        setCurrentUserRole(u.role || 'admin')
      }
    } catch {}
    fetch('/api/admin/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.authenticated && d.user) setCurrentUserRole(d.user.role || 'admin')
    }).catch(() => {})
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return
    const handler = () => setOpenMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [openMenu])

  const filtered = USERS.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const selectedUser = USERS.find(u => u.id === selectedId) ?? null

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
          padding: 3px 10px;
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

      {/* ── Page Header ── */}
      <div
        style={{
          background: 'rgba(10, 11, 12, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(209,170,92,0.12)', border: '1px solid rgba(209,170,92,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users2 style={{ width: 15, height: 15, color: '#d1aa5c' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2 }}>
              Utilisateurs
            </h1>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>
              Accès restreint — développeur &amp; admin uniquement
            </p>
          </div>
        </div>

        {/* Dev-only badge */}
        {currentUserRole === 'developer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(209,170,92,0.10)', border: '1px solid rgba(209,170,92,0.25)' }}>
            <Crown style={{ width: 12, height: 12, color: '#d1aa5c' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#d1aa5c' }}>Accès développeur</span>
          </div>
        )}
      </div>

      <div style={{ padding: 'clamp(14px,2.5vw,26px) clamp(14px,3vw,28px)' }}>

        {/* ── Access Notice ── */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', borderRadius: 12, marginBottom: 20,
            background: 'rgba(209,170,92,0.07)',
            border: '1px solid rgba(209,170,92,0.20)',
          }}
        >
          <Lock style={{ width: 14, height: 14, color: '#d1aa5c', flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            Cette page est visible uniquement par les comptes <strong style={{ color: '#d1aa5c' }}>développeur</strong> et <strong style={{ color: '#64D2FF' }}>administrateur</strong>. Les visiteurs du site ne figurent pas ici.
          </p>
        </div>

        {/* ── Main Grid: user list + detail panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: 16 }}>

          {/* ── Left: User List ── */}
          <div>
            {/* Search bar */}
            <div
              className="users-glass"
              style={{ borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <Search style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13.5, color: '#FFFFFF',
                  caretColor: '#d1aa5c',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'Total', count: USERS.length, color: '#C7CBD1' },
                { label: 'Actifs', count: USERS.filter(u => u.status === 'active').length, color: '#30D158' },
                { label: 'Admins', count: USERS.filter(u => u.role === 'admin').length, color: '#64D2FF' },
                { label: 'Développeurs', count: USERS.filter(u => u.role === 'developer').length, color: '#d1aa5c' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.count}</span>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* User rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  Aucun utilisateur trouvé
                </div>
              ) : filtered.map(user => {
                const role = ROLE_META[user.role]
                const status = STATUS_META[user.status]
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
                      gap: 14,
                      padding: '14px 16px',
                      background: isSelected ? undefined : 'rgba(255,255,255,0.03)',
                      border: isSelected ? undefined : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: user.role === 'developer'
                          ? 'linear-gradient(135deg, #2A2416 0%, #1A1710 100%)'
                          : 'linear-gradient(135deg, #12182A 0%, #0C1018 100%)',
                        border: `1.5px solid ${role.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: role.color,
                        boxShadow: `0 4px 12px ${role.color}18`,
                      }}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>{user.displayName}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>@{user.username}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        {/* Role pill */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: role.bg, border: `1px solid ${role.border}` }}>
                          <RoleIcon style={{ width: 10, height: 10, color: role.color }} />
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: role.color }}>{role.label}</span>
                        </div>
                        {/* Status pill */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: status.bg, border: `1px solid ${status.color}25` }}>
                          <StatusIcon style={{ width: 10, height: 10, color: status.color }} />
                          <span style={{ fontSize: 10.5, fontWeight: 500, color: status.color }}>{status.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Last login */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }} className="hidden sm:block">
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Dernière connexion</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        {user.lastLogin ? timeAgo(user.lastLogin) : '—'}
                      </p>
                    </div>

                    {/* More menu */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', borderRadius: 6, display: 'flex' }}
                      >
                        <MoreHorizontal style={{ width: 16, height: 16 }} />
                      </button>
                      {openMenu === user.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 100,
                            background: 'rgba(22,24,28,0.97)', backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
                            padding: '6px', minWidth: 170,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                          }}
                        >
                          {[
                            { label: 'Voir les détails', action: () => { setSelectedId(user.id); setOpenMenu(null) } },
                            { label: 'Copier le nom', action: () => { navigator.clipboard?.writeText(user.username); setOpenMenu(null) } },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={item.action}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '9px 12px', borderRadius: 8, border: 'none',
                                background: 'transparent', color: 'rgba(255,255,255,0.75)',
                                cursor: 'pointer', fontSize: 13, fontWeight: 400,
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right: Detail Panel ── */}
          <div>
            {selectedUser ? (
              <div
                className="users-glass"
                style={{ borderRadius: 16, padding: '22px', position: 'sticky', top: 80 }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: selectedUser.role === 'developer'
                        ? 'linear-gradient(135deg, #2A2416, #1A1710)'
                        : 'linear-gradient(135deg, #12182A, #0C1018)',
                      border: `2px solid ${ROLE_META[selectedUser.role].border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, fontWeight: 700, color: ROLE_META[selectedUser.role].color,
                      boxShadow: `0 8px 24px ${ROLE_META[selectedUser.role].color}22`,
                      marginBottom: 12,
                    }}
                  >
                    {selectedUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{selectedUser.displayName}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>@{selectedUser.username}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <div style={{ padding: '3px 10px', borderRadius: 7, background: ROLE_META[selectedUser.role].bg, border: `1px solid ${ROLE_META[selectedUser.role].border}` }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: ROLE_META[selectedUser.role].color }}>{ROLE_META[selectedUser.role].label}</span>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 7, background: STATUS_META[selectedUser.status].bg, border: `1px solid ${STATUS_META[selectedUser.status].color}28` }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_META[selectedUser.status].color }}>{STATUS_META[selectedUser.status].label}</span>
                    </div>
                  </div>
                </div>

                {/* Detail rows */}
                <div>
                  {selectedUser.email && (
                    <div className="detail-row">
                      <Mail style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Email</p>
                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)' }}>{selectedUser.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.lastLogin && (
                    <div className="detail-row">
                      <Activity style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Dernière connexion</p>
                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)' }}>{timeAgo(selectedUser.lastLogin)}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.createdAt && (
                    <div className="detail-row">
                      <Calendar style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Membre depuis</p>
                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.80)' }}>{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {/* Permissions */}
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Permissions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedUser.permissions.map(p => (
                        <span
                          key={p}
                          className="perm-pill"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}
                        >
                          {PERMISSION_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setSelectedId(null)}
                  style={{
                    marginTop: 20, width: '100%', padding: '10px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div
                className="users-glass"
                style={{
                  borderRadius: 16, padding: '40px 22px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, minHeight: 200, position: 'sticky', top: 80,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users2 style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.25)' }} />
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                  Sélectionnez un utilisateur<br />pour voir ses détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
