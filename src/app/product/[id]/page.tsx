import React from 'react';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { products, formatPrice } from '@/lib/products';
import { ProductDetailShowcase } from '@/components/product-detail-showcase';
import { ChevronRight, Heart } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = products.find((p) => p.id === Number(resolvedParams.id));
  
  if (!product) {
    notFound();
  }

  // Related products from same category or fallback to other products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  const fallbackProducts = relatedProducts.length > 0 
    ? relatedProducts 
    : products.filter((p) => p.id !== product.id).slice(0, 5);

  return (
    <main className="min-h-screen bg-[#0E0F10] text-[#F2F1EF]">
      <Header theme="dark" />
      
      {/* ── Breadcrumb Bar ── */}
      <div className="pt-28 md:pt-40 pb-4 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs md:text-sm font-sora text-[#71717A]">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span className="text-white/30">›</span>
          <Link href="/all-products" className="hover:text-white transition-colors">Produits</Link>
          <span className="text-white/30">›</span>
          <span className="text-[#b68d40] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Main Showcase ── */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pb-12">
        <ProductDetailShowcase product={product} />

        {/* ── À propos de la collection Card (matching reference with Reveal delay 0ms) ── */}
        <LuxuryReveal delay={0} className="mb-12 md:mb-16">
          <div className="bg-[#141518] border border-white/10 p-4 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-base md:text-lg font-fraunces font-bold text-white mb-3 tracking-wide">
              À propos de la collection {product.name}
            </h2>
            <p className="text-[#D1D5DB] text-xs md:text-sm leading-relaxed mb-3 font-sora">
              {product.description ||
                `${product.name} aux lignes élégantes, confectionnée avec des matières de premier choix pour composer un intérieur harmonieux.`}
            </p>
            <p className="text-[#A1A1AA] text-xs md:text-sm leading-relaxed font-sora">
              Ses lignes structurées, ses finitions soignées et ses rangements généreux composent un ensemble durable, conçu pour accompagner votre quotidien avec confort et élégance.
            </p>
          </div>
        </LuxuryReveal>

        {/* ── Related Products Carousel (matching reference with staggered Reveal) ── */}
        {fallbackProducts.length > 0 && (
          <div className="mb-12 md:mb-16">
            <div className="mb-4 md:mb-6">
              <h2 className="inline-block border-b border-[#b68d40] px-1 pb-2 text-base md:text-xl font-fraunces font-semibold tracking-wide text-white shadow-[0_2px_3px_-2px_rgba(182,141,64,0.45)]">
                RELATED PRODUCTS
              </h2>
            </div>

            <div 
              className="flex gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide touch-pan-x"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {fallbackProducts.map((relProduct, idx) => (
                <LuxuryReveal key={relProduct.id} delay={idx * 100}>
                  <Link href={`/product/${relProduct.id}`}>
                    <div className="group flex-shrink-0 w-32 md:w-44 bg-[#141518] border border-white/10 rounded-lg overflow-hidden hover:border-[#b68d40]/60 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full">
                      {/* Image Box */}
                      <div className="relative aspect-square w-full bg-[#1A1C1E] overflow-hidden rounded-t-lg">
                        {relProduct.discount && (
                          <div className="absolute top-1.5 left-1.5 bg-[#b68d40] text-black px-1.5 py-0.5 rounded-none text-[10px] font-bold z-10">
                            -{relProduct.discount}%
                          </div>
                        )}
                        <img 
                          src={relProduct.image} 
                          alt={relProduct.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div 
                          aria-hidden="true"
                          className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md rounded-full p-1.5 hover:bg-[#b68d40] text-white hover:text-black transition-colors"
                        >
                          <Heart size={13} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between font-sora">
                        <div>
                          <p className="text-[8px] md:text-[9px] text-[#b68d40] uppercase tracking-wider font-semibold mb-0.5">
                            {relProduct.brand || "Château d'art"}
                          </p>
                          <h3 className="text-[10px] md:text-xs font-bold text-white line-clamp-2 leading-snug">
                            {relProduct.name}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-white/10 mt-2">
                          <span className="text-[10px] md:text-xs font-bold text-[#f4d79a]">
                            {formatPrice(relProduct.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </LuxuryReveal>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Category Exploration Chips (matching Mobenia reference with Reveal delay 150ms) ── */}
        <div className="pt-8 md:pt-12 border-t border-white/10">
          <LuxuryReveal delay={150}>
            <div className="flex flex-wrap gap-2 md:gap-3 p-4 md:p-6 bg-[#141518] rounded-xl border border-white/10 shadow-sm justify-center">
              {[
                { label: 'Tous les Produits', href: '/all-products' },
                { label: 'Salle à manger', href: '/all-products?category=salle-a-manger' },
                { label: 'Canapés', href: '/all-products?category=sofas' },
                { label: 'Chambres', href: '/all-products?category=chambres' },
                { label: 'Armoire', href: '/all-products?category=armoire' },
                { label: 'Accessoires', href: '/all-products?category=accessories' },
              ].map((cat) => (
                <Link key={cat.label} href={cat.href} className="px-3 md:px-5 py-1.5 md:py-2 rounded-lg font-sora font-medium transition-all duration-300 text-xs md:text-sm bg-[#0E0F10] text-[#f4d79a] hover:bg-[#b68d40] hover:text-black border border-white/15 hover:border-[#b68d40] whitespace-nowrap shadow-sm inline-block">
                  {cat.label}
                </Link>
              ))}
            </div>
          </LuxuryReveal>
        </div>

      </section>

      <Footer />
    </main>
  );
}
