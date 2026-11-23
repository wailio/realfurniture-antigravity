import React from 'react';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { products, formatPrice, Product } from '@/lib/products';
import { ProductDetailShowcase } from '@/components/product-detail-showcase';
import { Heart } from 'lucide-react';
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  let product: Product | undefined = products.find(
    (p) => String(p.id) === resolvedParams.id || (p as any).slug === resolvedParams.id
  );

  if (!product) {
    try {
      const { url, key } = getSupabaseConfig();
      const res = await fetch(
        `${url}/rest/v1/products?or=(id.eq.${resolvedParams.id},slug.eq.${resolvedParams.id})&limit=1`,
        { headers: supabaseHeaders(key) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const category = item.category || 'sofas';
          const defaultImg =
            category === 'salle-a-manger'
              ? '/products/salle/sallesmanger.jpg'
              : category === 'chambres'
              ? '/products/chambre/chmbr.jpg'
              : category === 'armoire'
              ? '/products/armoire/armo.jpg'
              : category === 'accessories'
              ? '/products/accessoire/other.jpg'
              : '/products/salon/couch.jpg';

          const rawImgs =
            item.images && item.images.length > 0 ? item.images : [defaultImg];
          const oldPattern = /\/(aa|bb|cc|dd|ee|ff|gg|hh|ii|11|22|33|44|55|66|77|88|99|ar1|ar2|ar3|acc1|acc2|-[1-9]|-[1-9][0-9])\.jpg$/i;
          const sanitizedImgs = rawImgs.map((img: string) => (!img || oldPattern.test(img)) ? defaultImg : img);
          const imgs = sanitizedImgs.length >= 4 
            ? sanitizedImgs 
            : sanitizedImgs.length === 2 
            ? [...sanitizedImgs, ...sanitizedImgs] 
            : sanitizedImgs.length === 3 
            ? [...sanitizedImgs, sanitizedImgs[0]] 
            : [sanitizedImgs[0], sanitizedImgs[0], sanitizedImgs[0], sanitizedImgs[0]];

          product = {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            originalPrice: item.sale_price || undefined,
            image: imgs[0],
            images: imgs,
            category: category,
            brand: "M&F Meubles",
          };
        }
      }
    } catch {}
  }
  
  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const fallbackProducts = relatedProducts.length > 0 
    ? relatedProducts 
    : products.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#111827] font-sans">
      <Header theme="light" />
      
      {/* ── Breadcrumb Bar ── */}
      <div className="pt-24 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/all-products" className="hover:text-neutral-900 transition-colors">Catalogue</Link>
          <span>/</span>
          <span className="text-neutral-900 truncate max-w-[220px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Main Showcase ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <ProductDetailShowcase product={product} />

        {/* ── Collection Info Card ── */}
        <LuxuryReveal delay={0} className="mb-14">
          <div className="bg-[#F8F9FA] border border-neutral-200/80 p-6 md:p-10 rounded-3xl">
            <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 tracking-tight">
              À propos du modèle {product.name}
            </h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-3">
              {product.description ||
                `${product.name} aux lignes contemporaines, confectionné avec des matières nobles pour composer un intérieur chaleureux et intemporel.`}
            </p>
            <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">
              Chaque pièce est ajustée et contrôlée dans nos ateliers avant expédition. Vous pouvez personnaliser les dimensions, le tissu et les coloris sur simple demande lors de votre commande.
            </p>
          </div>
        </LuxuryReveal>

        {/* ── Related Products ── */}
        {fallbackProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                Modèles <span className="font-serif italic font-light text-neutral-600">Similaires</span>
              </h2>
              <Link href="/all-products" className="text-xs font-semibold text-neutral-900 hover:underline">
                Voir tout le catalogue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {fallbackProducts.map((relProduct, idx) => (
                <LuxuryReveal key={relProduct.id} delay={idx * 30}>
                  <Link href={`/product/${relProduct.id}`} className="group block">
                    <div className="bg-[#F8F9FA] border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-neutral-400 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                      {/* Image Box */}
                      <div className="relative aspect-[4/3] w-full bg-[#F0F0F2] overflow-hidden">
                        {relProduct.discount && (
                          <div className="absolute top-2 left-2 bg-neutral-900 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
                            -{relProduct.discount}%
                          </div>
                        )}
                        <img 
                          src={relProduct.image} 
                          alt={relProduct.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                            {relProduct.category || "Mobilier"}
                          </p>
                          <h3 className="text-xs font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                            {relProduct.name}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-neutral-200/60 mt-2">
                          <span className="text-xs font-bold text-neutral-900">
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
      </section>

      {/* ── Bottom Category Exploration Bar ── */}
      <div className="w-full bg-[#F8F9FA] border-t border-neutral-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-4">
            Explorer nos univers
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {[
              { label: 'Tous les Meubles', href: '/all-products' },
              { label: 'Salons & Canapés', href: '/all-products?category=sofas' },
              { label: 'Salles à Manger', href: '/all-products?category=salle-a-manger' },
              { label: 'Chambres & Suites', href: '/all-products?category=chambres' },
              { label: 'Armoires & Dressings', href: '/all-products?category=armoire' },
              { label: 'Tables & Déco', href: '/all-products?category=accessories' },
            ].map((cat) => (
              <Link 
                key={cat.label} 
                href={cat.href} 
                className="px-4 py-2 rounded-full font-medium text-xs bg-white text-neutral-800 hover:bg-neutral-900 hover:text-white border border-neutral-200 shadow-sm transition-all"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
