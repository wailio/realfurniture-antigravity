'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
import { useAdminTheme } from '@/contexts/theme-context'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ImageIcon,
  Check,
  Loader2,
  AlertCircle,
  Star,
  Package,
  Sparkles,
  Layers,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  sale_price?: number | null
  category: string
  images: string[]
  in_stock: boolean
  slug?: string
  created_at?: string
}

const CATEGORIES = [
  { value: 'all', label: 'Tous' },
  { value: 'sofas', label: 'Salons' },
  { value: 'salle-a-manger', label: 'Salles à manger' },
  { value: 'chambres', label: 'Chambres' },
  { value: 'armoire', label: 'Armoires' },
  { value: 'accessories', label: 'Accessoires' },
]

const CATEGORY_ALIASES: Record<string, string[]> = {
  'sofas': ['sofas', 'sofa', 'salons', 'salon', 'canapes', 'canape'],
  'salle-a-manger': ['salle-a-manger', 'salle', 'salles', 'dining', 'table', 'tables'],
  'chambres': ['chambres', 'chambre', 'bedroom', 'lit', 'lits'],
  'armoire': ['armoire', 'armoires', 'dressing', 'wardrobe'],
  'accessories': ['accessories', 'accessoire', 'accessoires', 'deco', 'decoration'],
}

function matchCategory(productCat: string | undefined, filterVal: string): boolean {
  if (filterVal === 'all') return true
  const pNorm = (productCat || '').toLowerCase().trim()
  const fNorm = filterVal.toLowerCase().trim()
  if (!pNorm) return false
  if (pNorm === fNorm) return true
  for (const [canonical, aliases] of Object.entries(CATEGORY_ALIASES)) {
    const isFilterMatch = canonical === fNorm || aliases.includes(fNorm)
    if (isFilterMatch) {
      if (canonical === pNorm || aliases.includes(pNorm)) return true
    }
  }
  return false
}

// Authentic M&F Meubles collection files for the horizontal stacked deck
const COLLECTION_FILES = [
  {
    name: 'Salons Modulables',
    category: 'sofas',
    tag: 'Salons',
    image: '/products/salon/aa.jpg',
    angle: -5,
  },
  {
    name: 'Salles à Manger',
    category: 'salle-a-manger',
    tag: 'Salles à manger',
    image: '/products/salle/11.jpg',
    angle: -2,
  },
  {
    name: 'Suites & Chambres',
    category: 'chambres',
    tag: 'Chambres',
    image: '/products/chambre/-1.jpg',
    angle: 0,
  },
  {
    name: 'Dressings & Armoires',
    category: 'armoire',
    tag: 'Armoires',
    image: '/products/armoire/ar1.jpg',
    angle: 3,
  },
  {
    name: 'Accessoires & Art',
    category: 'accessories',
    tag: 'Accessoires',
    image: '/products/accessoire/acc1.jpg',
    angle: 6,
  },
]

const STEPS = ['Infos', 'Catégorie', 'Images', 'Détails']

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  sale_price: '',
  category: 'sofas',
  images: [''],
  in_stock: true,
}

