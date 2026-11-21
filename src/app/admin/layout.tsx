'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/sidebar'
import IosDialogContainer from '@/components/ui/ios-dialog'
import AdminNotifications from '@/components/admin/notifications'
import { AdminThemeProvider, useAdminTheme } from '@/contexts/theme-context'

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin'
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(!isLoginPage)
  const { isDark } = useAdminTheme()

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }

    let isMounted = true

    fetch('/api/admin/me')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Unauthorized')
      })
      .then((data) => {
        if (isMounted) {
          if (data?.authenticated) {
            const user = data.user
            const isDev = user?.role === 'developer' || user?.username === 'wailio'
            const isSuperAdmin = user?.username === 'toweradmin'

            if (!isDev && !isSuperAdmin) {
              const perms: string[] = Array.isArray(user?.permissions) ? user.permissions : []
              const routePermMap: Record<string, string> = {
                '/admin/dashboard': 'dashboard',
                '/admin/products': 'products',
                '/admin/orders': 'orders',
                '/admin/sales': 'sales',
                '/admin/cold-leads': 'sales',
                '/admin/website-info': 'website-info',
                '/admin/users': 'users',
              }

              for (const [route, perm] of Object.entries(routePermMap)) {
                if (pathname === route || pathname.startsWith(route + '/')) {
                  if (!perms.includes(perm)) {
                    const firstAllowed = perms.includes('orders')
                      ? '/admin/orders'
                      : perms.includes('sales')
                      ? '/admin/sales'
                      : perms.includes('products')
                      ? '/admin/products'
                      : perms.includes('website-info')
                      ? '/admin/website-info'
                      : perms.includes('dashboard')
                      ? '/admin/dashboard'
                      : '/admin/login'

                    if (pathname !== firstAllowed) {
                      window.location.href = firstAllowed
                      return
                    }
                  }
                }
              }
            }

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
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: isDark ? '#000000' : '#F5F5F7' }}
      >
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{
            border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #E5E7EB',
            borderTopColor: isDark ? '#FFFFFF' : '#0F172A',
          }}
        />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div
      className="flex flex-col md:flex-row h-[100dvh] overflow-hidden admin-area relative"
      style={{
        fontFamily: 'var(--font-body)',
        height: '100dvh',
        cursor: 'default',
        background: isDark ? '#000000' : '#F5F5F7',
        color: isDark ? '#FFFFFF' : '#0F172A',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <IosDialogContainer />
      <AdminNotifications />

      <AdminSidebar />

      <main
        className="flex-1 overflow-y-auto relative w-full z-10"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          touchAction: 'pan-y',
          scrollBehavior: 'smooth',
          background: isDark ? '#000000' : '#F5F5F7',
          transition: 'background 0.3s ease',
        }}
      >
        <div className="pb-16 md:pb-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  )
}
