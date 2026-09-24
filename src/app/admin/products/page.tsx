'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showIosToast, showIosConfirm } from '@/components/ui/ios-dialog'
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
  ImagePlus,
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

// Authentic Château d'art collection files for the horizontal stacked deck
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
  {
    name: 'Luxe & Velours',
    category: 'sofas',
    tag: 'Signature',
    image: '/products/salon/bb.jpg',
    angle: 9,
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
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      await fetchProducts()
      showIosToast('Produit supprimé du catalogue ✓', 'info')
    } catch {
      showIosToast('Erreur lors de la suppression', 'error')
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
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 26,
                fontWeight: 300,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Produits
            </h1>
            <span style={{ fontSize: 13, color: '#A1A1AA' }}>
              ({products.length} produit{products.length !== 1 ? 's' : ''})
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
            Gérez votre catalogue de mobilier de prestige
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
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#F2F1EF',
                padding: '10px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.10)',
                cursor: seeding ? 'wait' : 'pointer',
                transition: 'all 0.15s',
              }}
              className="hover:bg-white/[0.08]"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin text-[#d1aa5c]" /> : <Sparkles className="w-4 h-4 text-[#d1aa5c]" />}
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
              background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
              color: '#0A0B0C',
              padding: '11px 22px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.02em',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(209, 170, 92, 0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>
      </div>

      <div style={{ padding: '36px' }}>
        {/* ── HORIZONTAL STACKED FILES DECK (As requested) ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers className="w-4 h-4" style={{ color: '#d1aa5c' }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#f8f3e8',
                }}
              >
                Collections &amp; Échantillons
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: '#d1aa5c' }}>
              Cliquez sur un dossier pour filtrer
            </span>
          </div>

          {/* Horizontal Overlapping File Cards Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '24px 20px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              overflowX: 'auto',
              minHeight: 220,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 auto',
                padding: '10px 30px',
              }}
            >
              {COLLECTION_FILES.map((file, i) => {
                const isHovered = hoveredFileIndex === i
                const isActive = filter === file.category

                return (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilter(file.category);
                    }}
                    onMouseEnter={() => setHoveredFileIndex(i)}
                    onMouseLeave={() => setHoveredFileIndex(null)}
                    style={{
                      position: 'relative',
                      width: 140,
                      height: 180,
                      marginLeft: i === 0 ? 0 : -38,
                      borderRadius: 16,
                      background: '#18191B',
                      border: isActive ? '3px solid #d1aa5c' : '2px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: isHovered
                        ? '0 20px 35px -5px rgba(0,0,0,0.5), 0 0 20px rgba(209, 170, 92, 0.3)'
                        : isActive
                        ? '0 12px 28px -5px rgba(209, 170, 92, 0.35)'
                        : '0 10px 25px -5px rgba(0,0,0,0.3)',
                      transform: isHovered
                        ? 'translateY(-16px) scale(1.08) rotate(0deg)'
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
                        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)',
                      }}
                    />

                    {/* Top Folder Tab Label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'rgba(8, 14, 32, 0.90)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(209, 170, 92, 0.3)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: '#d1aa5c',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {file.tag}
                    </div>

                    {/* Bottom Title */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#FFFFFF',
                          lineHeight: 1.2,
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
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

        {/* ── FILTERS & CATEGORIES (Directly below stacked files deck) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '10px 16px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              flex: 1,
              maxWidth: 340,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#111827',
                width: '100%',
              }}
            />
          </div>

          {/* Category Clickable Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.value}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFilter(cat.value);
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: filter === cat.value ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: filter === cat.value ? '#111827' : '#FFFFFF',
                  color: filter === cat.value ? '#FFFFFF' : '#374151',
                  boxShadow: filter === cat.value
                    ? '0 3px 12px rgba(0, 0, 0, 0.2)'
                    : '0 1px 4px rgba(0, 0, 0, 0.04)',
                }}
                className={filter !== cat.value ? 'hover:bg-[#F3F4F6] hover:text-[#111827]' : ''}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 20,
              color: '#f87171',
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProducts}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: 12,
                border: '1px solid rgba(255, 255, 255, 0.2)',
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
            <Loader2 className="w-7 h-7 animate-spin text-[#d1aa5c]" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 24px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 99,
                background: '#F3F4F6',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Package className="w-7 h-7 text-[#111827]" />
            </div>

            <p style={{ color: '#111827', fontSize: 17, fontWeight: 600 }}>
              {products.length === 0
                ? 'Le catalogue Supabase est prêt'
                : 'Aucun produit dans cette catégorie'}
            </p>
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6, maxWidth: 440, margin: '6px auto 20px' }}>
              {products.length === 0
                ? 'Votre base de données Supabase est connectée. Vous pouvez importer les modèles de démonstration ou ajouter vos pièces sur-mesure.'
                : search
                ? 'Aucun modèle ne correspond à votre recherche.'
                : 'Aucune pièce trouvée pour cette catégorie. Vous pouvez ajouter un produit ou réinitialiser le filtre.'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {products.length === 0 ? (
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seeding}
                  style={{
                    padding: '11px 22px',
                    background: 'linear-gradient(135deg, #d1aa5c 0%, #b89347 100%)',
                    color: '#0A0B0C',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: seeding ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(209, 170, 92, 0.25)',
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
                    padding: '11px 22px',
                    background: '#111827',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Voir tous les produits ({products.length})
                </button>
              )}

              <button
                type="button"
                onClick={openAdd}
                style={{
                  padding: '11px 22px',
                  background: '#F3F4F6',
                  color: '#111827',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="hover:bg-[#E5E7EB]"
              >
                <Plus className="w-4 h-4" />
                Ajouter manuellement
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
                className="hover:shadow-lg hover:-translate-y-1"
              >
                {/* Product Image */}
                <div style={{ position: 'relative', height: 200, background: '#F3F4F6', overflow: 'hidden' }}>
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
                      <ImageIcon className="w-10 h-10" style={{ color: '#9CA3AF' }} />
                    </div>
                  )}

                  {/* Stock badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: product.in_stock ? 'rgba(16,185,129,0.92)' : 'rgba(239,68,68,0.92)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 99,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {product.in_stock ? 'EN STOCK' : 'RUPTURE'}
                  </div>

                  {/* Multiple Images badge */}
                  {product.images?.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: 10.5,
                        padding: '3px 8px',
                        borderRadius: 99,
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      +{product.images.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '18px 20px' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: '#111827',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#4B5563',
                          background: '#F3F4F6',
                          border: '1px solid rgba(0, 0, 0, 0.04)',
                          padding: '2px 8px',
                          borderRadius: 99,
                          display: 'inline-block',
                          marginTop: 6,
                          fontWeight: 500,
                        }}
                      >
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {product.sale_price ? (
                        <>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#DC2626' }}>
                            {product.sale_price.toLocaleString('fr-DZ')} DA
                          </p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>
                            {product.price.toLocaleString('fr-DZ')}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                          {product.price.toLocaleString('fr-DZ')} DA
                        </p>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#6B7280',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 14,
                        marginTop: 6,
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEdit(product);
                      }}
                      style={{
                        flex: 1,
                        padding: '9px 0',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 500,
                        background: '#F3F4F6',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        color: '#111827',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF]"
                    >
                      <Pencil className="w-3.5 h-3.5 text-current" />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={deletingId === product.id}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        background: '#FEE2E2',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#DC2626',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="hover:bg-[#EF4444] hover:text-white"
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
            background: 'rgba(0, 0, 0, 0.70)',
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
              background: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 560,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '22px 28px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#111827',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  border: 'none',
                  background: '#F3F4F6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  transition: 'background 0.15s',
                }}
                className="hover:bg-[#E5E7EB]"
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
                    background: i <= step ? '#d1aa5c' : 'rgba(255, 255, 255, 0.12)',
                    boxShadow: i <= step ? '0 0 8px rgba(209, 170, 92, 0.4)' : 'none',
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
                        background: form.in_stock ? '#10B981' : 'rgba(255, 255, 255, 0.15)',
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
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        }}
                      />
                    </button>
                    <span style={{ fontSize: 13.5, color: '#E5E7EB' }}>En stock</span>
                  </div>
                </div>
              )}

              {/* Step 1: Category */}
              {step === 1 && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: 12 }}>Catégorie *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
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
                          border: `1.5px solid ${form.category === cat.value ? '#d1aa5c' : 'rgba(255, 255, 255, 0.08)'}`,
                          background: form.category === cat.value ? 'rgba(209, 170, 92, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: form.category === cat.value ? '#d1aa5c' : '#D4D4D8',
                          }}
                        >
                          {cat.label}
                        </span>
                        {form.category === cat.value && (
                          <Check className="w-4 h-4" style={{ color: '#d1aa5c' }} />
                        )}
                      </button>
                    ))}
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
                      border: '2px dashed #007AFF',
                      background: 'rgba(0, 122, 255, 0.04)',
                      borderRadius: 16,
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: uploading ? 'wait' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      marginBottom: 20,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 122, 255, 0.04)')}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 99,
                        background: '#EBF5FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#007AFF]" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-[#007AFF]" />
                      )}
                    </div>

                    <p style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>
                      {uploading ? 'Téléversement en cours sur Supabase...' : 'Importer depuis votre appareil'}
                    </p>
                    <p style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4 }}>
                      Sélectionnez une ou plusieurs photos (PNG, JPG, WEBP)
                    </p>
                    <button
                      type="button"
                      disabled={uploading}
                      style={{
                        marginTop: 14,
                        padding: '8px 20px',
                        borderRadius: 99,
                        background: '#007AFF',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                      }}
                    >
                      Choisir les photos
                    </button>
                  </div>

                  {/* Uploaded Photos Gallery */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>
                        Photos du produit ({form.images.filter(Boolean).length})
                      </span>
                      {form.images.filter(Boolean).length > 0 && (
                        <span style={{ fontSize: 11, color: '#6B7280' }}>
                          La 1ère image est la couverture
                        </span>
                      )}
                    </div>

                    {form.images.filter(Boolean).length === 0 ? (
                      <div
                        style={{
                          padding: '20px',
                          borderRadius: 12,
                          background: '#F9FAFB',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          textAlign: 'center',
                          color: '#9CA3AF',
                          fontSize: 12.5,
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
                              border: i === 0 ? '2px solid #007AFF' : '1px solid rgba(0, 0, 0, 0.1)',
                              aspectRatio: '1',
                              background: '#F3F4F6',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
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
                                  background: '#007AFF',
                                  color: '#FFFFFF',
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
                                <Star className="w-2.5 h-2.5 fill-white text-white" />
                                <span>Couverture</span>
                              </div>
                            )}

                            {/* Action overlay */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                insetInline: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
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
                                  background: 'rgba(239, 68, 68, 0.85)',
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
                  <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 4 }}>Vérifiez avant d&apos;enregistrer :</p>
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Nom', value: form.name },
                      { label: 'Catégorie', value: CATEGORIES.find(c => c.value === form.category)?.label },
                      { label: 'Prix', value: `${Number(form.price).toLocaleString('fr-DZ')} DA` },
                      { label: 'Prix soldé', value: form.sale_price ? `${Number(form.sale_price).toLocaleString('fr-DZ')} DA` : '—' },
                      { label: 'Images', value: `${form.images.filter(Boolean).length} photo(s)` },
                      { label: 'Stock', value: form.in_stock ? 'En stock' : 'Rupture' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#9CA3AF' }}>{row.label}</span>
                        <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{row.value}</span>
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
                    color: saveMsg.includes('✓') ? '#34d399' : '#f87171',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                gap: 10,
              }}
            >
              <button
                onClick={step === 0 ? closeModal : () => setStep(s => s - 1)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#D4D4D8',
                  fontSize: 13.5,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {step === 0 ? 'Annuler' : 'Précédent'}
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => { if (canNextStep()) setStep(s => s + 1) }}
                  disabled={!canNextStep()}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: canNextStep() ? '#d1aa5c' : 'rgba(255, 255, 255, 0.08)',
                    color: canNextStep() ? '#14120f' : '#71717A',
                    fontSize: 13.5,
                    cursor: canNextStep() ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s',
                  }}
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 26px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#d1aa5c',
                    color: '#14120f',
                    fontSize: 13.5,
                    cursor: saving ? 'wait' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: saving ? 0.7 : 1,
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
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11.5,
  fontWeight: 600,
  color: '#d1aa5c',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'rgba(0, 0, 0, 0.35)',
  fontSize: 14,
  color: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}
