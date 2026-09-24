'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast } from '@/components/ui/ios-dialog'
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
    color: '#30D158',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'hero_eyebrow', label: 'Texte d\'accroche (eyebrow)', type: 'text', placeholder: "CHÂTEAU D'ART · MAISON DE DESIGN", hint: 'Petit texte en majuscules au-dessus du titre' },
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
    color: '#0A84FF',
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
    color: '#FF9F0A',
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
    color: '#BF5AF2',
    sections: [
      {
        key: 'liens',
        label: 'Liens & Handles',
        fields: [
          { key: 'instagram', label: 'Instagram — Handle', type: 'text', placeholder: 'chateau_dart_meubles', hint: 'Sans @, juste le nom d\'utilisateur' },
          { key: 'instagram_url', label: 'Instagram — URL', type: 'url', placeholder: 'https://www.instagram.com/...' },
          { key: 'facebook_url', label: 'Facebook — URL', type: 'url', placeholder: 'https://www.facebook.com/...' },
          { key: 'tiktok', label: 'TikTok — Handle', type: 'text', placeholder: '@chateaudart_meubles' },
          { key: 'tiktok_url', label: 'TikTok — URL', type: 'url', placeholder: 'https://www.tiktok.com/...' },
          { key: 'youtube_url', label: 'YouTube — URL', type: 'url', placeholder: 'https://www.youtube.com/...' },
        ],
      },
    ],
  },
  {
    key: 'footer',
    label: 'Pied de page',
    icon: LayoutTemplate,
    color: '#FF6B6B',
    sections: [
      {
        key: 'textes',
        label: 'Textes du footer',
        fields: [
          { key: 'footer_tagline', label: 'Tagline', type: 'text', placeholder: "Mobilier d'exception pour intérieurs modernes" },
          { key: 'footer_brand_desc', label: 'Description marque', type: 'textarea', placeholder: "Maison Château d'art : votre partenaire en mobilier haut de gamme." },
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
    color: '#64D2FF',
    sections: [
      {
        key: 'balises',
        label: 'Balises et métadonnées',
        fields: [
          { key: 'meta_title', label: 'Meta Title', type: 'text', placeholder: "Château d'art | Mobilier & Design d'Exception", hint: 'Idéalement 50–60 caractères' },
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
  const [data, setData] = useState<Record<string, string>>({ ...DEFAULT_SITE_CONFIG })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [activePage, setActivePage] = useState('contact')
  const [activeSection, setActiveSection] = useState('coordonnees')
  const [contentKey, setContentKey] = useState(0)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadFieldRef = useRef<string | null>(null)

  // ─── Load config ─────────────────────────────────────────────────────────
  const loadConfig = useCallback(async () => {
    // 1. Instant local cache for seamless refresh without flicker
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('chateau_site_config') : null
      if (cached) {
        setData(prev => ({ ...prev, ...JSON.parse(cached) }))
      }
    } catch {}

    setLoading(true)
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
    } finally {
      setLoading(false)
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
      showIosToast('Modifications sauvegardées et synchronisées en direct ✓', 'success')
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
      showIosToast('Image téléversée ✓', 'success')
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
  }

  const currentPage = SITE_PAGES.find(p => p.key === activePage)
  const currentSection = currentPage?.sections.find(s => s.key === activeSection)
  const sectionId = `${activePage}:${activeSection}`

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}
    >
      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{
          width: 264,
          background: 'rgba(9, 10, 13, 0.98)',
          borderRight: '0.5px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Sidebar header */}
        <div
          className="shrink-0"
          style={{ padding: '20px 16px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: '#3D4048',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                CMS du site
              </p>
              <h2
                style={{ fontSize: 17, fontWeight: 700, color: '#F2F1EF', letterSpacing: '-0.025em' }}
              >
                Infos du site
              </h2>
            </div>
            <button
              onClick={loadConfig}
              disabled={loading}
              title="Actualiser depuis le serveur"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw
                className={loading ? 'animate-spin' : ''}
                style={{ width: 13, height: 13, color: '#4A4D55' }}
              />
            </button>
          </div>

          {/* Live badge */}
          <a
            href="https://realfurniture-antigravity.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] flex-shrink-0 animate-pulse" />
            <span style={{ fontSize: 11, color: '#30D158', fontWeight: 500 }}>Site en ligne</span>
            <ExternalLink style={{ width: 9, height: 9, color: '#30D158' }} />
          </a>
        </div>

        {/* Pages list */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0' }}>
          {SITE_PAGES.map((page) => {
            const PageIcon = page.icon
            const isActive = activePage === page.key

            return (
              <div key={page.key}>
                {/* Page button */}
                <button
                  onClick={() => {
                    const first = page.sections[0]
                    if (first) navigate(page.key, first.key)
                  }}
                  className="w-full flex items-center gap-2.5 transition-all"
                  style={{
                    padding: '8px 14px',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderLeft: `2px solid ${isActive ? page.color : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? `${page.color}22` : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <PageIcon
                      style={{ width: 13, height: 13, color: isActive ? page.color : '#4A4D55' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#F2F1EF' : '#5A5D65',
                      flex: 1,
                      textAlign: 'left',
                    }}
                  >
                    {page.label}
                  </span>
                  <ChevronRight
                    style={{
                      width: 12,
                      height: 12,
                      color: isActive ? '#5A5D65' : '#2A2D35',
                      transform: isActive ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                  />
                </button>

                {/* Sections — animated expand */}
                <div
                  style={{
                    maxHeight: isActive ? `${page.sections.length * 44}px` : '0px',
                    opacity: isActive ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.38s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
                  }}
                >
                  {page.sections.map((section) => {
                    const isSectionActive = isActive && activeSection === section.key
                    const wasSaved = savedSection === `${page.key}:${section.key}`
                    return (
                      <button
                        key={section.key}
                        onClick={() => navigate(page.key, section.key)}
                        className="w-full flex items-center gap-2 transition-all"
                        style={{
                          padding: '9px 14px 9px 38px',
                          background: isSectionActive ? `${page.color}14` : 'transparent',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: isSectionActive ? page.color : '#2A2D35' }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: isSectionActive ? page.color : '#4A4D55',
                            fontWeight: isSectionActive ? 500 : 400,
                            flex: 1,
                            textAlign: 'left',
                          }}
                        >
                          {section.label}
                        </span>
                        {wasSaved && (
                          <Check style={{ width: 10, height: 10, color: '#30D158' }} />
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
          style={{ padding: '10px 14px', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}
        >
          <p style={{ fontSize: 9, color: '#2A2D35', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Modifications en direct sur le site
          </p>
        </div>
      </div>

      {/* ══════════ RIGHT CONTENT ══════════ */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#0A84FF' }} />
            <p style={{ fontSize: 13, color: '#4A4D55' }}>Chargement de la configuration...</p>
          </div>
        ) : !currentSection ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Sparkles style={{ width: 28, height: 28, color: '#2A2D35' }} />
            <p style={{ fontSize: 13, color: '#3A3D45' }}>Sélectionnez une section</p>
          </div>
        ) : (
          <div
            key={contentKey}
            className="p-7 md:p-10"
            style={{ animation: 'wInfoFadeUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both' }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-5">
              <span style={{ fontSize: 12, color: '#3A3D45' }}>{currentPage?.label}</span>
              <ChevronRight style={{ width: 11, height: 11, color: '#2A2D35' }} />
              <span style={{ fontSize: 12, color: '#5A5D65' }}>{currentSection.label}</span>
            </div>

            {/* Section title + top save */}
            <div className="flex items-start justify-between gap-4 mb-7">
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#F2F1EF',
                    letterSpacing: '-0.025em',
                    marginBottom: 4,
                  }}
                >
                  {currentSection.label}
                </h1>
                <p style={{ fontSize: 12, color: '#4A4D55' }}>
                  Page{' '}
                  <span style={{ color: currentPage?.color }}>
                    {currentPage?.label}
                  </span>{' '}
                  · Les modifications sont enregistrées dans Supabase et propagées sur le site en direct.
                </p>
              </div>
              <SaveButton
                saving={saving}
                saved={savedSection === sectionId}
                onSave={handleSave}
              />
            </div>

            {/* Split layout: fields LEFT, images RIGHT */}
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: (currentSection.imageFields?.length ?? 0) > 0
                  ? '1fr 320px'
                  : '1fr',
              }}
            >
              {/* TEXT FIELDS */}
              <div
                className="rounded-2xl p-6 space-y-5"
                style={{
                  background: 'rgba(14, 15, 18, 0.85)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                }}
              >
                {currentSection.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={data[field.key] ?? ''}
                    onChange={(val) => setData(prev => ({ ...prev, [field.key]: val }))}
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
                    />
                  </div>
                )}
              </div>

              {/* IMAGE FIELDS */}
              {(currentSection.imageFields?.length ?? 0) > 0 && (
                <div className="space-y-4">
                  {currentSection.imageFields!.map((imgField) => (
                    <div
                      key={imgField.key}
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(14, 15, 18, 0.85)',
                        border: '0.5px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#6E7077',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          marginBottom: 10,
                        }}
                      >
                        {imgField.label}
                      </p>

                      {/* Preview or placeholder */}
                      {data[imgField.key] ? (
                        <div
                          className="relative rounded-xl overflow-hidden mb-3"
                          style={{ aspectRatio: '16/10', background: '#0A0B0D' }}
                        >
                          <img
                            src={data[imgField.key]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setData(prev => ({ ...prev, [imgField.key]: '' }))}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
                          >
                            <X style={{ width: 12, height: 12, color: '#fff' }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            uploadFieldRef.current = imgField.key
                            fileInputRef.current?.click()
                          }}
                          className="w-full rounded-xl flex flex-col items-center justify-center gap-1.5 mb-3 transition-all hover:bg-white/5"
                          style={{
                            aspectRatio: '16/10',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.02)',
                          }}
                        >
                          {uploadingKey === imgField.key ? (
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0A84FF' }} />
                          ) : (
                            <>
                              <ImageIcon style={{ width: 20, height: 20, color: '#3A3D45' }} />
                              <p style={{ fontSize: 11, color: '#3A3D45' }}>Cliquer pour téléverser</p>
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
                          padding: '7px 11px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 9,
                          color: '#7C8089',
                          fontSize: 11,
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          marginBottom: 8,
                          display: 'block',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(10,132,255,0.4)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />

                      <button
                        onClick={() => {
                          uploadFieldRef.current = imgField.key
                          fileInputRef.current?.click()
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all"
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: '#0A84FF',
                          background: 'rgba(10,132,255,0.1)',
                          border: '0.5px solid rgba(10,132,255,0.2)',
                        }}
                      >
                        <Upload style={{ width: 12, height: 12 }} />
                        Téléverser
                      </button>

                      {imgField.hint && (
                        <p style={{ fontSize: 10, color: '#3A3D45', marginTop: 7, lineHeight: 1.4 }}>
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
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
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
}: {
  field: { key: string; label: string; type: string; placeholder?: string; hint?: string }
  value: string
  onChange: (v: string) => void
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 13px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.09)',
    borderRadius: 11,
    color: '#E8E9EA',
    fontSize: 13.5,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  }

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          color: '#6E7077',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 6,
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
          style={{ ...baseStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.target.style.borderColor = 'rgba(10,132,255,0.45)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
        />
      ) : (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={baseStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(10,132,255,0.45)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
        />
      )}

      {field.hint && (
        <p style={{ fontSize: 10.5, color: '#3D4048', marginTop: 4, lineHeight: 1.45 }}>
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
}: {
  saving: boolean
  saved: boolean
  onSave: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 rounded-full font-semibold transition-all active:scale-95 shrink-0"
      style={{
        padding: compact ? '7px 18px' : '9px 22px',
        fontSize: compact ? 12 : 13,
        background: saved ? '#30D158' : saving ? 'rgba(10,132,255,0.6)' : '#0A84FF',
        color: '#ffffff',
        boxShadow: saved
          ? '0 4px 14px rgba(48,209,88,0.35)'
          : '0 4px 16px rgba(10,132,255,0.35)',
        letterSpacing: '-0.01em',
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
