'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HotspotItem {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  image: string;
  link: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface CollectionSlideItem {
  id: number;
  collectionName: string;
  bgImage: string;
  hotspots: HotspotItem[];
}

const COLLECTION_SLIDES: CollectionSlideItem[] = [
  {
    id: 1,
    collectionName: 'Living Room Collection',
    bgImage: '/arthome-collection/mf-living-room-v2.jpg',
    hotspots: [
      {
        id: 'lr-couch',
        x: 22,
        y: 55,
        title: "Canapé d'Angle Camel Prestige",
        image: '/arthome-collection/mf-canape-camel-v2.jpg',
        link: '/all-products?category=sofas',
        position: 'top',
      },
      {
        id: 'lr-table',
        x: 49,
        y: 65,
        title: 'Table Basse Gigogne Duo Chêne & Bronze',
        image: '/arthome-collection/mf-table-basse-duo-v2.png',
        link: '/all-products?category=accessories',
        position: 'top',
      },
    ],
  },
  {
    id: 2,
    collectionName: 'Salon Prestige Collection',
    bgImage: '/arthome-collection/mf-salon-prestige-v2.jpg',
    hotspots: [
      {
        id: 'dr-table',
        x: 51,
        y: 64,
        title: 'Table Basse Bronze Marbre Oxydé',
        image: '/arthome-collection/mf-table-bronze-v2.jpg',
        link: '/all-products?category=accessories',
        position: 'top',
      },
      {
        id: 'dr-lamp',
        x: 92,
        y: 48,
        title: 'Console & Lampe Laiton Prestige',
        image: '/arthome-collection/mf-console-lampe-v2.png',
        link: '/all-products?category=accessories',
        position: 'left',
      },
      {
        id: 'dr-couch',
        x: 22,
        y: 56,
        title: 'Canapé Panoramique Crème Grand Confort',
        image: '/arthome-collection/mf-canape-creme-v2.jpg',
        link: '/all-products?category=sofas',
        position: 'bottom',
      },
    ],
  },
  {
    id: 3,
    collectionName: 'Salle à Manger Collection',
    bgImage: '/arthome-collection/mf-salle-a-manger-v2.jpg',
    hotspots: [
      {
        id: 'th-table',
        x: 48,
        y: 44,
        title: 'Table Marbre Gris & Pied Chrome Spirale',
        image: '/arthome-collection/mf-table-marbre-v2.jpg',
        link: '/all-products?category=salle-a-manger',
        position: 'top',
      },
      {
        id: 'th-chair',
        x: 76,
        y: 52,
        title: 'Chaise Velours Gris Matelassée',
        image: '/arthome-collection/mf-chaise-velours-v2.jpg',
        link: '/all-products?category=salle-a-manger',
        position: 'left',
      },
      {
        id: 'th-buffet',
        x: 55,
        y: 16,
        title: 'Buffet & Miroir Prestige Billes Chromées',
        image: '/arthome-collection/mf-buffet-miroir-v2.jpg',
        link: '/all-products?category=accessories',
        position: 'bottom',
      },
    ],
  },
];

// Tripled array for endless, seamless infinite loop
const EXTENDED_SLIDES: (CollectionSlideItem & { keyId: string })[] = [
  ...COLLECTION_SLIDES.map((s) => ({ ...s, keyId: `clone-prev-${s.id}` })),
  ...COLLECTION_SLIDES.map((s) => ({ ...s, keyId: `real-${s.id}` })),
  ...COLLECTION_SLIDES.map((s) => ({ ...s, keyId: `clone-next-${s.id}` })),
];

const SLIDES_COUNT = COLLECTION_SLIDES.length; // 3

