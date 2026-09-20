'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
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
  const [saveMsg, setSaveMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      setError('Impossible de charger les produits. Vérifiez la configuration Supabase.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

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

  const previewImages = products.slice(0, 5).map(p => p.images?.[0]).filter(Boolean)

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
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
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
            Produits
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            {products.length} produit{products.length !== 1 ? 's' : ''} dans le catalogue
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0E0F10',
            color: '#F2F1EF',
            padding: '11px 22px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.02em',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      <div style={{ padding: '36px' }}>
        {/* Fan Preview */}
        {previewImages.length > 0 && (
          <div
            style={{
              marginBottom: 32,
              display: 'flex',
              alignItems: 'flex-end',
              height: 120,
              position: 'relative',
              width: 'fit-content',
            }}
          >
            {previewImages.map((src, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * 48,
                  bottom: 0,
                  width: 80,
                  height: 100,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: `rotate(${(i - 2) * 6}deg)`,
                  zIndex: i,
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = `rotate(${(i - 2) * 6}deg) translateY(-8px) scale(1.04)`
                  e.currentTarget.style.zIndex = '10'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${(i - 2) * 6}deg)`
                  e.currentTarget.style.zIndex = String(i)
                }}
              >
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '8px 14px',
              border: '1px solid rgba(0,0,0,0.07)',
              flex: 1,
              maxWidth: 300,
            }}
          >
            <Search className="w-4 h-4" style={{ color: '#9CA3AF', flexShrink: 0 }} />
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
                color: '#0E0F10',
                width: '100%',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: filter === cat.value ? '#0E0F10' : '#FFFFFF',
                  color: filter === cat.value ? '#F2F1EF' : '#6B7280',
                  boxShadow: filter === cat.value ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              color: '#dc2626',
              fontSize: 13.5,
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#9CA3AF' }} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Package className="w-10 h-10 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
            <p style={{ color: '#6B7280', fontSize: 14 }}>
              {search ? 'Aucun produit trouvé' : 'Aucun produit dans cette catégorie'}
            </p>
            <button
              onClick={openAdd}
              style={{
                marginTop: 16,
                padding: '9px 20px',
                background: '#0E0F10',
                color: '#fff',
                borderRadius: 10,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Ajouter le premier produit
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                className="hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Product Image */}
                <div style={{ position: 'relative', height: 180, background: '#F6F5F3' }}>
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <ImageIcon className="w-10 h-10" style={{ color: '#D1D5DB' }} />
                    </div>
                  )}
                  {/* Stock badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: product.in_stock ? '#ecfdf5' : '#fef2f2',
                      color: product.in_stock ? '#059669' : '#dc2626',
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 99,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {product.in_stock ? 'EN STOCK' : 'RUPTURE'}
                  </div>
                  {/* Image count */}
                  {product.images?.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        background: 'rgba(0,0,0,0.55)',
                        color: '#fff',
                        fontSize: 10.5,
                        padding: '3px 8px',
                        borderRadius: 99,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      +{product.images.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px 18px' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0E0F10',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#9CA3AF',
                          background: '#F6F5F3',
                          padding: '2px 7px',
                          borderRadius: 99,
                          display: 'inline-block',
                          marginTop: 4,
                        }}
                      >
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {product.sale_price ? (
                        <>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>
                            {product.sale_price.toLocaleString('fr-DZ')} DA
                          </p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>
                            {product.price.toLocaleString('fr-DZ')}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#0E0F10' }}>
                          {product.price.toLocaleString('fr-DZ')} DA
                        </p>
                      )}
                    </div>
                  </div>
                  {product.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#9CA3AF',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 12,
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => openEdit(product)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: 500,
                        background: '#F6F5F3',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        color: '#374151',
                        transition: 'background 0.15s',
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 9,
                        fontSize: 12.5,
                        background: '#fef2f2',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#dc2626',
                        transition: 'background 0.15s',
                      }}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
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
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
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
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 400,
                    color: '#0E0F10',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
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
                  background: '#F6F5F3',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
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
                    background: i <= step ? '#0E0F10' : '#E5E7EB',
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
                        background: form.in_stock ? '#0E0F10' : '#E5E7EB',
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
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                    <span style={{ fontSize: 13.5, color: '#374151' }}>En stock</span>
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
                          border: `2px solid ${form.category === cat.value ? '#0E0F10' : '#E5E7EB'}`,
                          background: form.category === cat.value ? '#0E0F10' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: form.category === cat.value ? '#F2F1EF' : '#374151',
                          }}
                        >
                          {cat.label}
                        </span>
                        {form.category === cat.value && (
                          <Check className="w-4 h-4" style={{ color: '#F2F1EF' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Images */}
              {step === 2 && (
                <div>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
                    Entrez les URLs des images. La <strong style={{ color: '#0E0F10' }}>première image</strong> est la photo de couverture affichée en priorité.
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
                            background: '#F6F5F3',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {img ? (
                            <Image src={img} alt="" fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5" style={{ color: '#D1D5DB' }} />
                          )}
                          {i === 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                background: '#0E0F10',
                                borderRadius: 99,
                                padding: '1px',
                              }}
                            >
                              <Star className="w-2.5 h-2.5" style={{ color: '#F2F1EF' }} />
                            </div>
                          )}
                        </div>
                        <input
                          type="url"
                          value={img}
                          onChange={e => {
                            const newImgs = [...form.images]
                            newImgs[i] = e.target.value
                            setForm(f => ({ ...f, images: newImgs }))
                          }}
                          placeholder={i === 0 ? 'URL image principale (couverture)' : `URL image ${i + 1}`}
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
                              background: '#fef2f2',
                              color: '#dc2626',
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
                          border: '1.5px dashed #D1D5DB',
                          background: 'transparent',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une image
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Vérifiez avant de sauvegarder :</p>
                  <div style={{ background: '#F6F5F3', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                        <span style={{ color: '#0E0F10', fontWeight: 500 }}>{row.value}</span>
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
                    color: saveMsg.includes('✓') ? '#059669' : '#dc2626',
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
                borderTop: '1px solid rgba(0,0,0,0.06)',
                gap: 10,
              }}
            >
              <button
                onClick={step === 0 ? closeModal : () => setStep(s => s - 1)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#F6F5F3',
                  color: '#374151',
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
                    background: canNextStep() ? '#0E0F10' : '#E5E7EB',
                    color: canNextStep() ? '#F2F1EF' : '#9CA3AF',
                    fontSize: 13.5,
                    cursor: canNextStep() ? 'pointer' : 'not-allowed',
                    fontWeight: 500,
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
                    background: '#0E0F10',
                    color: '#F2F1EF',
                    fontSize: 13.5,
                    cursor: saving ? 'wait' : 'pointer',
                    fontWeight: 500,
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
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #E5E7EB',
  background: '#FAFAFA',
  fontSize: 14,
  color: '#0E0F10',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}
