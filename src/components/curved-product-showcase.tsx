'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { products, Product, formatPrice } from '@/lib/products';

interface CategorySlot {
  slug: string;
  categoryLabel: string;
}

const CATEGORY_SLOTS: CategorySlot[] = [
  { slug: 'salle-a-manger', categoryLabel: 'SALLE À MANGER' },
  { slug: 'sofas', categoryLabel: 'SALON & CANAPÉ' },
  { slug: 'chambres', categoryLabel: 'CHAMBRE' },
  { slug: 'armoire', categoryLabel: 'ARMOIRE' },
  { slug: 'accessories', categoryLabel: 'ACCESSOIRES' },
];

export function CurvedProductShowcase() {
  // Categorized product pools
  const categoryProductsMap = useRef<Record<string, Product[]>>({});
  
  if (Object.keys(categoryProductsMap.current).length === 0) {
    CATEGORY_SLOTS.forEach((cat) => {
      const items = products.filter((p) => p.category === cat.slug);
      categoryProductsMap.current[cat.slug] = items.length > 0 ? items : products;
    });
  }

  // Pointer tracking which product index is shown for each of the 5 categories
  const [productPointers, setProductPointers] = useState<number[]>([0, 0, 0, 0, 0]);

  // Which slot is currently in the middle (0 to 4)
  const [centerSlot, setCenterSlot] = useState<number>(0);

  // Total spins count to detect full 360-degree revolutions
  const [totalSpins, setTotalSpins] = useState<number>(0);

  // Track hover to pause auto-spin and smoothly scale the hovered card
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [isStageHovered, setIsStageHovered] = useState<boolean>(false);

  // Spin to next category automatically (pauses on hover)
  const advanceSpin = useCallback(() => {
    setCenterSlot((prevSlot) => {
      const nextSlot = (prevSlot + 1) % 5;

      setTotalSpins((prevSpins) => {
        const nextSpins = prevSpins + 1;
        if (nextSpins % 5 === 0) {
          setProductPointers((prevPointers) =>
            prevPointers.map((currIdx, catIdx) => {
              const catSlug = CATEGORY_SLOTS[catIdx].slug;
              const pool = categoryProductsMap.current[catSlug] || [];
              return pool.length > 0 ? (currIdx + 1) % pool.length : 0;
            })
          );
        }
        return nextSpins;
      });

      return nextSlot;
    });
  }, []);

  // Automatic spinning loop: stays still for 4.5s, then advances unless mouse is hovering
  useEffect(() => {
    if (isStageHovered) return;
    const timer = setTimeout(() => {
      advanceSpin();
    }, 4500);

    return () => clearTimeout(timer);
  }, [centerSlot, advanceSpin, isStageHovered]);

  // Smooth positioning with light zoom animation on mouse hover (no shape distortion)
  const getCardTransform = (slotIdx: number) => {
    const offset = (slotIdx - centerSlot + 5) % 5;
    const pos = offset > 2 ? offset - 5 : offset;
    const isHovered = hoveredSlot === slotIdx;

    switch (pos) {
      case 0:
        // CENTER: Facing front, prominent, light zoom on mouse selection
        return {
          transform: `translateX(0px) translateY(${isHovered ? '4px' : '10px'}) translateZ(80px) rotateY(0deg) scale(${
            isHovered ? 1.15 : 1.10
          })`,
          zIndex: isHovered ? 40 : 35,
          opacity: 1,
          boxShadow: isHovered
            ? '0 32px 70px -10px rgba(0,0,0,0.9), 0 0 16px 2px rgba(182,141,64,0.3)'
            : '0 24px 50px -10px rgba(0,0,0,0.85), 0 0 10px 1px rgba(255,255,255,0.06)',
        };

      case 1:
        // MID RIGHT: Tilted inward, lifted higher vertically, light zoom on hover
        return {
          transform: `translateX(205px) translateY(${isHovered ? '-18px' : '-12px'}) translateZ(-20px) rotateY(-18deg) scale(${
            isHovered ? 0.97 : 0.92
          })`,
          zIndex: isHovered ? 30 : 25,
          opacity: 0.95,
          boxShadow: isHovered
            ? '0 24px 50px -8px rgba(0,0,0,0.85), 0 0 12px rgba(182,141,64,0.25)'
            : '0 18px 36px -8px rgba(0,0,0,0.75), 0 0 6px rgba(255,255,255,0.04)',
        };

      case -1:
        // MID LEFT: Tilted inward, lifted higher vertically, light zoom on hover
        return {
          transform: `translateX(-205px) translateY(${isHovered ? '-18px' : '-12px'}) translateZ(-20px) rotateY(18deg) scale(${
            isHovered ? 0.97 : 0.92
          })`,
          zIndex: isHovered ? 30 : 25,
          opacity: 0.95,
          boxShadow: isHovered
            ? '0 24px 50px -8px rgba(0,0,0,0.85), 0 0 12px rgba(182,141,64,0.25)'
            : '0 18px 36px -8px rgba(0,0,0,0.75), 0 0 6px rgba(255,255,255,0.04)',
        };

      case 2:
        // FAR RIGHT: Tilted inward, light zoom on hover
        return {
          transform: `translateX(385px) translateY(${isHovered ? '10px' : '16px'}) translateZ(-80px) rotateY(-28deg) scale(${
            isHovered ? 0.85 : 0.80
          })`,
          zIndex: isHovered ? 20 : 15,
          opacity: 0.85,
          boxShadow: isHovered
            ? '0 18px 36px -6px rgba(0,0,0,0.8), 0 0 10px rgba(182,141,64,0.2)'
            : '0 12px 26px -6px rgba(0,0,0,0.7), 0 0 4px rgba(255,255,255,0.03)',
        };

      case -2:
        // FAR LEFT: Tilted inward, light zoom on hover
        return {
          transform: `translateX(-385px) translateY(${isHovered ? '10px' : '16px'}) translateZ(-80px) rotateY(28deg) scale(${
            isHovered ? 0.85 : 0.80
          })`,
          zIndex: isHovered ? 20 : 15,
          opacity: 0.85,
          boxShadow: isHovered
            ? '0 18px 36px -6px rgba(0,0,0,0.8), 0 0 10px rgba(182,141,64,0.2)'
            : '0 12px 26px -6px rgba(0,0,0,0.7), 0 0 4px rgba(255,255,255,0.03)',
        };

      default:
        return {
          transform: 'translateX(0px) scale(0.5)',
          zIndex: 0,
          opacity: 0,
          boxShadow: 'none',
        };
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#0E0F10] via-[#121316] to-[#0E0F10] flex items-center justify-center">
      {/* 3D Arc Stage with pause on hover */}
      <div 
        onMouseEnter={() => setIsStageHovered(true)}
        onMouseLeave={() => { setIsStageHovered(false); setHoveredSlot(null); }}
        className="relative w-full max-w-[1280px] h-[480px] md:h-[540px] flex items-center justify-center [perspective:1200px] scale-[0.78] sm:scale-[0.88] md:scale-100 transition-transform duration-300"
      >
        {CATEGORY_SLOTS.map((cat, slotIdx) => {
          const pool = categoryProductsMap.current[cat.slug] || [];
          const pointer = productPointers[slotIdx] % (pool.length || 1);
          const product = pool[pointer] || products[0];
          const isHovered = hoveredSlot === slotIdx;
          const cardStyle = getCardTransform(slotIdx);

          return (
            <Link
              key={cat.slug}
              href={`/all-products?category=${cat.slug}`}
              style={cardStyle}
              onMouseEnter={() => setHoveredSlot(slotIdx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className={`absolute top-1/2 left-1/2 -mt-[210px] -ml-[130px] w-[260px] h-[390px] rounded-[24px] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] select-none bg-[#1A1C1E] border cursor-pointer group block ${
                isHovered ? 'border-[#b68d40]/70' : 'border-white/15'
              }`}
            >
              {/* Product Background Image with light zoom on hover */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                  draggable={false}
                />

                {/* Subtle dark bottom gradient so white text is crystal clear */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-block bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-none text-[10px] font-sora font-bold text-[#b68d40] uppercase tracking-[2px]">
                    {cat.categoryLabel}
                  </span>
                </div>

                {/* Bottom Overlay (uniform and consistent on all cards) */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex items-end justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-sora text-xs font-bold text-white uppercase tracking-wider truncate mb-1">
                      THE &quot;{product.name.replace(/^(Salon|Chambre|Salle à manger|Armoire|Meuble TV|Fauteuil|Suite Lit)\s*/i, '')}&quot;
                    </p>
                    <div className="flex items-center gap-1.5 font-sora">
                      <span className="text-xs font-bold text-[#f4d79a]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-white/60 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Circular explore button with light zoom */}
                  <div
                    className="w-8 h-8 rounded-none bg-[#b68d40] text-black flex items-center justify-center font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                    aria-label={`Voir la collection ${cat.categoryLabel}`}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