export default function AdminProductsPage() {
  const { isDark } = useAdminTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hoveredFileIndex, setHoveredFileIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Impossible de charger les produits. Vérifiez la connexion Supabase.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fd = new FormData()
        fd.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erreur lors du téléversement')
        }

        const data = await res.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      }

      setForm(prev => {
        const currentValid = prev.images.filter(Boolean)
        return {
          ...prev,
          images: [...currentValid, ...uploadedUrls],
        }
      })
      showIosToast('Photo téléversée avec succès ✓', 'success')
    } catch (err: any) {
      showIosToast(err.message || 'Erreur lors du téléversement de la photo', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 1-Click Catalog Seeder for initial launch
  const handleSeed = async () => {
    const confirmed = await showIosConfirm({
      title: 'Importer le catalogue',
      message: 'Voulez-vous importer les 30 modèles du catalogue initial dans Supabase ?',
      confirmText: 'Importer',
      isDestructive: false,
    })
    if (!confirmed) return

    setSeeding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products?action=seed', { method: 'POST' })
      if (!res.ok) throw new Error('Erreur lors de l\'import')
      await fetchProducts()
      showIosToast('Catalogue initial importé avec succès dans Supabase ✓', 'success')
    } catch (e: any) {
      showIosToast(e.message || 'Erreur lors de l\'importation', 'error')
    } finally {
      setSeeding(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setStep(0)
    setSaveMsg('')
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : '',
      category: p.category,
      images: p.images?.length ? p.images : [''],
      in_stock: p.in_stock,
    })
    setStep(0)
    setSaveMsg('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setStep(0)
    setSaveMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        category: form.category,
        images: form.images.filter(Boolean),
        in_stock: form.in_stock,
        ...(editing ? { id: editing.id } : {}),
      }

      const method = editing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erreur')
      }

      setSaveMsg(editing ? 'Produit mis à jour ✓' : 'Produit ajouté ✓')
      await fetchProducts()
      setTimeout(closeModal, 1200)
    } catch (e) {
      setSaveMsg((e as Error).message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await showIosConfirm({
      title: 'Supprimer le produit',
      message: 'Voulez-vous supprimer définitivement ce produit du catalogue ?',
      confirmText: 'Supprimer',
      isDestructive: true,
    })
    if (!confirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Erreur lors de la suppression')
      }
      const data = await res.json().catch(() => ({}))
      await fetchProducts()
      if (data.freedStorageFiles && data.freedStorageFiles > 0) {
        showIosToast(`Produit et ${data.freedStorageFiles} photo(s) supprimés définitivement de Supabase ✓`, 'info')
      } else {
        showIosToast('Produit supprimé définitivement de la base Supabase ✓', 'info')
      }
    } catch (err: any) {
      showIosToast(err.message || 'Erreur lors de la suppression', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesCat = matchCategory(p.category, filter)
    const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const canNextStep = () => {
    if (step === 0) return form.name.trim().length > 0 && form.price.trim().length > 0
    if (step === 1) return form.category.trim().length > 0
    if (step === 2) return form.images.some(Boolean)
    return true
  }

  // Dark-aware dynamic styles
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: isDark ? 'rgba(235,235,245,0.6)' : '#334155',
    letterSpacing: '-0.01em',
    marginBottom: 6,
    transition: 'color 0.3s ease',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #E2E8F0',
    background: isDark ? '#2C2C2E' : '#F8FAFC',
    fontSize: 13.5,
    color: isDark ? '#FFFFFF' : '#0F172A',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.3s ease, color 0.3s ease',
    boxSizing: 'border-box',
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent', transition: 'background 0.3s ease' }}>
      {/* ── Page Header: Apple frosted header ── */}
      <div
        style={{
          background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(245, 245, 247, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
          padding: '14px clamp(16px, 3vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 400,
                color: isDark ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.01em',
                margin: 0,
                transition: 'color 0.3s ease',
              }}
            >
              Produits &amp; Catalogue <span style={{ fontWeight: 800 }}>• M&amp;F Meubles</span>
            </h1>
            <span style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontWeight: 500, transition: 'color 0.3s ease' }}>
              ({products.length} pièce{products.length !== 1 ? 's' : ''})
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2, transition: 'color 0.3s ease' }}>
            Gestion des collections, prix, finitions et disponibilités showroom
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {products.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isDark ? '#2C2C2E' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : '#0F172A',
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                cursor: seeding ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                transition: 'all 0.15s, background 0.3s ease, color 0.3s ease',
              }}
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#B8860B]" />}
              {seeding ? 'Importation...' : 'Importer le catalogue'}
            </button>
          )}

          <button
            type="button"
            onClick={openAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#FFFFFF' : '#0F172A',
              color: isDark ? '#000000' : '#FFFFFF',
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>
      </div>

      <div style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
        {/* ── HORIZONTAL STACKED FILES DECK ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers className="w-4 h-4" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark ? 'rgba(235,235,245,0.3)' : '#0F172A',
                  transition: 'color 0.3s ease',
                }}
              >
                Collections &amp; Lignes de Mobilier
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', transition: 'color 0.3s ease' }}>
              Cliquez sur un dossier pour filtrer
            </span>
          </div>

          {/* Overlapping File Cards */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              padding: '12px 4px 24px 4px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 auto',
                padding: '6px 12px',
              }}
            >
              {COLLECTION_FILES.map((file, i) => {
                const isHovered = hoveredFileIndex === i
                const isActive = filter === file.category

                return (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setFilter(file.category)
                    }}
                    onMouseEnter={() => setHoveredFileIndex(i)}
                    onMouseLeave={() => setHoveredFileIndex(null)}
                    style={{
                      position: 'relative',
                      width: 'clamp(175px, 20vw, 220px)',
                      height: 'clamp(220px, 26vw, 275px)',
                      marginLeft: i === 0 ? 0 : 'clamp(-28px, -4vw, -45px)',
                      borderRadius: 20,
                      background: isDark ? '#1C1C1E' : '#FFFFFF',
                      border: isActive
                        ? (isDark ? '3px solid #FFFFFF' : '3px solid #0F172A')
                        : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                      boxShadow: isHovered
                        ? '0 24px 45px -8px rgba(15, 23, 42, 0.16)'
                        : isActive
                        ? '0 14px 30px -6px rgba(15, 23, 42, 0.12)'
                        : '0 6px 18px -4px rgba(15, 23, 42, 0.06)',
                      transform: isHovered
                        ? 'translateY(-16px) scale(1.05) rotate(0deg)'
                        : `rotate(${file.angle}deg)`,
                      zIndex: isHovered ? 40 : isActive ? 20 : i + 1,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.image}
                      alt={file.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%)',
                      }}
                    />

                    {/* Top Folder Tab Label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: isDark ? 'rgba(28,28,30,0.9)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      {file.tag}
                    </div>

                    {/* Bottom Title */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        right: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: 1.25,
                        }}
                      >
                        {file.name}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── FILTERS & SEARCH BAR ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {/* Category Clickable Pills */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              padding: '3px',
              borderRadius: 14,
              background: isDark ? '#2C2C2E' : '#DFE4EA',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #D5DBE2',
              maxWidth: '100%',
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.value}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setFilter(cat.value)
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 11,
                  fontSize: 11.5,
                  fontWeight: filter === cat.value ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: filter === cat.value
                    ? (isDark ? 'rgba(255,255,255,0.12)' : '#FFFFFF')
                    : 'transparent',
                  color: filter === cat.value
                    ? (isDark ? '#FFFFFF' : '#0F172A')
                    : (isDark ? 'rgba(235,235,245,0.6)' : '#64748B'),
                  boxShadow: filter === cat.value
                    ? '0 2px 6px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
                    : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#2C2C2E' : '#FFFFFF',
              borderRadius: 9999,
              padding: '9px 16px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #DFE3E8',
              width: '100%',
              maxWidth: 320,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }} />
            <input
              type="text"
              placeholder="Rechercher un modèle, salon, table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12.5,
                color: isDark ? '#FFFFFF' : '#0F172A',
                width: '100%',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X className="w-3.5 h-3.5" style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }} />
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: isDark ? 'rgba(255,69,58,0.1)' : '#FEF2F2',
              border: isDark ? '1px solid rgba(255,69,58,0.3)' : '1px solid #FCA5A5',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 20,
              color: '#FF453A',
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF453A]" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProducts}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: isDark ? '#2C2C2E' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontSize: 12,
                fontWeight: 600,
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <RefreshCw className="w-3 h-3" /> Réessayer
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID / EMPTY STATE ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: isDark ? '3px solid rgba(255,255,255,0.1)' : '3px solid #E5E7EB',
                borderTopColor: isDark ? '#FFFFFF' : '#0F172A',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 24px',
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 24,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: isDark ? '#2C2C2E' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Package className="w-6 h-6" style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B' }} />
            </div>

            <p style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 16, fontWeight: 700, transition: 'color 0.3s ease' }}>
              {products.length === 0
                ? 'Le catalogue est prêt'
                : 'Aucun produit dans cette sélection'}
            </p>
            <p style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', fontSize: 13, marginTop: 6, maxWidth: 440, margin: '6px auto 20px', transition: 'color 0.3s ease' }}>
              {products.length === 0
                ? 'Vous pouvez importer les modèles de démonstration ou ajouter vos pièces sur-mesure.'
                : search
                ? 'Aucun modèle ne correspond à votre recherche.'
                : 'Aucune pièce trouvée pour cette catégorie.'}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {products.length === 0 ? (
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seeding}
                  style={{
                    padding: '9px 18px',
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    borderRadius: 12,
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: 'none',
                    cursor: seeding ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {seeding ? 'Importation...' : '✨ Importer les modèles du catalogue'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setFilter('all'); setSearch('') }}
                  style={{
                    padding: '9px 18px',
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    borderRadius: 12,
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Voir tous les produits ({products.length})
                </button>
              )}

              <button
                type="button"
                onClick={openAdd}
                style={{
                  padding: '9px 18px',
                  background: isDark ? '#2C2C2E' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderRadius: 12,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Plus className="w-4 h-4" />
                Ajouter manuellement
              </button>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            style={{
              gap: 'clamp(10px, 2vw, 18px)',
            }}
          >
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
                  boxShadow: isDark
                    ? '0 1px 2px rgba(0,0,0,0.3), 0 4px 14px -2px rgba(0,0,0,0.2)'
                    : '0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 14px -2px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                className="hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Product Image */}
                <div className="h-28 sm:h-36 md:h-48" style={{ position: 'relative', background: isDark ? '#2C2C2E' : '#F8FAFC', overflow: 'hidden' }}>
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <ImageIcon className="w-7 h-7" style={{ color: isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8' }} />
                    </div>
                  )}

                  {/* Stock badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: product.in_stock ? '#ECFDF5' : '#FEF2F2',
                      border: product.in_stock ? '1px solid #A7F3D0' : '1px solid #FCA5A5',
                      color: product.in_stock ? '#047857' : '#B91C1C',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {product.in_stock ? 'EN STOCK' : 'RUPTURE'}
                  </div>

                  {/* Multiple Images badge */}
                  {product.images?.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 99,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: 'clamp(10px, 1.5vw, 16px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="flex flex-col gap-1 mb-2">
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.3s ease',
                      }}
                      title={product.name}
                    >
                      {product.name}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                      <span
                        style={{
                          fontSize: 10,
                          color: isDark ? 'rgba(235,235,245,0.6)' : '#475569',
                          background: isDark ? '#2C2C2E' : '#F1F5F9',
                          padding: '2px 7px',
                          borderRadius: 6,
                          fontWeight: 600,
                          transition: 'color 0.3s ease, background 0.3s ease',
                        }}
                      >
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </span>

                      {product.sale_price ? (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#FF453A' }}>
                            {product.sale_price.toLocaleString('fr-DZ')} DA
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', transition: 'color 0.3s ease' }}>
                          {product.price.toLocaleString('fr-DZ')} DA
                        </span>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p
                      className="hidden sm:block"
                      style={{
                        fontSize: 11.5,
                        color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 10,
                        marginTop: 4,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        openEdit(product)
                      }}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        borderRadius: 10,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: isDark ? '#2C2C2E' : '#F1F5F9',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        color: isDark ? 'rgba(235,235,245,0.6)' : '#0F172A',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:opacity-80"
                    >
                      <Pencil className="w-3 h-3 text-current" />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(product.id)
                      }}
                      disabled={deletingId === product.id}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 10,
                        fontSize: 11.5,
                        background: isDark ? 'rgba(255,69,58,0.15)' : '#FEF2F2',
                        border: isDark ? '1px solid rgba(255,69,58,0.3)' : '1px solid #FCA5A5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF453A',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:opacity-80"
                    >
                      {deletingId === product.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 560,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
              boxShadow: isDark
                ? '0 24px 60px -12px rgba(0,0,0,0.6)'
                : '0 24px 60px -12px rgba(15, 23, 42, 0.20)',
              overflow: 'hidden',
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '22px 28px',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <p style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2, transition: 'color 0.3s ease' }}>
                  Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                  background: isDark ? '#2C2C2E' : '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                  transition: 'all 0.15s',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', padding: '14px 28px', gap: 6 }}>
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 99,
                    background: i <= step
                      ? (isDark ? '#FFFFFF' : '#0F172A')
                      : (isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'),
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '8px 28px 28px' }}>
              {/* Step 0: Name + Price */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Nom du produit *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Salon Modulable Royal"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Prix (DA) *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="84990"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Prix soldé (DA)</label>
                      <input
                        type="number"
                        value={form.sale_price}
                        onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
                        placeholder="Optionnel"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description du produit..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 99,
                        background: form.in_stock ? '#30D158' : (isDark ? '#3A3A3C' : '#CBD5E1'),
                        position: 'relative',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: form.in_stock ? 23 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: 99,
                          background: '#fff',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        }}
                      />
                    </button>
                    <span style={{ fontSize: 13.5, color: isDark ? 'rgba(235,235,245,0.6)' : '#334155', fontWeight: 500, transition: 'color 0.3s ease' }}>En stock showroom</span>
                  </div>
                </div>
              )}

              {/* Step 1: Category */}
              {step === 1 && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: 12 }}>Catégorie *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => {
                      const isSelected = form.category === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '13px 16px',
                            borderRadius: 12,
                            border: isSelected
                              ? (isDark ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid #0F172A')
                              : (isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid #E2E8F0'),
                            background: isSelected
                              ? (isDark ? '#2C2C2E' : '#F8FAFC')
                              : (isDark ? '#1C1C1E' : '#FFFFFF'),
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected
                                ? (isDark ? '#FFFFFF' : '#0F172A')
                                : (isDark ? 'rgba(235,235,245,0.6)' : '#475569'),
                              transition: 'color 0.3s ease',
                            }}
                          >
                            {cat.label}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Images */}
              {step === 2 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Device File Upload Dropzone */}
                  <div
                    onClick={() => {
                      if (!uploading) fileInputRef.current?.click()
                    }}
                    style={{
                      border: isDark ? '2px dashed rgba(255,255,255,0.12)' : '2px dashed #CBD5E1',
                      background: isDark ? '#2C2C2E' : '#F8FAFC',
                      borderRadius: 16,
                      padding: '24px 20px',
                      textAlign: 'center',
                      cursor: uploading ? 'wait' : 'pointer',
                      transition: 'all 0.15s ease',
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 99,
                        background: isDark ? '#3A3A3C' : '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
                      ) : (
                        <UploadCloud className="w-5 h-5" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }} />
                      )}
                    </div>

                    <p style={{ fontSize: 13.5, fontWeight: 600, color: isDark ? '#FFFFFF' : '#0F172A', transition: 'color 0.3s ease' }}>
                      {uploading ? 'Téléversement en cours sur Supabase...' : 'Importer depuis votre appareil'}
                    </p>
                    <p style={{ fontSize: 12, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginTop: 2, transition: 'color 0.3s ease' }}>
                      Sélectionnez une ou plusieurs photos (PNG, JPG, WEBP)
                    </p>
                    <button
                      type="button"
                      disabled={uploading}
                      style={{
                        marginTop: 12,
                        padding: '7px 18px',
                        borderRadius: 99,
                        background: isDark ? '#FFFFFF' : '#0F172A',
                        color: isDark ? '#000000' : '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                      }}
                    >
                      Choisir les photos
                    </button>
                  </div>

                  {/* Uploaded Photos Gallery */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: isDark ? '#FFFFFF' : '#0F172A', transition: 'color 0.3s ease' }}>
                        Photos du produit ({form.images.filter(Boolean).length})
                      </span>
                      {form.images.filter(Boolean).length > 0 && (
                        <span style={{ fontSize: 11, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', transition: 'color 0.3s ease' }}>
                          La 1ère image est la couverture
                        </span>
                      )}
                    </div>

                    {form.images.filter(Boolean).length === 0 ? (
                      <div
                        style={{
                          padding: '18px',
                          borderRadius: 12,
                          background: isDark ? '#2C2C2E' : '#F8FAFC',
                          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                          textAlign: 'center',
                          color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B',
                          fontSize: 12.5,
                          transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                        }}
                      >
                        Aucune photo importée. Cliquez sur le bouton ci-dessus pour importer depuis votre téléphone ou PC.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                        {form.images.filter(Boolean).map((img, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: i === 0
                                ? (isDark ? '2px solid rgba(255,255,255,0.4)' : '2px solid #0F172A')
                                : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                              aspectRatio: '1',
                              background: isDark ? '#2C2C2E' : '#F8FAFC',
                              boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Cover Badge */}
                            {i === 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  left: 4,
                                  background: isDark ? '#FFFFFF' : '#0F172A',
                                  color: isDark ? '#000000' : '#FFFFFF',
                                  borderRadius: 99,
                                  padding: '2px 6px',
                                  fontSize: 9,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                              >
                                <Star className="w-2.5 h-2.5 fill-current text-current" />
                                <span>Couverture</span>
                              </div>
                            )}

                            {/* Action overlay */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                insetInline: 0,
                                background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              {i !== 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const valid = form.images.filter(Boolean)
                                    const item = valid[i]
                                    valid.splice(i, 1)
                                    valid.unshift(item)
                                    setForm(f => ({ ...f, images: valid }))
                                  }}
                                  title="Définir comme photo principale"
                                  style={{
                                    border: 'none',
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    color: '#FFFFFF',
                                    fontSize: 9.5,
                                    fontWeight: 600,
                                    borderRadius: 4,
                                    padding: '2px 5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ★ Principal
                                </button>
                              ) : <span />}

                              <button
                                type="button"
                                onClick={() => {
                                  const valid = form.images.filter(Boolean)
                                  valid.splice(i, 1)
                                  setForm(f => ({ ...f, images: valid.length ? valid : [''] }))
                                }}
                                title="Supprimer cette photo"
                                style={{
                                  border: 'none',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  color: '#FFFFFF',
                                  borderRadius: 99,
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 13, color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', marginBottom: 4, transition: 'color 0.3s ease' }}>Vérifiez les informations avant d&apos;enregistrer :</p>
                  <div style={{
                    background: isDark ? '#2C2C2E' : '#F8FAFC',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                  }}>
                    {[
                      { label: 'Nom', value: form.name },
                      { label: 'Catégorie', value: CATEGORIES.find(c => c.value === form.category)?.label },
                      { label: 'Prix', value: `${Number(form.price).toLocaleString('fr-DZ')} DA` },
                      { label: 'Prix soldé', value: form.sale_price ? `${Number(form.sale_price).toLocaleString('fr-DZ')} DA` : '—' },
                      { label: 'Images', value: `${form.images.filter(Boolean).length} photo(s)` },
                      { label: 'Stock showroom', value: form.in_stock ? 'En stock' : 'Rupture' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: 4 }}>
                        <span style={{ color: isDark ? 'rgba(235,235,245,0.6)' : '#64748B', transition: 'color 0.3s ease' }}>{row.label}</span>
                        <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 600, transition: 'color 0.3s ease' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save message */}
              {saveMsg && (
                <p
                  style={{
                    fontSize: 13,
                    marginTop: 12,
                    color: saveMsg.includes('✓') ? '#30D158' : '#FF453A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {saveMsg.includes('✓') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {saveMsg}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 28px',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={step === 0 ? closeModal : () => setStep(s => s - 1)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2E8F0',
                  background: isDark ? '#2C2C2E' : '#F8FAFC',
                  color: isDark ? 'rgba(235,235,245,0.6)' : '#475569',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {step === 0 ? 'Annuler' : 'Précédent'}
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => { if (canNextStep()) setStep(s => s + 1) }}
                  disabled={!canNextStep()}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: canNextStep()
                      ? (isDark ? '#FFFFFF' : '#0F172A')
                      : (isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'),
                    color: canNextStep()
                      ? (isDark ? '#000000' : '#FFFFFF')
                      : (isDark ? 'rgba(235,235,245,0.3)' : '#94A3B8'),
                    fontSize: 13,
                    cursor: canNextStep() ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '9px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: isDark ? '#FFFFFF' : '#0F172A',
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 13,
                    cursor: saving ? 'wait' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: saving ? 0.7 : 1,
                    boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                  }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        [data-admin-theme="dark"] .admin-card { background: #1C1C1E; border-color: rgba(255,255,255,0.08); }
        [data-admin-theme="dark"] .admin-row { background: #1C1C1E; border-color: rgba(255,255,255,0.08); }
        [data-admin-theme="dark"] .admin-row:hover { background: #2C2C2E; border-color: rgba(255,255,255,0.14); }
      `}</style>
    </div>
  )
}
