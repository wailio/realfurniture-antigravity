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
        {/* Global iOS glass polish for all admin pages */}
        <style>{`
          /* Admin-wide dark glass overrides */
          .admin-glass-card {
            background: rgba(255,255,255,0.07) !important;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.11) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10);
          }
          /* Placeholder text in glass inputs */
          .admin-area input::placeholder,
          .admin-area textarea::placeholder {
            color: rgba(255,255,255,0.28) !important;
          }
          /* Selection highlight */
          .admin-area ::selection {
            background: rgba(255,255,255,0.2);
            color: #FFFFFF;
          }
          /* Custom scrollbar for admin content */
          .admin-area ::-webkit-scrollbar { width: 4px; height: 4px; }
          .admin-area ::-webkit-scrollbar-track { background: transparent; }
          .admin-area ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.12);
            border-radius: 99px;
          }
          .admin-area ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.22);
          }
          /* Smooth card hover for any remaining white-bg cards */
          .admin-area [style*="background: 'rgba(255,255,255,0.07)'"]:hover {
            background: rgba(255,255,255,0.10) !important;
          }
        `}</style>
        <div className="admin-area h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
