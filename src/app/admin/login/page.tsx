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
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [shake, setShake] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if already authenticated
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            router.replace('/admin/dashboard')
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
        router.replace('/admin/dashboard')
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

      {/* Main card - The 'info shape' styled with abbc.jpg background and glassmorphism */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[430px] rounded-[28px] overflow-hidden"
        style={{
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

        {/* Top Half-tone dots pattern (bgdots) exactly like reference */}
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
        <div className="relative z-10 px-7 sm:px-9 pt-8 pb-9 flex flex-col items-center">
          {/* Logo container matching reference layout with shop logo (logos.png) */}
          <div
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-[20px] flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(145deg, rgba(28, 30, 38, 0.95) 0%, rgba(15, 17, 22, 0.95) 100%)',
              border: '1px solid rgba(209, 170, 92, 0.32)',
              boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 0 24px rgba(209, 170, 92, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Image
              src="/logos.png"
              alt="Château d'art"
              width={54}
              height={54}
              className="object-contain drop-shadow-[0_4px_12px_rgba(209,170,92,0.45)]"
              priority
            />
          </div>

          {/* Heading - Welcome Admin (matching reference typography) */}
          <h1
            className="text-[25px] sm:text-[27px] font-bold text-white tracking-[-0.02em] text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome Admin
          </h1>

          {/* Subtitle - Please enter your details to sign in */}
          <p className="text-[13px] sm:text-[13.5px] text-[#A1A1AA] text-center mt-1.5 mb-7">
            Please enter your details to sign in
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Username / Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-white/90 pl-0.5">
                Email address
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.055)',
                  border: error
                    ? '1px solid rgba(248, 113, 113, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <User className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                  className="w-full bg-transparent text-[13.5px] text-white placeholder-white/30 outline-none border-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-white/90 pl-0.5">
                Password
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.055)',
                  border: error
                    ? '1px solid rgba(248, 113, 113, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <Lock className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-[13.5px] text-white placeholder-white/30 outline-none border-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-500/10 border border-red-500/30 text-red-400 text-[12.5px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full mt-2 py-3.5 rounded-[12px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200"
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

          {/* Reference caption at bottom: 'Here you just enter the access code' */}
          <p className="text-[12px] text-[#A1A1AA]/80 text-center mt-6">
            Here you just enter the access code
          </p>
        </div>
      </div>

      {/* Shake keyframes */}
      <style>{`
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
