'use client'

export const runtime = 'edge'

import { useState } from 'react'
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Megaphone,
  Share2,
  Clock,
} from 'lucide-react'

interface SectionData {
  [key: string]: string
}

const SITE_SECTIONS: {
  key: string
  title: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  fields: { key: string; label: string; type?: string; placeholder?: string; rows?: number }[]
}[] = [
  {
    key: 'contact',
    title: 'Informations de contact',
    icon: Phone,
    fields: [
      { key: 'phone', label: 'Téléphone', placeholder: '0561 71 91 00' },
      { key: 'whatsapp', label: 'WhatsApp (numéro international)', placeholder: '213561719100' },
      { key: 'email', label: 'Email', placeholder: 'chateau.art01@gmail.com' },
      { key: 'address', label: 'Adresse', placeholder: 'Alger, Algérie' },
      { key: 'hours', label: 'Horaires', placeholder: '6j/7 • 9h30 – 20h00' },
    ],
  },
  {
    key: 'hero',
    title: 'Section Héro (page d\'accueil)',
    icon: Megaphone,
    fields: [
      { key: 'hero_tagline', label: 'Tagline principale', placeholder: 'Mobilier & Design d\'Exception' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', rows: 3, placeholder: 'Description courte du showroom...' },
      { key: 'hero_cta', label: 'Texte du bouton CTA', placeholder: 'Découvrir la collection' },
      { key: 'promo_bar', label: 'Texte barre promo (en haut)', placeholder: 'Livraison offerte à Alger · 6j/7 9h30–20h00' },
    ],
  },
  {
    key: 'about',
    title: 'Page À propos',
    icon: FileText,
    fields: [
      { key: 'about_tagline', label: 'Titre principal', placeholder: 'L\'Art du Mobilier d\'Exception' },
      { key: 'about_philosophie', label: 'Philosophie (paragraphe)', type: 'textarea', rows: 4, placeholder: 'Notre philosophie...' },
      { key: 'about_histoire', label: 'Notre histoire (paragraphe)', type: 'textarea', rows: 4, placeholder: 'Notre histoire...' },
    ],
  },
  {
    key: 'social',
    title: 'Réseaux sociaux',
    icon: Share2,
    fields: [
      { key: 'instagram', label: 'Instagram (handle)', placeholder: 'chateau_dart_meubles' },
      { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://www.instagram.com/chateau_dart_meubles' },
      { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://www.facebook.com/chateau.dart.alger' },
      { key: 'tiktok', label: 'TikTok (handle)', placeholder: '@chateaudart_meubles' },
      { key: 'tiktok_url', label: 'TikTok URL', placeholder: 'https://www.tiktok.com/@chateaudart_meubles' },
      { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://www.youtube.com/@chateaudart' },
    ],
  },
  {
    key: 'seo',
    title: 'SEO & Méta',
    icon: Globe,
    fields: [
      { key: 'meta_title', label: 'Titre de la page (title tag)', placeholder: 'Château d\'art | Mobilier & Design d\'Exception' },
      { key: 'meta_description', label: 'Meta description', type: 'textarea', rows: 3, placeholder: 'Maison Château d\'art : Mobilier sculptural...' },
    ],
  },
]

const CURRENT_VALUES: SectionData = {
  phone: '0561 71 91 00',
  whatsapp: '213561719100',
  email: 'chateau.art01@gmail.com',
  address: 'Alger, Algérie',
  hours: '6j/7 · 9h30 – 20h00',
  instagram: 'chateau_dart_meubles',
  instagram_url: 'https://www.instagram.com/chateau_dart_meubles',
  facebook_url: 'https://www.facebook.com/chateau.dart.alger',
  tiktok: '@chateaudart_meubles',
  tiktok_url: 'https://www.tiktok.com/@chateaudart_meubles',
  youtube_url: 'https://www.youtube.com/@chateaudart',
  meta_title: 'Château d\'art | Mobilier & Design d\'Exception',
}

export default function AdminWebsiteInfoPage() {
  const [data, setData] = useState<SectionData>(CURRENT_VALUES)
  const [openSections, setOpenSections] = useState<string[]>(['contact'])
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const toggleSection = (key: string) => {
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const saveSection = async (sectionKey: string, fields: string[]) => {
    setSaving(prev => ({ ...prev, [sectionKey]: true }))
    try {
      // Build payload for this section's fields
      const payload = Object.fromEntries(fields.map(k => [k, data[k] || '']))
      console.log('Saving section:', sectionKey, payload)

      // TODO: When Supabase is configured, this will call:
      // await fetch('/api/admin/site-config', { method: 'PUT', body: JSON.stringify(payload) })
      
      // For now, simulate save
      await new Promise(r => setTimeout(r, 700))

      setSaved(prev => ({ ...prev, [sectionKey]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [sectionKey]: false })), 2500)
    } catch {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(prev => ({ ...prev, [sectionKey]: false }))
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header — Exact #0A0B0C matching sidebar, restored original size */}
      <div
        style={{
          background: '#0A0B0C',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 300,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Infos du site
          </h1>
          <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
            Modifiez le contenu du site sans toucher au code
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 99,
            fontSize: 12.5,
            color: '#fbbf24',
          }}
        >
          <Clock className="w-4 h-4 text-[#d1aa5c]" />
          Connexion Supabase requise pour sauvegarder en live
        </div>
      </div>

      <div style={{ padding: '36px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SITE_SECTIONS.map(section => {
            const isOpen = openSections.includes(section.key)
            const isSaving = saving[section.key]
            const isSaved = saved[section.key]
            const fieldKeys = section.fields.map(f => f.key)

            return (
              <div
                key={section.key}
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 14, 28, 0.95) 0%, rgba(4, 7, 16, 0.98) 50%, rgba(2, 3, 8, 0.99) 100%)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  borderRadius: 18,
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 0 20px 0 rgba(30, 58, 138, 0.12), 0 20px 45px -12px rgba(0, 0, 0, 0.70), 0 8px 18px -4px rgba(2, 6, 23, 0.50)',
                  overflow: 'hidden',
                  transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                }}
                className="hover:shadow-2xl hover:border-[#60a5fa]/30"
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 22px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: 'rgba(209, 170, 92, 0.12)',
                        border: '1px solid rgba(209, 170, 92, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <section.icon className="w-4 h-4" style={{ color: '#d1aa5c' }} />
                    </div>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#FFFFFF' }}>
                      {section.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isSaved && (
                      <span
                        style={{
                          fontSize: 12,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 10px',
                          borderRadius: 99,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check className="w-3 h-3" /> Sauvegardé
                      </span>
                    )}
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" style={{ color: '#d1aa5c' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: '#A1A1AA' }} />
                    }
                  </div>
                </button>

                {/* Section body */}
                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 22px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: 20,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {section.fields.map(field => (
                        <div key={field.key}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: '#d1aa5c',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              marginBottom: 6,
                            }}
                          >
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={data[field.key] || ''}
                              onChange={e => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              rows={field.rows || 3}
                              style={{
                                width: '100%',
                                padding: '11px 14px',
                                borderRadius: 10,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                background: 'rgba(0, 0, 0, 0.35)',
                                fontSize: 13.5,
                                color: '#FFFFFF',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                lineHeight: 1.6,
                                transition: 'border-color 0.15s',
                                fontFamily: 'var(--font-body)',
                              }}
                              onFocus={e => (e.target.style.borderColor = '#d1aa5c')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                            />
                          ) : (
                            <input
                              type="text"
                              value={data[field.key] || ''}
                              onChange={e => setData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              style={{
                                width: '100%',
                                padding: '11px 14px',
                                borderRadius: 10,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                background: 'rgba(0, 0, 0, 0.35)',
                                fontSize: 13.5,
                                color: '#FFFFFF',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                                fontFamily: 'var(--font-body)',
                              }}
                              onFocus={e => (e.target.style.borderColor = '#d1aa5c')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => saveSection(section.key, fieldKeys)}
                      disabled={isSaving}
                      style={{
                        marginTop: 20,
                        padding: '11px 24px',
                        borderRadius: 10,
                        border: 'none',
                        background: isSaved ? 'rgba(16, 185, 129, 0.2)' : '#d1aa5c',
                        color: isSaved ? '#34d399' : '#14120f',
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: isSaving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: isSaving ? 0.7 : 1,
                        boxShadow: isSaved ? 'none' : '0 4px 14px rgba(209, 170, 92, 0.25)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isSaved
                        ? <><Check className="w-4 h-4" /> Sauvegardé</>
                        : isSaving
                          ? <><Save className="w-4 h-4 animate-pulse" /> Sauvegarde...</>
                          : <><Save className="w-4 h-4" /> Sauvegarder cette section</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Note */}
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'linear-gradient(145deg, rgba(8, 14, 28, 0.95) 0%, rgba(4, 7, 16, 0.98) 50%, rgba(2, 3, 8, 0.99) 100%)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: 14,
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 0 20px 0 rgba(30, 58, 138, 0.12), 0 20px 45px -12px rgba(0, 0, 0, 0.70), 0 8px 18px -4px rgba(2, 6, 23, 0.50)',
            fontSize: 12.5,
            color: '#A1A1AA',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#d1aa5c' }}>Note :</strong> Pour que les modifications soient reflétées en direct sur le site,
          Supabase doit être configuré (remplir .env.local). Tant que Supabase n&apos;est pas connecté,
          les données sont préremplies mais non sauvegardées.
        </div>
      </div>
    </div>
  )
}
