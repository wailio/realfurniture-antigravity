'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { Sparkles } from 'lucide-react';

interface CategoryItem {
  slug: string;
  label: string;
  aliases: string[];
}

const CATEGORIES_CONFIG: CategoryItem[] = [
  { slug: 'all', label: 'Tous les modèles', aliases: ['all', 'tous', 'tout'] },
  { slug: 'salle-a-manger', label: 'Salle à manger', aliases: ['salle-a-manger', 'salle', 'salles', 'table', 'tables'] },
  { slug: 'sofas', label: 'Canapés & Salons', aliases: ['sofas', 'sofa', 'canapes', 'canape', 'salon', 'salons'] },
  { slug: 'chambres', label: 'Chambres', aliases: ['chambres', 'chambre', 'lit', 'lits'] },
  { slug: 'armoire', label: 'Armoires', aliases: ['armoire', 'armoires', 'dressing'] },
  { slug: 'accessories', label: 'Accessoires', aliases: ['accessories', 'accessoire', 'accessoires', 'deco', 'decoration'] },
];

function resolveCategorySlug(raw: string | null): string {
  if (!raw) return 'all';
  const clean = raw.trim().toLowerCase();
  for (const c of CATEGORIES_CONFIG) {
    if (c.slug === clean || c.label.toLowerCase() === clean || c.aliases.includes(clean)) {
      return c.slug;
    }
  }
  return 'all';
}

function AllProductsContent() {
  const searchParams = useSearchParams();
  const rawParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string>(() => resolveCategorySlug(rawParam));

  useEffect(() => {
    const param = searchParams.get('category');
    if (param) {
      const resolved = resolveCategorySlug(param);
      setActiveCategory(resolved);
      
      // Smooth scroll to the products filter tabs if coming directly from another section
      setTimeout(() => {
        const target = document.getElementById('products-filter-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  }, [searchParams]);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header theme="dark" />
      
      {/* ── Page Hero ── */}
      <section className="pt-28 pb-14 md:pt-40 md:pb-20 bg-gradient-to-b from-[#141518] to-[#0E0F10] text-center px-4">
        <LuxuryReveal>
          <span className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 rounded-none text-xs uppercase tracking-[3px] text-[#b68d40] mb-4 font-sora font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalogue Officiel</span>
          </span>
          <h1 className="font-fraunces font-light text-4xl md:text-6xl text-white tracking-wide mb-4">
            Toutes Nos Créations
          </h1>
          <div className="flex justify-center w-full mb-4">
            <svg width="120" height="2" viewBox="0 0 120 2" fill="none" xmlns="http://www.w3.org/2000/svg" className="heading-underline">
              <path d="M0 1H120" stroke="#b68d40" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-[#A1A1AA] font-sora text-sm md:text-base max-w-xl mx-auto">
            Explorez l&apos;ensemble de nos gammes, façonnées avec les matières les plus nobles pour vos espaces d&apos;exception.
          </p>
        </LuxuryReveal>
      </section>

      {/* ── Filter Tabs & Count ── */}
      <section id="products-filter-section" className="w-full px-4 mb-8 scroll-mt-28">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 md:gap-3 max-w-full pb-2 scrollbar-hide">
            {CATEGORIES_CONFIG.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-5 py-2.5 rounded-sm font-sora text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#b68d40] text-white font-bold shadow-md'
                      : 'bg-[#121316] text-[#A1A1AA] hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <span className="text-xs text-[#71717A] font-sora tracking-wide">
            Affichage de <strong className="text-white">{filteredProducts.length}</strong> pièce{filteredProducts.length > 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {filteredProducts.map((product, idx) => (
                <LuxuryReveal key={product.id} delay={idx * 50} className="w-full">
                  <ProductCard product={product} className="w-full" />
                </LuxuryReveal>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="font-fraunces text-2xl text-white">Aucun modèle dans cette catégorie pour le moment.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="px-6 py-2.5 bg-[#b68d40] text-white text-xs uppercase tracking-wider font-bold"
              >
                Voir tous les produits
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E0F10]" />}>
      <AllProductsContent />
    </Suspense>
  );
}
