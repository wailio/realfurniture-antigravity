'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
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
  { value: 'dining', label: 'Salles à manger' },
  { value: 'bedroom', label: 'Chambres' },
  { value: 'armoires', label: 'Armoires' },
  { value: 'accessories', label: 'Accessoires' },
]

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
    category: 'dining',
    tag: 'Salles à manger',
    image: '/products/salle/11.jpg',
    angle: -2,
  },
  {
    name: 'Suites & Chambres',
    category: 'bedroom',
    tag: 'Chambres',
    image: '/products/chambre/-1.jpg',
    angle: 0,
  },
  {
    name: 'Dressings & Armoires',
    category: 'armoires',
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

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const url = filter === 'all'
        ? '/api/admin/products'
        : `/api/admin/products?category=${filter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Impossible de charger les produits. Vérifiez la connexion Supabase.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // 1-Click Catalog Seeder for initial launch
  const handleSeed = async () => {
    if (!confirm('Voulez-vous importer les 30 modèles du catalogue dans Supabase ?')) return
    setSeeding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products?action=seed', { method: 'POST' })
      if (!res.ok) throw new Error('Erreur lors de l\'import')
      await fetchProducts()
      alert('Catalogue initial importé avec succès dans Supabase !')
    } catch (e: any) {
      alert(e.message || 'Erreur lors de l\'importation')
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
    if (!confirm('Supprimer ce produit ?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      await fetchProducts()
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter(p =>
    search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const canNextStep = () => {
    if (step === 0) return form.name.trim().length > 0 && form.price.trim().length > 0
    if (step === 1) return form.category.trim().length > 0
    if (step === 2) return form.images.some(Boolean)
    return true
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F5F3' }}>
      {/* Header */}
      <div
        style={{
          background: 'rgba(6, 11, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
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
            Produits
          </h1>
          <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>
            {products.length} produit{products.length !== 1 ? 's' : ''} dans le catalogue Supabase
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {products.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#F2F1EF',
                padding: '11px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: seeding ? 'wait' : 'pointer',
                transition: 'all 0.15s',
              }}
              className="hover:bg-white/[0.12]"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin text-[#d1aa5c]" /> : <Sparkles className="w-4 h-4 text-[#d1aa5c]" />}
              {seeding ? 'Importation en cours...' : 'Importer le catalogue (30 modèles)'}
            </button>
          )}

          <button
            onClick={openAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#d1aa5c',
              color: '#14120f',
              padding: '11px 22px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.02em',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(209, 170, 92, 0.25)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
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
              background: 'rgba(6, 11, 25, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
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
                    onClick={() => setFilter(file.category)}
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
              background: 'rgba(6, 11, 25, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 14,
              padding: '10px 16px',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              flex: 1,
              maxWidth: 340,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            <Search className="w-4 h-4 text-[#d1aa5c] shrink-0" />
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
                color: '#FFFFFF',
                width: '100%',
              }}
            />
          </div>

          {/* Category Clickable Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: filter === cat.value ? 'none' : '1px solid rgba(255, 255, 255, 0.09)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: filter === cat.value ? '#d1aa5c' : 'rgba(6, 11, 25, 0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: filter === cat.value ? '#14120f' : '#D4D4D8',
                  boxShadow: filter === cat.value
                    ? '0 4px 14px rgba(209, 170, 92, 0.3)'
                    : '0 4px 12px rgba(0,0,0,0.2)',
                }}
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
              background: 'rgba(6, 11, 25, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 99,
                background: 'rgba(209, 170, 92, 0.12)',
                border: '1px solid rgba(209, 170, 92, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Package className="w-7 h-7 text-[#d1aa5c]" />
            </div>

            <p style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 600 }}>
              {search ? 'Aucun produit trouvé' : 'Le catalogue Supabase est prêt'}
            </p>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginTop: 6, maxWidth: 440, margin: '6px auto 20px' }}>
              {search
                ? 'Essayez une autre recherche ou réinitialisez les filtres.'
                : 'Votre base de données Supabase est connectée. Vous pouvez importer les 30 modèles de démonstration ou ajouter vos pièces sur-mesure.'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleSeed}
                disabled={seeding}
                style={{
                  padding: '11px 22px',
                  background: '#d1aa5c',
                  color: '#14120f',
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
                {seeding ? 'Importation...' : '✨ Importer les 30 modèles du catalogue'}
              </button>

              <button
                onClick={openAdd}
                style={{
                  padding: '11px 22px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
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
                  background: 'rgba(6, 11, 25, 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  boxShadow: '0 14px 36px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)',
                  transition: 'all 0.25s ease',
                }}
                className="hover:shadow-2xl hover:-translate-y-1 hover:border-[#60a5fa]/30"
              >
                {/* Product Image */}
                <div style={{ position: 'relative', height: 200, background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
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
                      <ImageIcon className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.2)' }} />
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
                        background: 'rgba(0,0,0,0.7)',
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
                          color: '#FFFFFF',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#d1aa5c',
                          background: 'rgba(209, 170, 92, 0.12)',
                          border: '1px solid rgba(209, 170, 92, 0.25)',
                          padding: '2px 8px',
                          borderRadius: 99,
                          display: 'inline-block',
                          marginTop: 6,
                        }}
                      >
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {product.sale_price ? (
                        <>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#f87171' }}>
                            {product.sale_price.toLocaleString('fr-DZ')} DA
                          </p>
                          <p style={{ fontSize: 11, color: '#71717A', textDecoration: 'line-through' }}>
                            {product.price.toLocaleString('fr-DZ')}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#d1aa5c' }}>
                          {product.price.toLocaleString('fr-DZ')} DA
                        </p>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#A1A1AA',
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
                      onClick={() => openEdit(product)}
                      style={{
                        flex: 1,
                        padding: '9px 0',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 500,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        color: '#F2F1EF',
                        transition: 'background 0.15s',
                      }}
                      className="hover:bg-white/[0.12]"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#d1aa5c]" />
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f87171',
                        transition: 'background 0.15s',
                      }}
                      className="hover:bg-red-500/20"
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
              background: 'rgba(5, 9, 22, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 560,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)',
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 400,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>
                  Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 99,
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4D4D8',
                }}
                className="hover:bg-white/10"
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
                  <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 16, lineHeight: 1.5 }}>
                    Entrez les URLs des photos. La <strong style={{ color: '#d1aa5c' }}>première image</strong> est la couverture.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ImageIcon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                          )}
                          {i === 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                background: '#d1aa5c',
                                borderRadius: 99,
                                padding: '2px',
                              }}
                            >
                              <Star className="w-2.5 h-2.5" style={{ color: '#14120f' }} />
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={img}
                          onChange={e => {
                            const newImgs = [...form.images]
                            newImgs[i] = e.target.value
                            setForm(f => ({ ...f, images: newImgs }))
                          }}
                          placeholder={i === 0 ? 'Ex: /products/salon/aa.jpg ou URL web' : `URL image ${i + 1}`}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        {form.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = form.images.filter((_, ii) => ii !== i)
                              setForm(f => ({ ...f, images: newImgs }))
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: 8,
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              cursor: 'pointer',
                              display: 'flex',
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {form.images.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          color: '#A1A1AA',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Plus className="w-4 h-4 text-[#d1aa5c]" />
                        Ajouter une photo
                      </button>
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
