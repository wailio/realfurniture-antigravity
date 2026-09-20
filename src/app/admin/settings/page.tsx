'use client'

import { Shield, Database, Bell, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '28px 36px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 300,
            color: '#0E0F10',
            letterSpacing: '-0.02em',
          }}
        >
          Paramètres
        </h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Configuration du panneau d&apos;administration</p>
      </div>

      <div style={{ padding: '36px', maxWidth: 640 }}>
        {[
          {
            icon: Database,
            title: 'Base de données',
            desc: 'Connexion Supabase et état de la synchronisation',
            status: 'À configurer',
            statusColor: '#d97706',
            statusBg: '#fffbeb',
          },
          {
            icon: Shield,
            title: 'Sécurité & Accès',
            desc: 'Verrouillage de /admin via Cloudflare Access (Zero Trust)',
            status: 'Optionnel',
            statusColor: '#6B7280',
            statusBg: '#F6F5F3',
          },
          {
            icon: Bell,
            title: 'Notifications',
            desc: 'Alertes email / WhatsApp pour les nouvelles commandes',
            status: 'Bientôt',
            statusColor: '#6B7280',
            statusBg: '#F6F5F3',
          },
          {
            icon: Palette,
            title: 'Apparence',
            desc: 'Personnalisation de l\'interface admin',
            status: 'Bientôt',
            statusColor: '#6B7280',
            statusBg: '#F6F5F3',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '20px 22px',
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 10,
              transition: 'box-shadow 0.2s',
            }}
            className="hover:shadow-sm"
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: '#F6F5F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <item.icon className="w-5 h-5" style={{ color: '#374151' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0E0F10' }}>{item.title}</p>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{item.desc}</p>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: item.statusColor,
                background: item.statusBg,
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
            background: '#0E0F10',
            borderRadius: 14,
            padding: '22px 24px',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#F2F1EF',
              marginBottom: 4,
              letterSpacing: '0.02em',
            }}
          >
            Script SQL — À exécuter dans Supabase
          </p>
          <p style={{ fontSize: 12, color: '#7C8089', marginBottom: 16 }}>
            Copiez ce script dans Supabase → SQL Editor → Run
          </p>
          <pre
            style={{
              fontSize: 11,
              color: '#9CA3AF',
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
