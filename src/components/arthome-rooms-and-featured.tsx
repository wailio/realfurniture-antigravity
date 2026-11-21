'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';
import { LuxuryReveal } from '@/components/luxury-reveal';

interface ArtHomeRoomsAndFeaturedProps {
  products: Product[];
}

const ROOMS = [
  {
    title: 'Salle à Manger',
    count: 56,
    image: '/arthome-rooms/dining-room.jpg',
    slug: 'salle-a-manger',
  },
  {
    title: 'Chambre à Coucher',
    count: 2,
    image: '/arthome-rooms/bedroom.jpg',
    slug: 'chambres',
  },
  {
    title: 'Espace Extérieur',
    count: 1,
    image: '/arthome-rooms/outdoor.jpg',
    slug: 'accessories',
  },
  {
    title: 'Salon & Séjour',
    count: 97,
    image: '/arthome-rooms/living-room.jpg',
    slug: 'sofas',
  },
];

export function ArtHomeRoomsAndFeatured({ products }: ArtHomeRoomsAndFeaturedProps) {
  // 5 products per line x 3 lines = exactly 15 products
  const featured15 = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length >= 15) return products.slice(0, 15);
    // Pad with products to reach 15 if needed
    const padded: Product[] = [...products];
    let i = 0;
    while (padded.length < 15) {
      padded.push({
        ...products[i % products.length],
        id: products[i % products.length].id * 1000 + padded.length,
      });
      i++;
    }
    return padded;
  }, [products]);

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── PART 1: Explorer par Pièce (Exact Art Home Furniture dimensions & placement) ── */}
        <div className="mb-5 sm:mb-6">
          <h3 className="font-sans text-[22px] sm:text-[24px] md:text-[26px] font-normal text-[#212529] tracking-normal">
            Explorer par Pièce
          </h3>
        </div>

        {/* 4 Room Cards Grid (columns-4 on desktop, gap-15px matching Art Home) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
          {ROOMS.map((room, idx) => (
            <LuxuryReveal key={room.title} delay={idx * 60}>
              <Link
                href={`/all-products?category=${room.slug}`}
                className="group block text-center cursor-pointer"
              >
                {/* 300px exact height image wrap matching Art Home Furniture */}
                <div className="w-full h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden bg-neutral-100 relative mb-[14px] rounded-none">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-106 select-none"
                    loading="lazy"
                  />
                </div>

                {/* Room Title matching Art Home (count hidden with display:none / font-size:0) */}
                <h4 className="font-sans text-[17px] sm:text-[18px] md:text-[20px] font-normal text-[#212529] group-hover:text-black transition-colors">
                  {room.title}
                </h4>
              </Link>
            </LuxuryReveal>
          ))}
        </div>

        {/* ── PART 2: NOS CRÉATIONS DU MOMENT ── */}
        {/* Matching exact typography duel from 'Explorer par Catégorie' */}
        <div className="mt-16 sm:mt-20 md:mt-24 mb-6 sm:mb-8 flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/70 shadow-2xs mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1aa5c]" />
              <span className="text-[10px] md:text-[10.5px] uppercase tracking-[2.5px] text-neutral-600 font-semibold">
                Catalogue Sélectif
              </span>
            </div>
            <h3 className="font-serif italic font-normal text-2xl sm:text-3xl md:text-[30px] text-neutral-900 tracking-tight leading-tight">
              NOS CRÉATIONS{' '}
              <span className="font-sans font-extrabold not-italic text-neutral-950">
                DU MOMENT
              </span>
            </h3>
          </div>

          <Link
            href="/all-products"
            className="text-xs sm:text-[13px] font-medium text-neutral-500 hover:text-black uppercase tracking-wider transition-colors pb-1"
          >
            Voir tout &rarr;
          </Link>
        </div>

        {/* 5 products per line grid (larger product cards, 3 lines of 5 = 15 products) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 sm:gap-x-6 gap-y-9 sm:gap-y-12">
          {featured15.map((product, idx) => (
            <LuxuryReveal key={product.id} delay={Math.min(idx * 40, 400)}>
              <div className="group relative flex flex-col justify-between text-left h-full">
                
                {/* 1:1 Aspect Ratio Square Image Thumbnail (Slightly larger with 5-column layout) */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#FBFBFA] border border-neutral-100 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106 select-none"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {product.discount && (
                    <span className="absolute top-2.5 left-2.5 bg-[#212529] text-white text-[9.5px] font-semibold px-2 py-0.5 rounded-none shadow-xs">
                      -{product.discount}%
                    </span>
                  )}

                  {/* Clickable Overlay Link */}
                  <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={product.name}
                  />
                </div>

                {/* Product Title & Price */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product.id}`} className="block group/title">
                      <h4 className="text-[13.5px] sm:text-[14.5px] font-medium text-[#212529] line-clamp-1 group-hover/title:text-[#d1aa5c] transition-colors leading-snug">
                        {product.name}
                      </h4>
                    </Link>
                    <span className="block text-xs sm:text-[13px] font-normal text-neutral-600 mt-0.5">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Sharp Edged Button under each product card */}
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.image)}&id=${encodeURIComponent(String(product.id))}&subject=${encodeURIComponent(`Commande: ${product.name}`)}#contact-form`}
                    className="mt-3.5 block w-full py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-center rounded-none border border-neutral-300 text-neutral-800 hover:border-[#212529] hover:bg-[#212529] hover:text-white transition-all duration-200 active:scale-98 cursor-pointer shadow-2xs"
                  >
                    Commander
                  </Link>
                </div>

              </div>
            </LuxuryReveal>
          ))}
        </div>

        {/* Sharp edged, Dark Glassy colored Catalog CTA button */}
        <div className="mt-14 md:mt-20 text-center">
          <Link
            href="/all-products"
            className="group inline-flex items-center gap-3 bg-[#0f1117]/85 hover:bg-[#161822]/95 backdrop-blur-xl border border-white/20 hover:border-white/40 text-white px-9 py-4 rounded-none text-xs font-bold uppercase tracking-[2px] transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.25)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.35)] active:scale-98"
          >
            <span>Voir tout le catalogue complet</span>
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ArtHomeRoomsAndFeatured;
