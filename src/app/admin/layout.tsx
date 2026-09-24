import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'

export const runtime = 'edge'

export const metadata = {
  title: "Admin — Château d'art",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0A0B0C]"
      style={{
        fontFamily: 'var(--font-body)',
      }}
    >
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
