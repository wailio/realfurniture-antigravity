import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'

export const metadata = {
  title: "Admin — Château d'art",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F5F3]" style={{ fontFamily: 'var(--font-body)' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
