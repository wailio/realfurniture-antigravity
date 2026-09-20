'use client'

export const runtime = 'edge'

import { Shield, Database, Bell, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
      <div
        style={{
          background: 'rgba(18, 15, 12, 0.70)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
            statusColor: '#34d399',
            statusBg: 'rgba(16, 185, 129, 0.15)',
            statusBorder: 'rgba(16, 185, 129, 0.3)',
          },
          {
            icon: Shield,
            title: 'Sécurité & Accès',
            desc: 'Verrouillage de /admin via Cloudflare Access (Zero Trust)',
            status: 'Optionnel',
            statusColor: '#D4D4D8',
            statusBg: 'rgba(255, 255, 255, 0.06)',
            statusBorder: 'rgba(255, 255, 255, 0.1)',
          },
          {
            icon: Bell,
            title: 'Notifications',
            desc: 'Alertes email / WhatsApp pour les nouvelles commandes',
            status: 'Bientôt',
            statusColor: '#D4D4D8',
            statusBg: 'rgba(255, 255, 255, 0.06)',
            statusBorder: 'rgba(255, 255, 255, 0.1)',
          },
          {
            icon: Palette,
            title: 'Apparence',
            desc: 'Design luxury dark glassy exclusif',
            status: 'Actif',
            statusColor: '#d1aa5c',
            statusBg: 'rgba(209, 170, 92, 0.15)',
            statusBorder: 'rgba(209, 170, 92, 0.3)',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(22, 18, 14, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 18,
              padding: '20px 22px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 12,
              transition: 'all 0.2s ease',
            }}
            className="hover:shadow-2xl hover:border-[#d1aa5c]/30 hover:translate-x-1"
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(209, 170, 92, 0.12)',
                border: '1px solid rgba(209, 170, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <item.icon className="w-5 h-5" style={{ color: '#d1aa5c' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: '#FFFFFF' }}>{item.title}</p>
              <p style={{ fontSize: 12.5, color: '#A1A1AA', marginTop: 2 }}>{item.desc}</p>
            </div>
            <span
              style={{
                fontSize: 11.5,
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

        {/* Supabase SQL */}
        <div
          style={{
            marginTop: 24,
            background: 'rgba(14, 11, 8, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            borderRadius: 18,
            padding: '22px 24px',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: 4,
              letterSpacing: '0.02em',
            }}
          >
            Script SQL — Configuration Supabase
          </p>
          <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 16 }}>
            Copiez ce script dans Supabase → SQL Editor → Run
          </p>
          <pre
            style={{
              fontSize: 11,
              color: '#D4D4D8',
              lineHeight: 1.7,
              overflowX: 'auto',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}
          >
{`-- Products
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  price numeric NOT NULL,
  sale_price numeric,
  category text NOT NULL,
  images text[] DEFAULT '{}',
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Messages (contact form)
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, email text, phone text,
  subject text, message text, product text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Orders / Sales funnel
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text, phone text,
  product_id uuid REFERENCES products(id),
  amount numeric,
  source_message_id uuid REFERENCES messages(id),
  funnel_stage text DEFAULT 'cold',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Page views
CREATE TABLE page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text, referrer text,
  visitor_id text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (true);
CREATE POLICY "public_insert_messages" ON messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_page_views" ON page_views
  FOR INSERT WITH CHECK (true);`}
          </pre>
        </div>
      </div>
    </div>
  )
}