export function ArtHomeCollectionSlider() {
  // Start at index 3 (the first real slide: Living Room Collection)
  const [currentIndex, setCurrentIndex] = useState<number>(SLIDES_COUNT);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [hoveredTooltipId, setHoveredTooltipId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1400);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Measure container width for responsive slide peek
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Responsiveness:
  // Desktop: peek = 260px, gap = 32px
  // Tablet: peek = 100px, gap = 20px
  // Mobile: peek = 32px, gap = 12px
  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  const peekWidth = isMobile ? 32 : isTablet ? 100 : 260;
  const gap = isMobile ? 12 : isTablet ? 20 : 32;
  const slideWidth = Math.max(260, containerWidth - peekWidth - gap);

  // Endless loop navigation
  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setActiveTooltipId(null);
    setHoveredTooltipId(null);
  }, []);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setActiveTooltipId(null);
    setHoveredTooltipId(null);
  }, []);

  // Seamless jump without animation when reaching clone boundary
  const handleTransitionEnd = () => {
    // If we moved past the middle set to the right (index >= 6)
    if (currentIndex >= SLIDES_COUNT * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - SLIDES_COUNT);
    }
    // If we moved before the middle set to the left (index < 3)
    else if (currentIndex < SLIDES_COUNT) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + SLIDES_COUNT);
    }
  };

  // Re-enable smooth CSS transitions on next frame after silent repositioning
  useEffect(() => {
    if (!isTransitioning) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isTransitioning]);

  // Keyboard arrow controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-2 select-none">
      {/* Exact Elementor soft-beat & pulse animations */}
      <style jsx global>{`
        @keyframes arthome-soft-beat {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.18);
          }
        }
        @keyframes arthome-pulse-ring {
          0% {
            transform: scale(0.85);
            opacity: 0.95;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .arthome-soft-beat {
          animation: arthome-soft-beat 0.85s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
        .arthome-pulse-ring {
          animation: arthome-pulse-ring 2.1s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        /* Sharpen + richness without kenburns scale zoom to keep hotspots locked */
        .luxury-bg-img {
          /* Sharpen + richness: contrast pops micro-edges, saturate deepens material tones */
          filter: url(#luxury-sharpen) contrast(1.08) saturate(1.08) brightness(1.02);
          backface-visibility: hidden;
        }
      `}</style>

      {/* SVG Unsharp Mask — hidden off-screen, referenced by CSS filter: url(#luxury-sharpen) */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id="luxury-sharpen" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3"
              kernelMatrix="0 -0.5 0  -0.5 3 -0.5  0 -0.5 0"
              preserveAlpha="true"
            />
          </filter>
        </defs>
      </svg>

      {/* Slider Viewport Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-white"
      >
        {/* Slides Track: translating with endless loop support */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex bg-white ${
            isTransitioning
              ? 'transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]'
              : ''
          }`}
          style={{
            transform: `translateX(-${currentIndex * (slideWidth + gap)}px)`,
            columnGap: `${gap}px`,
            transitionProperty: isTransitioning ? 'transform' : 'none',
          }}
        >
          {EXTENDED_SLIDES.map((slide, slideIdx) => {
            return (
              <div
                key={`${slide.keyId}-${slideIdx}`}
                className="relative shrink-0 select-none"
                style={{ width: `${slideWidth}px` }}
              >
                {/* Fixed 16:9 Aspect Ratio Frame — strictly locks background canvas and hotspot coordinates on ALL devices */}
                <div className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm bg-neutral-900">
                  {/* High Definition Background Photograph Container (clipped to rounded corners) */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl pointer-events-none">
                    <img
                      src={slide.bgImage}
                      alt={slide.collectionName}
                      className="luxury-bg-img w-full h-full object-cover object-center pointer-events-none select-none"
                      draggable={false}
                    />

                    {/* Radial Vignette — mix-blend-mode:multiply so it deepens shadows organically without washing out furniture textures */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(8,6,4,0.45) 68%, rgba(2,2,2,0.78) 100%)',
                        mixBlendMode: 'multiply',
                      }}
                    />
                    {/* Bottom-to-top atmospheric lift — keeps floor/base grounded */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Text at top of each image — upgraded to champagne for luxury feel */}
                  <div className="absolute top-2.5 left-3 sm:top-5 sm:left-5 md:top-8 md:left-8 z-10 pointer-events-none">
                    <h2
                      className="font-sans font-light text-[13px] sm:text-[18px] md:text-[23px] tracking-[0.06em] leading-tight select-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                      style={{ color: '#f0ece4', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                    >
                      {slide.collectionName}
                    </h2>
                  </div>

                  {/* Hotspots: anchored to fixed 16:9 canvas so dots never drift on any device or zoom level */}
                  {slide.hotspots.map((hotspot) => {
                    const uniqueHotspotKey = `${slide.keyId}-${hotspot.id}`;
                    const isVisible =
                      activeTooltipId === uniqueHotspotKey ||
                      hoveredTooltipId === uniqueHotspotKey;

                    // Tooltip positioning logic to keep cards comfortably in-bounds
                    const isNearTop = hotspot.y < 35;
                    const isNearRight = hotspot.x > 70;
                    const isNearLeft = hotspot.x < 30;

                    let placementClasses = 'bottom-full mb-2.5 left-1/2 -translate-x-1/2';
                    if (isNearTop) {
                      placementClasses = `top-full mt-2.5 ${
                        isNearRight
                          ? 'right-0'
                          : isNearLeft
                          ? 'left-0'
                          : 'left-1/2 -translate-x-1/2'
                      }`;
                    } else if (isNearRight) {
                      placementClasses = 'bottom-full mb-2.5 right-0';
                    } else if (isNearLeft) {
                      placementClasses = 'bottom-full mb-2.5 left-0';
                    } else {
                      placementClasses = 'bottom-full mb-2.5 left-1/2 -translate-x-1/2';
                    }

                    return (
                      <div
                        key={hotspot.id}
                        className="absolute z-20"
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {/* Interactive Dot */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltipId((prev) =>
                              prev === uniqueHotspotKey ? null : uniqueHotspotKey
                            );
                          }}
                          onMouseEnter={() => setHoveredTooltipId(uniqueHotspotKey)}
                          onMouseLeave={() => setHoveredTooltipId(null)}
                          className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 cursor-pointer group focus:outline-hidden"
                          aria-label={hotspot.title}
                        >
                          {/* Pulsating Halo Wave */}
                          <span className="arthome-pulse-ring absolute inset-0 rounded-full bg-white/80 pointer-events-none" />

                          {/* Soft Beat Base */}
                          <span className="arthome-soft-beat absolute w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-white/45 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />

                          {/* Crisp Solid White Center Circle */}
                          <span className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-neutral-300/80" />
                        </button>

                        {/* White Popover Card (matching user screenshot bottom-right card exactly) */}
                        <div
                          onMouseEnter={() => setHoveredTooltipId(uniqueHotspotKey)}
                          onMouseLeave={() => setHoveredTooltipId(null)}
                          className={`absolute ${placementClasses} z-30 transition-all duration-300 pointer-events-auto ${
                            isVisible
                              ? 'opacity-100 scale-100 translate-y-0'
                              : 'opacity-0 scale-95 pointer-events-none'
                          }`}
                        >
                          <Link
                            href={hotspot.link}
                            className="block bg-white rounded-lg sm:rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-neutral-200/80 p-2 sm:p-3 md:p-3.5 w-36 sm:w-40 md:w-44 text-center transition-transform hover:scale-[1.02] group/card"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-full h-14 sm:h-18 md:h-20 mb-1.5 sm:mb-2 flex items-center justify-center overflow-hidden rounded bg-neutral-50/70">
                              <img
                                src={hotspot.image}
                                alt={hotspot.title}
                                className="max-w-full max-h-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Title */}
                            <h4 className="text-[10.5px] sm:text-[11.5px] md:text-[12.5px] font-medium text-neutral-900 group-hover/card:text-black leading-snug line-clamp-2">
                              {hotspot.title}
                            </h4>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Navigation Arrow: Left (<) at the edge/side of the page */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection précédente"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>

        {/* Circular Navigation Arrow: Right (>) at the edge/side of the page */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection suivante"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>
      </div>
    </section>
  );
}

export default ArtHomeCollectionSlider;
