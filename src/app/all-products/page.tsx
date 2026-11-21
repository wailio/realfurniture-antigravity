'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { products } from '@/lib/products';
import { ArrowUpRight, SlidersHorizontal, ChevronDown, X, Search } from 'lucide-react';
import { formatPrice, Product } from '@/lib/products';

/* ─── Category config ─────────────────────────────────── */
const CATEGORIES_CONFIG = [
  { slug: 'all',           label: 'Toute la collection',    count: 0 },
  { slug: 'salle-a-manger',label: 'Salle à manger',         count: 0 },
  { slug: 'sofas',         label: 'Canapés & Salons',       count: 0 },
  { slug: 'chambres',      label: 'Chambres & Suites',      count: 0 },
  { slug: 'armoire',       label: 'Armoires & Dressings',   count: 0 },
  { slug: 'accessories',   label: 'Tables Basses & Déco',   count: 0 },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Pertinence' },
  { value: 'price-asc',  label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest',     label: 'Nouveautés' },
  { value: 'discount',   label: 'Meilleures offres' },
];

function resolveCat(raw: string | null): string {
  if (!raw) return 'all';
  const c = raw.trim().toLowerCase();
  for (const cat of CATEGORIES_CONFIG) {
    if (cat.slug === c) return cat.slug;
  }
  return 'all';
}

/* ─── Inline Product Card — matches "Nos créations du moment" style ─── */
function ShopCard({ product }: { product: Product }) {
  const catLabel = CATEGORIES_CONFIG.find(c => c.slug === product.category)?.label
    ?? product.category.replace(/-/g, ' ');

  return (
    <div className="group relative flex flex-col justify-between text-left h-full">

      {/* Square image — sharp edges, no border-radius */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FBFBFA] border border-neutral-100 mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] select-none"
          loading="lazy"
        />

        {/* Discount badge — sharp */}
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 bg-[#212529] text-white text-[9.5px] font-semibold px-2 py-0.5 rounded-none shadow-sm">
            -{product.discount}%
          </span>
        )}
        {!product.discount && product.featured && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-neutral-700 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-none border border-neutral-200">
            Coup de cœur
          </span>
        )}

        {/* Hover CTA overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-all duration-300" />
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-250 z-10">
          <span className="inline-flex items-center gap-1 bg-[#111827]/90 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-none whitespace-nowrap">
            Voir la pièce <ArrowUpRight size={11} />
          </span>
        </div>

        {/* Full card link */}
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" aria-label={product.name} />
      </div>

      {/* Info + button */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${product.id}`} className="block group/title">
            <h3 className="text-[13.5px] sm:text-[14px] font-medium text-[#212529] line-clamp-1 group-hover/title:text-neutral-500 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs sm:text-[13px] font-normal text-neutral-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-neutral-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 block mt-0.5">{catLabel}</span>
        </div>

        {/* Sharp commander button */}
        <Link
          href={`/contact?product=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.image)}&id=${encodeURIComponent(String(product.id))}&subject=${encodeURIComponent(`Commande: ${product.name}`)}#contact-form`}
          className="mt-3 block w-full py-2 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-center rounded-none border border-neutral-300 text-neutral-800 hover:border-[#212529] hover:bg-[#212529] hover:text-white transition-all duration-200 cursor-pointer"
        >
          Commander
        </Link>
      </div>
    </div>
  );
}

