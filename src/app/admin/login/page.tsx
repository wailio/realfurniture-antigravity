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

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#0E0F10] to-[#141518]">
        <div className="w-8 h-8 border-2 border-[#d1aa5c]/20 border-t-[#d1aa5c] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0E0F10 0%, #141518 100%)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Subtle background ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(209, 170, 92, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Main card — smaller on mobile so sides are visible */}
      <div
        ref={cardRef}
        className="relative z-10 w-full rounded-[28px] overflow-hidden"
        style={{
          maxWidth: 'min(390px, calc(100vw - 48px))',
          boxShadow: '0 28px 75px -10px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : undefined,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Layer 1: abbc.jpg background with transparency */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/abbc.jpg')`,
            opacity: 0.36,
            filter: 'brightness(0.95) contrast(1.1)',
          }}
        />

        {/* Layer 2: Frosted dark glass tint & backdrop blur */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 18, 24, 0.82) 0%, rgba(11, 13, 17, 0.92) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        />

        {/* Top Half-tone dots pattern */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[360px] h-[135px] pointer-events-none select-none"
          style={{
            backgroundImage: `url('/bgdots.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.28,
            filter: 'invert(1) brightness(1.3)',
          }}
        />

        {/* Card Content */}
        <div className="relative z-10 px-6 sm:px-8 pt-8 pb-8 flex flex-col items-center">

          {/* ── Logo: directly on the blue bg — no surrounding box ── */}
          <div className="mb-5 relative flex items-center justify-center">
            <Image
              src="/logos.png"
              alt="Château d'art"
              width={66}
              height={66}
              className="object-contain drop-shadow-[0_6px_18px_rgba(209,170,92,0.55)]"
              priority
            />
          </div>

          {/* Heading */}
          <h1
            className="text-[24px] sm:text-[26px] font-bold text-white tracking-[-0.02em] text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome Admin
          </h1>

          {/* Subtitle */}
          <p className="text-[12.5px] sm:text-[13px] text-[#A1A1AA] text-center mt-1.5 mb-6">
            Please enter your details to sign in
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">

            {/* ── Username field ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-white/80 pl-0.5">
                Username
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.055)',
                  border: error
                    ? '1.5px solid rgba(248, 113, 113, 0.6)'
                    : userFocused
                    ? '1.5px solid rgba(209, 170, 92, 0.7)'
                    : '1.5px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: userFocused
                    ? '0 0 0 3px rgba(209, 170, 92, 0.18), 0 2px 12px rgba(209, 170, 92, 0.08)'
                    : 'none',
                }}
              >
                <User className="w-4 h-4 shrink-0" style={{ color: userFocused ? '#d1aa5c' : 'rgba(255,255,255,0.35)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/25 border-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>
            </div>

            {/* ── Password field ── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-white/80 pl-0.5">
                Password
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.055)',
                  border: error
                    ? '1.5px solid rgba(248, 113, 113, 0.6)'
                    : pwFocused
                    ? '1.5px solid rgba(209, 170, 92, 0.7)'
                    : '1.5px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: pwFocused
                    ? '0 0 0 3px rgba(209, 170, 92, 0.18), 0 2px 12px rgba(209, 170, 92, 0.08)'
                    : 'none',
                }}
              >
                <Lock className="w-4 h-4 shrink-0" style={{ color: pwFocused ? '#d1aa5c' : 'rgba(255,255,255,0.35)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/25 border-none flex-1"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="text-white/35 hover:text-white/70 transition-colors p-1 shrink-0"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-[12px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full mt-1.5 py-3.5 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              style={{
                background:
                  loading || !username.trim() || !password
                    ? 'rgba(255, 255, 255, 0.10)'
                    : 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                color: loading || !username.trim() || !password ? 'rgba(255, 255, 255, 0.35)' : '#0A0B0C',
                boxShadow:
                  loading || !username.trim() || !password
                    ? 'none'
                    : '0 8px 25px rgba(209, 170, 92, 0.35)',
                cursor: loading || !username.trim() || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A0B0C]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="text-[11.5px] text-[#A1A1AA]/70 text-center mt-5">
            Here you just enter the access code
          </p>
        </div>
      </div>

      {/* Global style: remove ALL native input focus outlines */}
      <style>{`
        input:focus {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(16, 18, 24, 0.97) inset !important;
          -webkit-text-fill-color: #FFFFFF !important;
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
