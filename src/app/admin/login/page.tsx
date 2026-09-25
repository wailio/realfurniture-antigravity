'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'

const ADMIN_PASSWORD = 'chateau2026'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // If already logged in, redirect
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === '1') {
      router.replace('/admin/dashboard')
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', '1')
        router.push('/admin/dashboard')
      } else {
        setError('Mot de passe incorrect')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        backgroundImage: `
          linear-gradient(to bottom, rgba(7,9,14,0.30) 0%, rgba(5,7,12,0.60) 100%),
          url('/admin-bg.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-card {
          animation: loginFadeIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) both;
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          padding: 13px 44px 13px 16px;
          color: #FFFFFF;
          font-size: 14px;
          font-family: var(--font-body);
          outline: none;
          transition: all 0.2s cubic-bezier(0.32,0.72,0,1);
          box-sizing: border-box;
        }
        .login-input:focus {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
        .login-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: rgba(255,255,255,0.92);
          color: #0A0B0C;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.32,0.72,0,1);
          font-family: var(--font-body);
        }
        .login-btn:hover:not(:disabled) {
          background: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .error-shake { animation: shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both; }
      `}</style>

      <div
        className="login-card"
        style={{
          borderRadius: 20,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 380,
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <Shield style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.8)' }} />
            </div>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 300,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            Espace Admin
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
            Château d&apos;art — Accès réservé
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 28 }} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••••"
                className={`login-input${error ? ' error-shake' : ''}`}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center',
                }}
              >
                {showPw
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye style={{ width: 16, height: 16 }} />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 8, marginBottom: 14,
              background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)',
              fontSize: 12.5, color: '#FF6B6B',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: '#FF3B30', flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading || !password} style={{ marginTop: 8 }}>
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                </path>
              </svg>
            ) : (
              <>
                Accéder au tableau de bord
                <ArrowRight style={{ width: 15, height: 15 }} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Château d&apos;art · Système de gestion interne
        </p>
      </div>
    </div>
  )
}
