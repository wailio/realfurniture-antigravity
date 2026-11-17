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

  // Touch swipe support for mobile
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

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

  // Automatic spinning loop: glides every 2s with smooth slow motion, pauses on hover
  useEffect(() => {
    if (isStageHovered) return;
    const timer = setTimeout(() => {
      advanceSpin();
    }, 2000);

    return () => clearTimeout(timer);
  }, [centerSlot, advanceSpin, isStageHovered]);

  // Floor Shadow Transforms: projects dark physical contact shadow under each 3D card
  const getFloorShadowTransform = (slotIdx: number) => {
    const offset = (slotIdx - centerSlot + 5) % 5;
    const pos = offset > 2 ? offset - 5 : offset;
    const isHovered = hoveredSlot === slotIdx;

    switch (pos) {
      case 0:
        return {
          transform: `translateX(0px) translateY(${isHovered ? '208px' : '200px'}) translateZ(60px) rotateX(76deg) scale(${
            isHovered ? 1.25 : 1.15
          })`,
          zIndex: 10,
          opacity: 0.9,
        };
      case 1:
        return {
          transform: `translateX(205px) translateY(${isHovered ? '194px' : '188px'}) translateZ(-20px) rotateX(76deg) rotateZ(-12deg) scale(${
            isHovered ? 1.05 : 0.95
          })`,
          zIndex: 8,
          opacity: 0.65,
        };
      case -1:
        return {
          transform: `translateX(-205px) translateY(${isHovered ? '194px' : '188px'}) translateZ(-20px) rotateX(76deg) rotateZ(12deg) scale(${
            isHovered ? 1.05 : 0.95
          })`,
          zIndex: 8,
          opacity: 0.65,
        };
      case 2:
        return {
          transform: `translateX(385px) translateY(${isHovered ? '184px' : '178px'}) translateZ(-70px) rotateX(76deg) rotateZ(-20deg) scale(${
            isHovered ? 0.9 : 0.8
          })`,
          zIndex: 5,
          opacity: 0.45,
        };
      case -2:
        return {
          transform: `translateX(-385px) translateY(${isHovered ? '184px' : '178px'}) translateZ(-70px) rotateX(76deg) rotateZ(20deg) scale(${
            isHovered ? 0.9 : 0.8
          })`,
          zIndex: 5,
          opacity: 0.45,
        };
      default:
        return {
          transform: 'translateX(0px) scale(0)',
          zIndex: 0,
          opacity: 0,
        };
    }
  };

  // Smooth positioning with light zoom animation on mouse hover (no shape distortion)
  const getCardTransform = (slotIdx: number) => {
    const offset = (slotIdx - centerSlot + 5) % 5;
    const pos = offset > 2 ? offset - 5 : offset;
    const isHovered = hoveredSlot === slotIdx;

    switch (pos) {
      case 0:
        // CENTER: Facing front, prominent, soft floating elevation on hover
        return {
          transform: `translateX(0px) translateY(${isHovered ? '2px' : '8px'}) translateZ(80px) rotateY(0deg) scale(${
            isHovered ? 1.15 : 1.10
          })`,
          zIndex: isHovered ? 40 : 35,
          opacity: 1,
          boxShadow: isHovered
            ? '0 36px 80px -12px rgba(0,0,0,0.65), 0 16px 30px -8px rgba(0,0,0,0.45), 0 0 1px 1px rgba(0,0,0,0.1)'
            : '0 28px 65px -12px rgba(0,0,0,0.55), 0 14px 24px -8px rgba(0,0,0,0.35), 0 0 1px 1px rgba(0,0,0,0.08)',
        };

      case 1:
        // MID RIGHT: Tilted inward, lifted higher vertically
        return {
          transform: `translateX(205px) translateY(${isHovered ? '-18px' : '-12px'}) translateZ(-20px) rotateY(-18deg) scale(${
            isHovered ? 0.97 : 0.92
          })`,
          zIndex: isHovered ? 30 : 25,
          opacity: 0.95,
          boxShadow: isHovered
            ? '0 24px 50px -10px rgba(0,0,0,0.5), 0 10px 20px -6px rgba(0,0,0,0.3)'
            : '0 18px 38px -10px rgba(0,0,0,0.42), 0 8px 16px -6px rgba(0,0,0,0.25)',
        };

      case -1:
        // MID LEFT: Tilted inward, lifted higher vertically
        return {
          transform: `translateX(-205px) translateY(${isHovered ? '-18px' : '-12px'}) translateZ(-20px) rotateY(18deg) scale(${
            isHovered ? 0.97 : 0.92
          })`,
          zIndex: isHovered ? 30 : 25,
          opacity: 0.95,
          boxShadow: isHovered
            ? '0 24px 50px -10px rgba(0,0,0,0.5), 0 10px 20px -6px rgba(0,0,0,0.3)'
            : '0 18px 38px -10px rgba(0,0,0,0.42), 0 8px 16px -6px rgba(0,0,0,0.25)',
        };

      case 2:
        // FAR RIGHT: Tilted inward
        return {
          transform: `translateX(385px) translateY(${isHovered ? '10px' : '16px'}) translateZ(-80px) rotateY(-28deg) scale(${
            isHovered ? 0.85 : 0.80
          })`,
          zIndex: isHovered ? 20 : 15,
          opacity: 0.85,
          boxShadow: isHovered
            ? '0 18px 36px -8px rgba(0,0,0,0.42)'
            : '0 12px 26px -8px rgba(0,0,0,0.35)',
        };

      case -2:
        // FAR LEFT: Tilted inward
        return {
          transform: `translateX(-385px) translateY(${isHovered ? '10px' : '16px'}) translateZ(-80px) rotateY(28deg) scale(${
            isHovered ? 0.85 : 0.80
          })`,
          zIndex: isHovered ? 20 : 15,
          opacity: 0.85,
          boxShadow: isHovered
            ? '0 18px 36px -8px rgba(0,0,0,0.42)'
            : '0 12px 26px -8px rgba(0,0,0,0.35)',
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
    <section className="relative w-full py-12 md:py-18 overflow-hidden bg-white flex flex-col items-center justify-center">

      {/* ── Background: warm scene, tightly masked behind cards only ── */}
      {/*    Mask is a narrow ellipse centred on the card stage.          */}
      {/*    Solid core → very long feather → fully transparent on edges. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          maskImage: [
            /* horizontal fade: solid 25%→transparent 72% each side */
            'linear-gradient(to right,  transparent 0%, black 24%, black 76%, transparent 100%)',
            /* vertical fade: start showing from 10%, gone by 95% */
            'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)',
          ].join(', '),
          WebkitMaskImage: [
            'linear-gradient(to right,  transparent 0%, black 24%, black 76%, transparent 100%)',
            'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)',
          ].join(', '),
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
        }}
      >
        <img
          src="/images/harmonie-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.38 }}
        />

        {/* ── Animated sunlight rays inside image area ── */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1200 600"
            style={{ mixBlendMode: 'multiply' }}
          >
            <defs>
              <linearGradient id="ray1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,220,160,0)" />
                <stop offset="40%" stopColor="rgba(255,220,160,0.20)" />
                <stop offset="60%" stopColor="rgba(255,220,160,0.15)" />
                <stop offset="100%" stopColor="rgba(255,220,160,0)" />
              </linearGradient>
              <linearGradient id="ray2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,210,140,0)" />
                <stop offset="50%" stopColor="rgba(255,210,140,0.10)" />
                <stop offset="100%" stopColor="rgba(255,210,140,0)" />
              </linearGradient>
              <linearGradient id="shadow1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(80,50,20,0)" />
                <stop offset="45%" stopColor="rgba(80,50,20,0.10)" />
                <stop offset="55%" stopColor="rgba(80,50,20,0.08)" />
                <stop offset="100%" stopColor="rgba(80,50,20,0)" />
              </linearGradient>
              <linearGradient id="shadow2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(80,50,20,0)" />
                <stop offset="50%" stopColor="rgba(80,50,20,0.06)" />
                <stop offset="100%" stopColor="rgba(80,50,20,0)" />
              </linearGradient>
            </defs>
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="translate"
                values="-160,-70; 100,55; -160,-70" dur="38s" repeatCount="indefinite"
                calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
              <polygon points="150,-40 480,-40 1000,640 670,640" fill="url(#ray1)" />
              <polygon points="260,-40 370,-40 880,640 770,640" fill="url(#ray1)" opacity="0.5" />
            </g>
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="translate"
                values="-70,-35; 160,90; -70,-35" dur="52s" repeatCount="indefinite"
                calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
              <polygon points="500,-40 630,-40 1160,640 1030,640" fill="url(#ray2)" />
            </g>
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="translate"
                values="-160,-70; 100,55; -160,-70" dur="38s" repeatCount="indefinite"
                calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
              <polygon points="400,-40 435,-40 955,640 920,640" fill="url(#shadow1)" />
              <polygon points="300,-40 328,-40 848,640 820,640" fill="url(#shadow2)" />
              <polygon points="468,-40 492,-40 1012,640 988,640" fill="url(#shadow2)" />
            </g>
            <rect width="1200" height="600" fill="rgba(255,200,120,0)">
              <animate attributeName="fill"
                values="rgba(255,200,120,0);rgba(255,200,120,0.04);rgba(255,200,120,0)"
                dur="22s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      </div>

      {/* Warm glow ground — only under the card stage, very soft */}
      <div
        className="pointer-events-none absolute z-[1]"
        style={{
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(195,145,90,0.13) 0%, rgba(195,145,90,0.05) 55%, transparent 80%)',
        }}
      />

      {/* Section Header */}
      <div className="relative text-center mb-1 md:mb-3 px-4 z-10">
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[2.5px] text-neutral-400 block mb-1">
          Showroom Virtuel 360°
        </span>
        <h2 className="font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl text-neutral-900 tracking-tight">
          L&apos;Harmonie des Formes &amp;{' '}
          <span className="font-sans font-extrabold not-italic text-neutral-950">
            des Matières
          </span>
        </h2>
      </div>

      {/* 3D Arc Stage with pause on hover */}
      <div 
        onMouseEnter={() => setIsStageHovered(true)}
        onMouseLeave={() => { setIsStageHovered(false); setHoveredSlot(null); }}
        onTouchStart={(e) => {
          touchStartX.current = e.targetTouches[0].clientX;
          touchStartY.current = e.targetTouches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const dx = touchStartX.current - e.changedTouches[0].clientX;
          const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
          if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
            if (dx > 0) {
              advanceSpin();
            } else {
              setCenterSlot((prev) => (prev - 1 + 5) % 5);
            }
          }
        }}
        className="relative w-full max-w-[1280px] xl:max-w-[1380px] h-[450px] md:h-[490px] lg:h-[520px] flex items-center justify-center [perspective:1200px] scale-[0.78] sm:scale-[0.88] md:scale-[0.98] lg:scale-[1.04] xl:scale-[1.08] transition-transform duration-300"
      >
        {/* ── Luxury Dark Ambient Floor Effects Under the Shapes ── */}
        {/* Deep soft elliptical stage shadow */}
        <div className="pointer-events-none absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 w-[86%] max-w-[1100px] h-[140px] md:h-[180px] bg-[radial-gradient(ellipse_at_center,rgba(10,13,20,0.28)_0%,rgba(10,13,20,0.12)_45%,transparent_75%)] blur-2xl" />
        {/* Core contact darkness directly under the cards line */}
        <div className="pointer-events-none absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[65%] max-w-[780px] h-[70px] md:h-[100px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.15)_48%,transparent_72%)] blur-xl" />

        {/* Dynamic 3D Floor Contact Shadows for Each Individual Floating Card */}
        {CATEGORY_SLOTS.map((cat, slotIdx) => {
          const shadowStyle = getFloorShadowTransform(slotIdx);
          return (
            <div
              key={`shadow-${cat.slug}`}
              style={{
                transform: shadowStyle.transform,
                zIndex: shadowStyle.zIndex,
                opacity: shadowStyle.opacity,
              }}
              className="absolute top-1/2 left-1/2 -ml-[120px] w-[240px] pointer-events-none transition-all duration-900 md:duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <div className="w-full h-[32px] rounded-[100%] bg-neutral-950/45 blur-lg" />
              <div className="w-[75%] h-[16px] -mt-[24px] mx-auto rounded-[100%] bg-black/60 blur-md" />
            </div>
          );
        })}

        {/* 3D Floating Cards */}
        {CATEGORY_SLOTS.map((cat, slotIdx) => {
          const pool = categoryProductsMap.current[cat.slug] || [];
          const pointer = productPointers[slotIdx] % (pool.length || 1);
          const product = pool[pointer] || products[0];
          const isHovered = hoveredSlot === slotIdx;
          const isCenter = (slotIdx - centerSlot + 5) % 5 === 0;
          const cardStyle = getCardTransform(slotIdx);

          return (
            <Link
              key={cat.slug}
              href={`/all-products?category=${cat.slug}`}
              scroll={false}
              style={{
                ...cardStyle,
                borderRadius: 24,
                clipPath: 'inset(0 round 24px)',
                WebkitClipPath: 'inset(0 round 24px)',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              }}
              onMouseEnter={() => setHoveredSlot(slotIdx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className={`absolute top-1/2 left-1/2 -mt-[195px] -ml-[130px] w-[260px] h-[390px] rounded-[24px] overflow-hidden transition-all duration-900 md:duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] select-none bg-neutral-950 border cursor-pointer group block ${
                isCenter ? 'ring-1 ring-black/10' : ''
              } ${
                isHovered ? 'border-neutral-900/60' : 'border-neutral-200/60'
              }`}
            >
              {/* Product Background Image with light zoom on hover */}
              <div 
                className="relative w-full h-full overflow-hidden rounded-[24px]"
                style={{
                  borderRadius: 24,
                  clipPath: 'inset(0 round 24px)',
                  WebkitClipPath: 'inset(0 round 24px)',
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[24px] transition-transform duration-1000 ease-out group-hover:scale-106"
                  draggable={false}
                  style={{
                    borderRadius: 24,
                    clipPath: 'inset(0 round 24px)',
                    WebkitClipPath: 'inset(0 round 24px)',
                  }}
                />

                {/* Rich dark bottom gradient for high contrast & luxury presence */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-45% to-transparent pointer-events-none rounded-[24px]"
                  style={{ borderRadius: 24 }}
                />

                {/* Subtle top dark vignette so the category pill floats elegantly */}
                <div 
                  className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none rounded-[24px]"
                  style={{ borderRadius: 24 }}
                />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-block bg-white/95 backdrop-blur-md border border-neutral-200/80 px-3 py-1 rounded-full text-[10px] font-bold text-neutral-900 uppercase tracking-[1.5px] shadow-sm">
                    {cat.categoryLabel}
                  </span>
                </div>

                {/* Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex items-end justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-sans text-xs font-bold text-white uppercase tracking-wider truncate mb-1">
                      THE &quot;{product.name.replace(/^(Salon|Chambre|Salle à manger|Armoire|Meuble TV|Fauteuil|Suite Lit)\s*/i, '')}&quot;
                    </p>
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="text-xs font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-white/60 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Circular explore button */}
                  <div
                    className="w-8 h-8 rounded-full bg-white text-neutral-950 flex items-center justify-center font-bold flex-shrink-0 shadow-md group-hover:scale-110 group-hover:bg-[#111827] group-hover:text-white transition-all duration-300"
                    aria-label={`Voir la collection ${cat.categoryLabel}`}
                  >
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Elegant Category Navigation Indicator Pills */}
      <div className="relative mt-2 md:mt-4 flex items-center gap-2 z-20">
        {CATEGORY_SLOTS.map((cat, idx) => {
          const isActive = idx === centerSlot;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCenterSlot(idx)}
              className={`h-1.5 rounded-full transition-all duration-700 ease-out cursor-pointer ${
                isActive
                  ? 'w-7 bg-[#5C3D22] shadow-sm'
                  : 'w-2 bg-[#8B6246]/50 hover:bg-[#5C3D22]/70'
              }`}
              aria-label={`Afficher la catégorie ${cat.categoryLabel}`}
            />
          );
        })}
      </div>
    </section>
  );
}
