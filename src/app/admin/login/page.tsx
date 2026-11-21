'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, User, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [shake, setShake] = useState(false)
  const [userFocused, setUserFocused] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Dark mode — self-managed since login is outside the admin layout
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_theme')
      if (saved === 'dark') {
        setIsDark(true)
        document.documentElement.setAttribute('data-admin-theme', 'dark')
      }
    } catch {}
  }, [])

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            const perms: string[] = data.user?.permissions || []
            const isSuper = data.user?.role === 'developer' || data.user?.username === 'toweradmin'

            if (!isSuper && perms.length > 0 && !perms.includes('dashboard')) {
              if (perms.includes('orders')) router.replace('/admin/orders')
              else if (perms.includes('sales')) router.replace('/admin/sales')
              else if (perms.includes('products')) router.replace('/admin/products')
              else if (perms.includes('website-info')) router.replace('/admin/website-info')
              else router.replace('/admin/dashboard')
            } else {
              router.replace('/admin/dashboard')
            }
            return
          }
        }
      } catch {}
      setCheckingAuth(false)
    }
    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('admin_auth', '1')
          sessionStorage.setItem('admin_user', JSON.stringify(data.user))
        }
        const perms: string[] = data.user?.permissions || []
        const isSuper = data.user?.role === 'developer' || data.user?.username === 'toweradmin'

        if (!isSuper && perms.length > 0 && !perms.includes('dashboard')) {
          if (perms.includes('orders')) {
            router.replace('/admin/orders')
          } else if (perms.includes('sales')) {
            router.replace('/admin/sales')
          } else if (perms.includes('products')) {
            router.replace('/admin/products')
          } else if (perms.includes('website-info')) {
            router.replace('/admin/website-info')
          } else {
            router.replace('/admin/dashboard')
          }
        } else {
          router.replace('/admin/dashboard')
        }
      } else {
        setError(data.error || 'Identifiant ou mot de passe incorrect')
        setShake(true)
        setTimeout(() => setShake(false), 550)
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const isDisabled = loading || !username.trim() || !password

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: isDark ? '#000000' : '#F6F7F9', transition: 'background 0.3s ease' }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
            borderTopColor: isDark ? '#FFFFFF' : '#0F172A',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        fontFamily: 'var(--font-body)',
        background: isDark ? '#000000' : '#F6F7F9',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Main card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full rounded-[24px] p-8 sm:p-10"
        style={{
          maxWidth: 'min(420px, calc(100vw - 32px))',
          background: isDark ? '#1C1C1E' : '#FFFFFF',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.6)'
            : '0 20px 45px -12px rgba(15,23,42,0.08), 0 1px 3px rgba(0,0,0,0.04)',
          animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : undefined,
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="/taskbarlogo.png"
              alt="M&F Meubles"
              width={160}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>

          {/* Heading */}
          <h1
            className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              color: isDark ? '#FFFFFF' : '#0F172A',
              transition: 'color 0.3s ease',
            }}
          >
            Espace Administration
          </h1>

          {/* Subtitle */}
          <p
            className="text-[13px] text-center mt-1.5 mb-7"
            style={{
              color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
              transition: 'color 0.3s ease',
            }}
          >
            Saisissez vos identifiants pour gérer la collection &amp; les commandes
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Username field */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] font-semibold pl-0.5"
                style={{
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#334155',
                  transition: 'color 0.3s ease',
                }}
              >
                Identifiant
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isDark ? '#2C2C2E' : '#FFFFFF',
                  border: error
                    ? '1.5px solid #FF453A'
                    : userFocused
                    ? isDark ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid #0F172A'
                    : isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                  boxShadow: userFocused
                    ? isDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(15,23,42,0.08)'
                    : 'none',
                }}
              >
                <User
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: userFocused
                      ? isDark ? '#FFFFFF' : '#0F172A'
                      : isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8',
                    transition: 'color 0.2s ease',
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  placeholder="Nom d'utilisateur"
                  autoComplete="username"
                  required
                  className={`w-full bg-transparent text-[13.5px] border-none ${isDark ? 'dark-input' : ''}`}
                  style={{ outline: 'none', boxShadow: 'none', color: isDark ? '#FFFFFF' : '#0F172A' }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] font-semibold pl-0.5"
                style={{
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#334155',
                  transition: 'color 0.3s ease',
                }}
              >
                Mot de passe
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isDark ? '#2C2C2E' : '#FFFFFF',
                  border: error
                    ? '1.5px solid #FF453A'
                    : pwFocused
                    ? isDark ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid #0F172A'
                    : isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
                  boxShadow: pwFocused
                    ? isDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(15,23,42,0.08)'
                    : 'none',
                }}
              >
                <Lock
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: pwFocused
                      ? isDark ? '#FFFFFF' : '#0F172A'
                      : isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8',
                    transition: 'color 0.2s ease',
                  }}
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full bg-transparent text-[13.5px] border-none flex-1 ${isDark ? 'dark-input' : ''}`}
                  style={{ outline: 'none', boxShadow: 'none', color: isDark ? '#FFFFFF' : '#0F172A' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="transition-colors p-1 shrink-0"
                  style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-[12.5px]"
                style={{
                  background: isDark ? 'rgba(255,69,58,0.1)' : '#FEF2F2',
                  border: isDark ? '1px solid rgba(255,69,58,0.3)' : '1px solid #FECACA',
                  color: '#FF453A',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: isDisabled
                  ? isDark ? '#3A3A3C' : '#E2E8F0'
                  : isDark ? '#FFFFFF' : '#0F172A',
                color: isDisabled
                  ? isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8'
                  : isDark ? '#000000' : '#FFFFFF',
                boxShadow: isDisabled
                  ? 'none'
                  : isDark
                  ? '0 2px 8px rgba(0,0,0,0.4)'
                  : '0 2px 8px rgba(15,23,42,0.12)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: isDark ? '#000000' : '#FFFFFF' }}
                  />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          <p
            className="text-[11.5px] text-center mt-6"
            style={{
              color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8',
              transition: 'color 0.3s ease',
            }}
          >
            Espace sécurisé M&amp;F Meubles • Kouba
          </p>
        </div>
      </div>

      <style>{`
        input:focus {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
        input {
          color: ${isDark ? '#FFFFFF' : '#0F172A'} !important;
        }
        .dark-input::placeholder {
          color: rgba(235,235,245,0.3);
        }
        input:not(.dark-input)::placeholder {
          color: #94A3B8;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  )
}
