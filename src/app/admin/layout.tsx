import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'

export const runtime = 'edge'

export const metadata = {
  title: "Admin — Château d'art",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1E1912 0%, #2c2418 50%, #8b7344 100%)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
