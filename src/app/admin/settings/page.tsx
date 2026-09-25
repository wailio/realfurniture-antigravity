'use client'

export const runtime = 'edge'

import { Shield, Database, Bell, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '28px 36px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          Paramètres
        </h1>
        <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>Configuration du panneau d&apos;administration</p>
      </div>

      <div style={{ padding: '36px', maxWidth: 680 }}>
        {[
          {
            icon: Database,
            title: 'Base de données',
            desc: 'Connexion Supabase et état de la synchronisation',
            status: 'Connecté (Live)',
            statusColor: '#10B981',
            statusBg: 'rgba(16, 185, 129, 0.12)',
            statusBorder: 'rgba(16, 185, 129, 0.25)',
          },
          {
            icon: Shield,
            title: 'Sécurité & Accès',
            desc: 'Verrouillage de /admin via Cloudflare Access (Zero Trust)',
            status: 'Optionnel',
            statusColor: '#6B7280',
            statusBg: '#F3F4F6',
            statusBorder: 'rgba(0, 0, 0, 0.06)',
          },
          {
            icon: Bell,
            title: 'Notifications',
            desc: 'Alertes email / WhatsApp pour les nouvelles commandes',
            status: 'Bientôt',
            statusColor: '#6B7280',
            statusBg: '#F3F4F6',
            statusBorder: 'rgba(0, 0, 0, 0.06)',
          },
          {
            icon: Palette,
            title: 'Apparence',
            desc: 'Design Apple Studio exclusif',
            status: 'Actif',
            statusColor: '#007AFF',
            statusBg: 'rgba(0, 122, 255, 0.12)',
            statusBorder: 'rgba(0, 122, 255, 0.25)',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 18,
              padding: '20px 22px',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 14,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
            }}
            className="hover:shadow-lg hover:translate-x-1"
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <item.icon className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>{item.desc}</p>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: item.statusColor,
                background: item.statusBg,
                border: `1px solid ${item.statusBorder}`,
                padding: '4px 12px',
                borderRadius: 99,
                flexShrink: 0,
              }}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