/* ─── Price range slider helper — smooth mouse + touch ── */
function PriceRange({ min, max, value, onChange }: {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const pct = (v: number) => {
    if (max <= min) return 0;
    return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  };

  const updateFromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const step = 5000;
    const stepped = Math.round(raw / step) * step;
    onChange([value[0], Math.max(min, Math.min(max, stepped))]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons === 0) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const fillPct = pct(value[1]);

  return (
    <div className="pt-1 select-none">
      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2 font-medium">
        <span>{formatPrice(value[0])}</span>
        <span className="text-neutral-900 font-semibold">{formatPrice(value[1])}</span>
      </div>

      {/* Generous 32px touch & click target container */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background track line */}
        <div className="w-full h-1.5 rounded-full bg-neutral-200 relative pointer-events-none">
          {/* Active filled line */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-neutral-900 pointer-events-none"
            style={{ width: `${fillPct}%` }}
          />
          {/* Draggable thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-neutral-900 shadow-md pointer-events-none transition-transform duration-100 ${
              isDragging ? 'scale-125 shadow-lg' : ''
            }`}
            style={{ left: `${fillPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────── */
function AllProductsContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(() => resolveCat(searchParams.get('category')));
  const [productList, setProductList] = useState<Product[]>(products as Product[]);
  const [sort, setSort] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 800000]);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  /* Live product fetch */
  useEffect(() => {
    fetch('/api/products?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length > 0) setProductList(d as Product[]); })
      .catch(() => {});
  }, []);

  /* Sync URL param */
  useEffect(() => {
    const param = searchParams.get('category');
    if (param) setActiveCategory(resolveCat(param));
  }, [searchParams]);

  /* Close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Counts per category */
  const withCounts = CATEGORIES_CONFIG.map(cat => ({
    ...cat,
    count: cat.slug === 'all' ? productList.length : productList.filter(p => p.category === cat.slug).length,
  }));

  /* Filter + sort */
  const maxPrice = Math.max(...productList.map(p => p.price), 800000);
  const filtered = productList
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'newest') return (b.id ?? 0) - (a.id ?? 0);
      if (sort === 'discount') return (b.discount ?? 0) - (a.discount ?? 0);
      return 0;
    });

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Pertinence';

  /* Sidebar content — shared between desktop + mobile */
  const SidebarContent = () => (
    <div className="flex flex-col gap-7">

      {/* Search */}
      <div>
        <label className="text-[10px] uppercase tracking-[2.5px] font-bold text-neutral-400 block mb-2.5">Rechercher</label>
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom du produit..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400 transition-colors text-neutral-800 placeholder:text-neutral-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-150" />

      {/* Categories */}
      <div>
        <label className="text-[10px] uppercase tracking-[2.5px] font-bold text-neutral-400 block mb-2.5">Catégories</label>
        <ul className="flex flex-col gap-0.5">
          {withCounts.map(cat => {
            const isActive = activeCategory === cat.slug;
            return (
              <li key={cat.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    try {
                      window.history.replaceState(null, '', cat.slug === 'all' ? '/all-products' : `/all-products?category=${cat.slug}`);
                    } catch {}
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] text-white font-semibold'
                      : 'text-neutral-800 hover:bg-neutral-200/60 hover:text-neutral-900'
                  }`}
                >
                  <span className="text-left leading-tight">{cat.label}</span>
                  <span className={`text-[10px] font-medium ml-2 shrink-0 ${isActive ? 'text-white/60' : 'text-neutral-400'}`}>
                    {cat.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-150" />

      {/* Price range */}
      <div>
        <label className="text-[10px] uppercase tracking-[2.5px] font-bold text-neutral-400 block mb-2.5">Budget</label>
        <PriceRange
          min={0}
          max={maxPrice}
          value={priceRange}
          onChange={setPriceRange}
        />
        {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <button
            onClick={() => setPriceRange([0, maxPrice])}
            className="mt-2 text-[10.5px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2 cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Delivery badge */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3.5 text-xs text-neutral-600 leading-relaxed">
        <div className="font-semibold text-neutral-900 mb-1 text-[11px]">🚚 Livraison offerte</div>
        <span className="text-[11px] text-neutral-500">Alger, Blida, Tipaza, Boumerdès & Médéa. Montage inclus.</span>
      </div>
    </div>
  );

  return (
    <main id="main-content" className="min-h-screen bg-white text-[#111827] font-sans">
      <Header theme="light" />

      {/* ── Page Banner ── */}
      <section className="relative pt-4 pb-4 md:pt-5 md:pb-5 bg-[#FAFAF8] border-b border-neutral-200/70 overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(180deg,#000 0,#000 1px,transparent 0,transparent 50%)', backgroundSize: '48px 48px' }} />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-600 shadow-xs mb-2 uppercase tracking-wider">
              Catalogue officiel
            </span>
            <h1 className="text-[28px] sm:text-4xl md:text-[40px] font-extrabold text-[#111827] tracking-tight leading-[1.06] mb-1.5">
              Toutes Nos{' '}
              <span className="font-serif italic font-light text-neutral-500">Créations</span>
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-lg">
              Meubles contemporains conçus pour durer — livrés et installés dans les 69 wilayas d&apos;Algérie.
            </p>
          </div>
        </div>
      </section>

      {/* ── Shop Layout: sidebar + grid ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-24 md:pt-8 md:pb-32">
        <div className="flex gap-8 lg:gap-12 items-start">

          {/* ════════ SIDEBAR (desktop) ════════ */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-20">
            <div className="bg-[#FAFAF8] rounded-2xl border border-neutral-100 p-5">
              <SidebarContent />
            </div>
          </aside>

          {/* ════════ MAIN CONTENT ════════ */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-7 pb-5 border-b border-neutral-200/80">
              {/* Mobile filter trigger */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-neutral-400 transition-colors cursor-pointer shadow-sm"
              >
                <SlidersHorizontal size={13} />
                Filtres
              </button>

              {/* Results count */}
              <span className="text-sm text-neutral-500">
                <strong className="text-neutral-900 font-semibold">{filtered.length}</strong>{' '}
                pièce{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
              </span>

              {/* Sort dropdown */}
              <div className="relative ml-auto" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen(v => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-neutral-400 transition-colors cursor-pointer shadow-sm"
                >
                  Trier : {activeSortLabel}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 rounded-2xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-1.5">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                          sort === opt.value ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {(activeCategory !== 'all' || search) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium">
                    {CATEGORIES_CONFIG.find(c => c.slug === activeCategory)?.label}
                    <button onClick={() => setActiveCategory('all')} className="hover:text-white/70 transition-colors cursor-pointer"><X size={11} /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch('')} className="hover:text-white/70 transition-colors cursor-pointer"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5 gap-y-12 sm:gap-y-14">
                {filtered.map(product => (
                  <ShopCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">🛋️</div>
                <p className="text-lg text-neutral-800 font-semibold">Aucun modèle trouvé</p>
                <p className="text-sm text-neutral-500">Essayez de modifier vos filtres.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearch(''); setPriceRange([0, maxPrice]); }}
                  className="mt-2 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════ MOBILE SIDEBAR DRAWER ════════ */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <span className="font-semibold text-sm text-neutral-900">Filtres</span>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">
          <SidebarContent />
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AllProductsContent />
    </Suspense>
  );
}
