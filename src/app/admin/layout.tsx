'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/sidebar'
import IosDialogContainer from '@/components/ui/ios-dialog'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin'
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(!isLoginPage)

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }

    let isMounted = true

    // Check with server if current session cookie is valid
    fetch('/api/admin/me')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Unauthorized')
      })
      .then((data) => {
        if (isMounted) {
          if (data?.authenticated) {
            setAuthorized(true)
            setChecking(false)
          } else {
            window.location.href = '/admin/login'
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          window.location.href = '/admin/login'
        }
      })

    return () => {
      isMounted = false
    }
  }, [isLoginPage, pathname])

  if (isLoginPage) {
    return <div style={{ fontFamily: 'var(--font-body)' }}>{children}</div>
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07090E]">
        <div className="w-8 h-8 border-2 border-[#d1aa5c]/20 border-t-[#d1aa5c] rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div
      className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-[#0A0B0C] admin-area relative"
      style={{
        fontFamily: 'var(--font-body)',
        height: '100dvh',
      }}
    >
      <IosDialogContainer />

      {/* Hardware-accelerated fixed background (NO background-attachment: fixed repaint lag) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(7,9,14,0.40) 0%, rgba(5,7,12,0.65) 100%), url('/admin-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />

      <AdminSidebar />

      <main
        className="flex-1 overflow-y-auto relative w-full z-10"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          touchAction: 'pan-y',
          scrollBehavior: 'smooth',
          background: 'transparent',
        }}
      >
        <div className="pb-16 md:pb-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
