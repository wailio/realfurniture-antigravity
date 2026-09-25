'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/sidebar'
import IosDialogContainer from '@/components/ui/ios-dialog'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin'

  if (isLoginPage) {
    // No sidebar — full screen for login
    return (
      <div style={{ fontFamily: 'var(--font-body)' }}>
        {children}
      </div>
    )
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0A0B0C]"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <IosDialogContainer />
      <AdminSidebar />
      <main
        className="flex-1 overflow-y-auto relative bg-[#07090E]"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(7, 9, 14, 0.30) 0%, rgba(5, 7, 12, 0.50) 100%),
            url('/admin-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {children}
      </main>
    </div>
  )
}
