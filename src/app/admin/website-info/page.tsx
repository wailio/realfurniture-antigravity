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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1E1912 0%, #2c2418 50%, #8b7344 100%)' }}>
      {/* Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
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
              color: '#0E0F10',
              letterSpacing: '-0.02em',
            }}
          >
            Infos du site
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            Modifiez le contenu du site sans toucher au code
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            fontSize: 12.5,
            color: '#92400e',
          }}
        >
          <Clock className="w-4 h-4" />
          Connexion Supabase requise pour sauvegarder en live
        </div>
      </div>

      <div style={{ padding: '36px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SITE_SECTIONS.map(section => {
            const isOpen = openSections.includes(section.key)
            const isSaving = saving[section.key]
            const isSaved = saved[section.key]
            const fieldKeys = section.fields.map(f => f.key)

            return (
              <div
                key={section.key}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
                className="hover:shadow-sm"
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
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#F6F5F3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <section.icon className="w-4 h-4" style={{ color: '#374151' }} />
                    </div>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#0E0F10' }}>
                      {section.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isSaved && (
                      <span
                        style={{
                          fontSize: 12,
                          color: '#059669',
                          background: '#ecfdf5',
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
                      ? <ChevronUp className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                    }
                  </div>
                </button>

                {/* Section body */}
                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 22px',
                      borderTop: '1px solid rgba(0,0,0,0.04)',
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
                              color: '#374151',
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
                                border: '1.5px solid #E5E7EB',
                                background: '#FAFAFA',
                                fontSize: 13.5,
                                color: '#0E0F10',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                lineHeight: 1.6,
                                transition: 'border-color 0.15s',
                                fontFamily: 'var(--font-body)',
                              }}
                              onFocus={e => (e.target.style.borderColor = '#0E0F10')}
                              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                                border: '1.5px solid #E5E7EB',
                                background: '#FAFAFA',
                                fontSize: 13.5,
                                color: '#0E0F10',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                                fontFamily: 'var(--font-body)',
                              }}
                              onFocus={e => (e.target.style.borderColor = '#0E0F10')}
                              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                        background: isSaved ? '#ecfdf5' : '#0E0F10',
                        color: isSaved ? '#059669' : '#F2F1EF',
                        fontSize: 13.5,
                        fontWeight: 500,
                        cursor: isSaving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: isSaving ? 0.7 : 1,
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
            background: '#F6F5F3',
            borderRadius: 12,
            fontSize: 12.5,
            color: '#6B7280',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#374151' }}>Note :</strong> Pour que les modifications soient reflétées en direct sur le site,
          Supabase doit être configuré (remplir .env.local). Tant que Supabase n&apos;est pas connecté,
          les données sont préremplies mais non sauvegardées.
        </div>
      </div>
    </div>
  )
}
