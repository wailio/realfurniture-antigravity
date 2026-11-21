'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'
import {
  Home, Phone, Info, Share2, LayoutTemplate, Search,
  ChevronRight, Save, Upload, Image as ImageIcon,
  Loader2, RefreshCw, ExternalLink, X, Check, Sparkles,
} from 'lucide-react'
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config'

// ─── Field & Section Definitions ─────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'url'

interface Field {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  hint?: string
}

interface ImageField {
  key: string
  label: string
  hint?: string
}

interface Section {
  key: string
  label: string
  fields: Field[]
  imageFields?: ImageField[]
}

interface SitePage {
  key: string
  label: string
  icon: React.ElementType
  color: string
  sections: Section[]
}

const SITE_PAGES: SitePage[] = [
  {
    key: 'home',
    label: 'Accueil',
    icon: Home,
    color: '#059669',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'hero_eyebrow', label: 'Texte d\'accroche (eyebrow)', type: 'text', placeholder: "M&F MEUBLES · MAISON DE DESIGN", hint: 'Petit texte en majuscules au-dessus du titre' },
          { key: 'hero_subheading', label: 'Intro du titre', type: 'text', placeholder: "L'art du confort pour" },
          { key: 'hero_heading', label: 'Titre principal (grand)', type: 'text', placeholder: "espaces d'exception" },
          { key: 'hero_subtitle', label: 'Sous-titre / description', type: 'textarea', placeholder: 'Matières nobles, proportions sculpturales...' },
          { key: 'hero_cta', label: 'Texte du bouton CTA', type: 'text', placeholder: 'Nous contacter' },
        ],
        imageFields: [
          { key: 'hero_image_1', label: 'Image Hero 1', hint: 'Remplace la vidéo si renseignée (format paysage recommandé)' },
          { key: 'hero_image_2', label: 'Image Hero 2', hint: 'Image alternative pour le cycle automatique' },
        ],
      },
      {
        key: 'promo',
        label: 'Barre Promotionnelle',
        fields: [
          { key: 'promo_bar', label: 'Texte de la barre promo', type: 'textarea', placeholder: 'Livraison + montage dans les 58 wilayas · Gratuit sur Alger...', hint: 'Texte défilant en haut du site. Séparer les éléments avec ·' },
        ],
      },
      {
        key: 'avis',
        label: 'Avis Clients',
        fields: [
          { key: 'review_1_name', label: 'Avis 1 — Nom & Ville', type: 'text', placeholder: 'Dr. Amina K., Alger' },
          { key: 'review_1_text', label: 'Avis 1 — Commentaire', type: 'textarea' },
          { key: 'review_2_name', label: 'Avis 2 — Nom & Ville', type: 'text' },
          { key: 'review_2_text', label: 'Avis 2 — Commentaire', type: 'textarea' },
          { key: 'review_3_name', label: 'Avis 3 — Nom & Ville', type: 'text' },
          { key: 'review_3_text', label: 'Avis 3 — Commentaire', type: 'textarea' },
          { key: 'review_4_name', label: 'Avis 4 — Nom & Ville', type: 'text' },
          { key: 'review_4_text', label: 'Avis 4 — Commentaire', type: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    icon: Phone,
    color: '#2563EB',
    sections: [
      {
        key: 'coordonnees',
        label: 'Coordonnées',
        fields: [
          { key: 'phone', label: 'Téléphone affiché', type: 'text', placeholder: '0561 71 91 00', hint: 'Affiché dans l\'en-tête et la page contact' },
          { key: 'whatsapp', label: 'Numéro WhatsApp', type: 'text', placeholder: '213561719100', hint: 'Sans + ni espaces (ex: 213561719100)' },
          { key: 'email', label: 'Adresse email', type: 'text', placeholder: 'contact@exemple.com' },
        ],
      },
      {
        key: 'localisation',
        label: 'Adresse & Horaires',
        fields: [
          { key: 'address', label: 'Adresse complète', type: 'text', placeholder: 'Alger, Algérie' },
          { key: 'hours', label: 'Horaires d\'ouverture', type: 'text', placeholder: '6j/7 · 9h30 – 20h00' },
          { key: 'maps_embed_url', label: 'URL Google Maps (embed)', type: 'url', placeholder: 'https://www.google.com/maps/embed?...', hint: 'Google Maps → Partager → Intégrer → Copier l\'URL src' },
        ],
      },
    ],
  },
  {
    key: 'about',
    label: 'À Propos',
    icon: Info,
    color: '#D97706',
    sections: [
      {
        key: 'textes',
        label: 'Textes principaux',
        fields: [
          { key: 'about_tagline', label: 'Tagline', type: 'text', placeholder: "L'Art du Mobilier d'Exception" },
          { key: 'about_philosophie', label: 'Philosophie', type: 'textarea' },
          { key: 'about_histoire', label: 'Notre histoire — §1', type: 'textarea' },
          { key: 'about_histoire_2', label: 'Notre histoire — §2', type: 'textarea' },
          { key: 'about_histoire_3', label: 'Notre histoire — §3', type: 'textarea' },
        ],
        imageFields: [
          { key: 'about_image', label: 'Photo de la page À propos', hint: 'Photo de l\'atelier ou showroom (format paysage)' },
        ],
      },
      {
        key: 'valeurs',
        label: 'Valeurs fondamentales',
        fields: [
          { key: 'valeur_1_title', label: 'Valeur 1 — Titre', type: 'text', placeholder: 'Excellence' },
          { key: 'valeur_1_text', label: 'Valeur 1 — Description', type: 'textarea' },
          { key: 'valeur_2_title', label: 'Valeur 2 — Titre', type: 'text', placeholder: 'Authenticité' },
          { key: 'valeur_2_text', label: 'Valeur 2 — Description', type: 'textarea' },
          { key: 'valeur_3_title', label: 'Valeur 3 — Titre', type: 'text', placeholder: 'Service Client' },
          { key: 'valeur_3_text', label: 'Valeur 3 — Description', type: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'social',
    label: 'Réseaux sociaux',
    icon: Share2,
    color: '#7C3AED',
    sections: [
      {
        key: 'liens',
        label: 'Liens & Handles',
        fields: [
          { key: 'instagram', label: 'Instagram — Handle', type: 'text', placeholder: 'mfmeubles', hint: 'Sans @, juste le nom d\'utilisateur' },
          { key: 'instagram_url', label: 'Instagram — URL', type: 'url', placeholder: 'https://www.instagram.com/mfmeubles/' },
          { key: 'facebook_url', label: 'Facebook — URL', type: 'url', placeholder: 'https://www.facebook.com/profile.php?id=100063579698712&locale=fr_FR' },
          { key: 'tiktok', label: 'TikTok — Handle', type: 'text', placeholder: '@mfmeubleskouba' },
          { key: 'tiktok_url', label: 'TikTok — URL', type: 'url', placeholder: 'https://www.tiktok.com/@mfmeubleskouba' },
          { key: 'youtube_url', label: 'Lien Google Reviews / Maps', type: 'url', placeholder: 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA' },
        ],
      },
    ],
  },
  {
    key: 'footer',
    label: 'Pied de page',
    icon: LayoutTemplate,
    color: '#DC2626',
    sections: [
      {
        key: 'textes',
        label: 'Textes du footer',
        fields: [
          { key: 'footer_tagline', label: 'Tagline', type: 'text', placeholder: "Mobilier d'exception pour intérieurs modernes" },
          { key: 'footer_brand_desc', label: 'Description marque', type: 'textarea', placeholder: "M&F Meubles : votre partenaire en mobilier haut de gamme à Kouba, Alger." },
          { key: 'newsletter_title', label: 'Newsletter — Titre', type: 'text', placeholder: 'Nouveautés | Arrivages' },
          { key: 'newsletter_subtitle', label: 'Newsletter — Sous-titre', type: 'text', placeholder: 'Recevez nos nouvelles collections en avant-première' },
        ],
        imageFields: [
          { key: 'logo_url', label: 'Logo principal', hint: 'URL ou chemin vers l\'image du logo' },
        ],
      },
    ],
  },
  {
    key: 'seo',
    label: 'SEO & Meta',
    icon: Search,
    color: '#0284C7',
    sections: [
      {
        key: 'balises',
        label: 'Balises et métadonnées',
        fields: [
          { key: 'meta_title', label: 'Meta Title', type: 'text', placeholder: "M&F Meubles | Mobilier & Design d'Exception · Kouba, Alger", hint: 'Idéalement 50–60 caractères' },
          { key: 'meta_description', label: 'Meta Description', type: 'textarea', hint: 'Idéalement 150–160 caractères. Apparaît dans Google.' },
        ],
        imageFields: [
          { key: 'og_image', label: 'Image OG (Open Graph)', hint: 'Apparaît lors du partage sur les réseaux (1200×630 px)' },
        ],
      },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminWebsiteInfoPage() {
  const { isDark } = useAdminTheme()
  const [data, setData] = useState<Record<string, string>>({ ...DEFAULT_SITE_CONFIG })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [activePage, setActivePage] = useState('contact')
  const [activeSection, setActiveSection] = useState('coordonnees')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [contentKey, setContentKey] = useState(0)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadFieldRef = useRef<string | null>(null)

  // Show left sidebar for 2 seconds on initial mobile visit, then auto-fades away
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNavOpen(true)
      const timer = setTimeout(() => {
        setMobileNavOpen(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // ─── Load config ─────────────────────────────────────────────────────────
  const loadConfig = useCallback(async () => {
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('chateau_site_config') : null
      if (cached) {
        setData(prev => ({ ...prev, ...JSON.parse(cached) }))
      }
    } catch {}

    try {
      const res = await fetch('/api/admin/site-config?t=' + Date.now(), { cache: 'no-store' })
      if (res.ok) {
        const cfg = await res.json()
        const merged = { ...DEFAULT_SITE_CONFIG, ...cfg }
        setData(merged)
        try {
          localStorage.setItem('chateau_site_config', JSON.stringify(merged))
        } catch {}
      }
    } catch {
      // use defaults
    }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  // ─── Save (always saves FULL config) ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    const sectionId = `${activePage}:${activeSection}`
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur de sauvegarde')

      if (json.config) {
        setData(prev => ({ ...prev, ...json.config }))
        try {
          localStorage.setItem('chateau_site_config', JSON.stringify(json.config))
        } catch {}
      }

      setSavedSection(sectionId)
      setTimeout(() => setSavedSection(prev => prev === sectionId ? null : prev), 3500)
      showIosToast('Modifications enregistrées et publiées en direct ✓', 'success')
    } catch (err: any) {
      showIosToast(err.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const fieldKey = uploadFieldRef.current
    if (!file || !fieldKey) return
    e.target.value = ''

    setUploadingKey(fieldKey)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Échec du téléversement')
      const json = await res.json()
      const url = json.url || json.publicUrl || json.path || ''
      setData(prev => ({ ...prev, [fieldKey]: url }))
      showIosToast('Image téléversée avec succès ✓', 'success')
    } catch (err: any) {
      showIosToast(err.message || 'Erreur de téléversement', 'error')
    } finally {
      setUploadingKey(null)
      uploadFieldRef.current = null
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────────
  const navigate = (pageKey: string, sectionKey: string) => {
    setActivePage(pageKey)
    setActiveSection(sectionKey)
    setContentKey(k => k + 1)
    setMobileNavOpen(false)
  }

  const currentPage = SITE_PAGES.find(p => p.key === activePage)
  const currentSection = currentPage?.sections.find(s => s.key === activeSection)
  const sectionId = `${activePage}:${activeSection}`

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: 'transparent', transition: 'background 0.3s ease, color 0.3s ease' }}
    >
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-xs md:hidden transition-opacity duration-300"
          style={{ background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.4)' }}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <div
        className={`flex flex-col shrink-0 overflow-hidden fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 transition-transform duration-300 ease-out shadow-xl md:shadow-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          width: 280,
          background: isDark ? '#1C1C1E' : '#FAFAFB',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Sidebar header */}
        <div
          className="shrink-0"
          style={{
            padding: '18px 18px 14px',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
            transition: 'border-color 0.3s ease',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: isDark ? 'rgba(235,235,245,0.4)' : '#64748B',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                  transition: 'color 0.3s ease',
                }}
              >
                CMS M&amp;F Meubles
              </p>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  transition: 'color 0.3s ease',
                }}
              >
                Infos du site
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadConfig}
                disabled={loading}
                title="Actualiser depuis le serveur"
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <RefreshCw
                  className={loading ? 'animate-spin' : ''}
                  style={{ width: 13, height: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}
                />
              </button>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="md:hidden"
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live badge */}
          <a
            href="https://realfurniture-antigravity.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 8,
              background: isDark ? 'rgba(48,209,88,0.15)' : '#ECFDF5',
              border: isDark ? '1px solid rgba(48,209,88,0.3)' : '1px solid #A7F3D0',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', flexShrink: 0 }} className="animate-pulse" />
            <span style={{ fontSize: 11, color: isDark ? '#30D158' : '#047857', fontWeight: 600 }}>Site en ligne</span>
            <ExternalLink style={{ width: 10, height: 10, color: isDark ? '#30D158' : '#047857' }} />
          </a>
        </div>

        {/* Pages list */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '10px 0' }}>
          {SITE_PAGES.map((page) => {
            const PageIcon = page.icon
            const isActive = activePage === page.key

            return (
              <div key={page.key} className="mb-1">
                {/* Page button */}
                <button
                  onClick={() => {
                    const first = page.sections[0]
                    if (first) navigate(page.key, first.key)
                  }}
                  style={{
                    width: 'calc(100% - 16px)',
                    margin: '3px 8px',
                    padding: '8px 12px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: isActive
                      ? (isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF')
                      : 'transparent',
                    border: isActive
                      ? (isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0')
                      : '1px solid transparent',
                    boxShadow: isActive && !isDark ? '0 1px 3px rgba(15,23,42,0.04), 0 2px 6px rgba(15,23,42,0.02)' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    style={{
                      width: 26, height: 26,
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      background: isActive
                        ? (isDark ? 'rgba(255,255,255,0.15)' : '#0F172A')
                        : (isDark ? '#2C2C2E' : '#F1F5F9'),
                      border: isActive
                        ? (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #0F172A')
                        : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <PageIcon
                      style={{
                        width: 13, height: 13,
                        color: isActive ? '#FFFFFF' : (isDark ? 'rgba(235,235,245,0.6)' : '#475569'),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? 'rgba(235,235,245,0.6)' : '#475569'),
                      flex: 1,
                      textAlign: 'left',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {page.label}
                  </span>
                  <ChevronRight
                    style={{
                      width: 12, height: 12,
                      color: isActive ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8'),
                      transform: isActive ? 'rotate(90deg)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </button>

                {/* Sections — animated expand */}
                <div
                  style={{
                    maxHeight: isActive ? `${page.sections.length * 44}px` : '0px',
                    opacity: isActive ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease',
                  }}
                >
                  {page.sections.map((section) => {
                    const isSectionActive = isActive && activeSection === section.key
                    const wasSaved = savedSection === `${page.key}:${section.key}`
                    return (
                      <button
                        key={section.key}
                        onClick={() => navigate(page.key, section.key)}
                        style={{
                          width: 'calc(100% - 24px)',
                          margin: '2px 12px 2px 28px',
                          padding: '6px 10px 6px 12px',
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          background: isSectionActive
                            ? (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0')
                            : 'transparent',
                          border: '1px solid transparent',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          if (!isSectionActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'
                        }}
                        onMouseLeave={e => {
                          if (!isSectionActive) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <span
                          style={{
                            width: 6, height: 6,
                            borderRadius: 99,
                            flexShrink: 0,
                            background: isSectionActive
                              ? (isDark ? '#FFFFFF' : '#0F172A')
                              : (isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'),
                            transition: 'all 0.15s ease',
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: isSectionActive
                              ? (isDark ? '#FFFFFF' : '#0F172A')
                              : (isDark ? 'rgba(235,235,245,0.6)' : '#64748B'),
                            fontWeight: isSectionActive ? 700 : 500,
                            flex: 1,
                            textAlign: 'left',
                            transition: 'color 0.15s ease',
                          }}
                        >
                          {section.label}
                        </span>
                        {wasSaved && (
                          <Check style={{ width: 12, height: 12, color: '#30D158' }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div
          className="shrink-0 text-center"
          style={{
            padding: '10px 14px',
            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
            transition: 'border-color 0.3s ease',
          }}
        >
          <p style={{ fontSize: 9.5, color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>
            Synchronisation Cloudflare &amp; Supabase
          </p>
        </div>
      </div>

      {/* ══════════ RIGHT CONTENT ══════════ */}
      <div className="flex-1 overflow-y-auto w-full" style={{ background: 'transparent' }}>
        {/* Mobile Top Bar */}
        <div
          className="md:hidden flex items-center justify-between p-3 sticky top-0 z-30 gap-2"
          style={{
            background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 12,
              background: isDark ? '#2C2C2E' : '#F1F5F9',
              color: isDark ? '#FFFFFF' : '#0F172A',
              fontSize: 12,
              fontWeight: 600,
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
              cursor: 'pointer',
              overflow: 'hidden',
              minWidth: 0,
              transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <LayoutTemplate style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentPage?.label} · {currentSection?.label}
            </span>
            <ChevronRight style={{ width: 14, height: 14, flexShrink: 0, color: isDark ? 'rgba(235,235,245,0.4)' : '#64748B' }} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              background: isDark ? '#FFFFFF' : '#0F172A',
              color: isDark ? '#000000' : '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              border: 'none',
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: isDark ? '0 2px 8px rgba(255,255,255,0.1)' : '0 2px 6px rgba(15,23,42,0.12)',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
          >
            {saving ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Save style={{ width: 12, height: 12 }} />}
            <span>Sauvegarder</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
            <Loader2
              className="w-7 h-7 animate-spin"
              style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#0F172A' }}
            />
            <p style={{ fontSize: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>
              Chargement de la configuration...
            </p>
          </div>
        ) : !currentSection ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
            <Sparkles style={{ width: 28, height: 28, color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }} />
            <p style={{ fontSize: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }}>
              Sélectionnez une section
            </p>
          </div>
        ) : (
          <div
            key={contentKey}
            className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto"
            style={{ animation: 'wInfoFadeUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both' }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-4">
              <span style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 500 }}>
                {currentPage?.label}
              </span>
              <ChevronRight style={{ width: 11, height: 11, color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }} />
              <span style={{ fontSize: 12, color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 600 }}>
                {currentSection.label}
              </span>
            </div>

            {/* Section title + top save */}
            <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    marginBottom: 4,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {currentSection.label}
                </h1>
                <p style={{ fontSize: 12.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', margin: 0, transition: 'color 0.3s ease' }}>
                  Page{' '}
                  <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    {currentPage?.label}
                  </strong>{' '}
                  · Les modifications sont enregistrées dans Supabase et propagées sur le site en direct.
                </p>
              </div>
              <SaveButton
                saving={saving}
                saved={savedSection === sectionId}
                onSave={handleSave}
                isDark={isDark}
              />
            </div>

            {/* Split layout: fields LEFT, images RIGHT */}
            <div
              className={`grid gap-6 ${(currentSection.imageFields?.length ?? 0) > 0 ? 'grid-cols-1 lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}
            >
              {/* TEXT FIELDS Card */}
              <div
                style={{
                  background: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderRadius: 20,
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                  padding: '24px 28px',
                  boxShadow: isDark
                    ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'
                    : '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              >
                {currentSection.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={data[field.key] ?? ''}
                    onChange={(val) => setData(prev => ({ ...prev, [field.key]: val }))}
                    isDark={isDark}
                  />
                ))}

                {/* Bottom save for longer sections */}
                {currentSection.fields.length > 3 && (
                  <div className="pt-2 flex justify-end">
                    <SaveButton
                      saving={saving}
                      saved={savedSection === sectionId}
                      onSave={handleSave}
                      compact
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>

              {/* IMAGE FIELDS Card */}
              {(currentSection.imageFields?.length ?? 0) > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentSection.imageFields!.map((imgField) => (
                    <div
                      key={imgField.key}
                      style={{
                        background: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderRadius: 20,
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                        padding: '20px',
                        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,23,42,0.03)',
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: 10,
                          margin: 0,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {imgField.label}
                      </p>

                      {/* Preview or placeholder */}
                      {data[imgField.key] ? (
                        <div
                          className="relative rounded-xl overflow-hidden mb-3 group/img"
                          style={{
                            aspectRatio: '16/10',
                            background: isDark ? '#2C2C2E' : '#F8FAFC',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                            marginTop: 10,
                          }}
                        >
                          <img
                            src={data[imgField.key]}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                          />
                          <button
                            onClick={() => setData(prev => ({ ...prev, [imgField.key]: '' }))}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:bg-red-600 cursor-pointer"
                            style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
                            title="Supprimer l'image"
                          >
                            <X style={{ width: 13, height: 13, color: '#fff' }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            uploadFieldRef.current = imgField.key
                            fileInputRef.current?.click()
                          }}
                          style={{
                            width: '100%',
                            aspectRatio: '16/10',
                            border: isDark ? '1.5px dashed rgba(255,255,255,0.15)' : '1.5px dashed #CBD5E1',
                            background: isDark ? '#2C2C2E' : '#F8FAFC',
                            borderRadius: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            marginTop: 10,
                            marginBottom: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : '#0F172A'
                            e.currentTarget.style.background = isDark ? '#3A3A3C' : '#F0F4F8'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1'
                            e.currentTarget.style.background = isDark ? '#2C2C2E' : '#F8FAFC'
                          }}
                        >
                          {uploadingKey === imgField.key ? (
                            <Loader2
                              className="w-5 h-5 animate-spin"
                              style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                            />
                          ) : (
                            <>
                              <ImageIcon style={{ width: 24, height: 24, color: isDark ? 'rgba(235,235,245,0.4)' : '#94A3B8' }} />
                              <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 500, margin: 0 }}>
                                Cliquer pour téléverser
                              </p>
                            </>
                          )}
                        </button>
                      )}

                      {/* URL input */}
                      <input
                        type="text"
                        value={data[imgField.key] ?? ''}
                        onChange={e => setData(prev => ({ ...prev, [imgField.key]: e.target.value }))}
                        placeholder="Ou coller une URL d'image..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: isDark ? '#2C2C2E' : '#F8FAFC',
                          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontSize: 12,
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          marginBottom: 10,
                          transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          uploadFieldRef.current = imgField.key
                          fileInputRef.current?.click()
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '9px 12px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          color: isDark ? '#000000' : '#FFFFFF',
                          background: isDark ? '#FFFFFF' : '#0F172A',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: isDark ? '0 2px 6px rgba(255,255,255,0.1)' : '0 2px 6px rgba(15,23,42,0.12)',
                          transition: 'background 0.3s ease, color 0.3s ease',
                        }}
                      >
                        <Upload style={{ width: 13, height: 13 }} />
                        Téléverser depuis l&apos;appareil
                      </button>

                      {imgField.hint && (
                        <p style={{ fontSize: 10.5, color: isDark ? 'rgba(235,235,245,0.4)' : '#64748B', marginTop: 8, lineHeight: 1.4, margin: '8px 0 0 0', transition: 'color 0.3s ease' }}>
                          {imgField.hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <style>{`
        @keyframes wInfoFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Save Button Hover */
        .ios-save-btn {
          transition: all 0.15s ease;
        }
        .ios-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .ios-save-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        /* Dark mode: native input / textarea overrides */
        [data-admin-theme="dark"] input,
        [data-admin-theme="dark"] textarea,
        [data-admin-theme="dark"] select {
          color: #FFFFFF;
          background: #2C2C2E;
        }
        [data-admin-theme="dark"] input::placeholder,
        [data-admin-theme="dark"] textarea::placeholder {
          color: rgba(235,235,245,0.3);
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldRow({
  field,
  value,
  onChange,
  isDark,
}: {
  field: { key: string; label: string; type: string; placeholder?: string; hint?: string }
  value: string
  onChange: (v: string) => void
  isDark: boolean
}) {
  const [isFocused, setIsFocused] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: isFocused
      ? (isDark ? '#3A3A3C' : '#FFFFFF')
      : (isDark ? '#2C2C2E' : '#F8FAFC'),
    border: isFocused
      ? (isDark ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid #0F172A')
      : (isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0'),
    borderRadius: 12,
    color: isDark ? '#FFFFFF' : '#0F172A',
    fontSize: 13.5,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    boxShadow: isFocused
      ? (isDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(15,23,42,0.08)')
      : 'none',
    transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, color 0.3s ease',
  }

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: isFocused
            ? (isDark ? '#FFFFFF' : '#0F172A')
            : (isDark ? 'rgba(235,235,245,0.6)' : '#334155'),
          marginBottom: 6,
          transition: 'color 0.15s ease',
        }}
      >
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      ) : (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}

      {field.hint && (
        <p style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.4)' : '#64748B', marginTop: 4, lineHeight: 1.4, margin: '4px 0 0 0', transition: 'color 0.3s ease' }}>
          {field.hint}
        </p>
      )}
    </div>
  )
}

function SaveButton({
  saving,
  saved,
  onSave,
  compact = false,
  isDark,
}: {
  saving: boolean
  saved: boolean
  onSave: () => void
  compact?: boolean
  isDark: boolean
}) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="ios-save-btn flex items-center gap-2 rounded-xl font-semibold shrink-0 cursor-pointer"
      style={{
        padding: compact ? '7px 16px' : '9px 20px',
        fontSize: compact ? 12 : 13,
        background: saved ? '#30D158' : (isDark ? '#FFFFFF' : '#0F172A'),
        color: saved ? '#FFFFFF' : (isDark ? '#000000' : '#FFFFFF'),
        border: 'none',
        opacity: saving ? 0.7 : 1,
        letterSpacing: '-0.01em',
        boxShadow: isDark
          ? '0 2px 6px rgba(255,255,255,0.1)'
          : '0 2px 6px rgba(15,23,42,0.12)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {saving ? (
        <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
      ) : saved ? (
        <Check style={{ width: 14, height: 14 }} />
      ) : (
        <Save style={{ width: 14, height: 14 }} />
      )}
      {saving ? 'Sauvegarde...' : saved ? 'Synchronisé ✓' : 'Sauvegarder'}
    </button>
  )
}
