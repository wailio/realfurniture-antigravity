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
  // Desktop: peek = 300px, gap = 40px
  // Tablet: peek = 120px, gap = 24px
  // Mobile: peek = 36px, gap = 12px (wider slide for mobile so image is bigger/longer horizontally)
  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  const peekWidth = isMobile ? 36 : isTablet ? 120 : 300;
  const gap = isMobile ? 12 : isTablet ? 24 : 40;
  const slideWidth = Math.max(280, containerWidth - peekWidth - gap);

  // Exact slide height corresponding to responsive classes:
  // Mobile reduced from 460px to 350px so it is not too thin, making the photo look bigger and wider
  const slideHeight =
    containerWidth < 640
      ? 350
      : containerWidth < 768
      ? 560
      : containerWidth < 1024
      ? 650
      : containerWidth < 1280
      ? 720
      : 780;

  // Background image canvas geometry (1024x576 = 16:9 aspect ratio)
  // Replicates object-cover object-center while strictly anchoring hotspots to the exact image pixels
  const imageAspect = 16 / 9;
  const containerAspect = slideWidth / slideHeight;

  let canvasWidth = slideWidth;
  let canvasHeight = slideHeight;
  let canvasLeft = 0;
  let canvasTop = 0;

  if (containerAspect < imageAspect) {
    // Container is taller than image (e.g. mobile h-[460px])
    // Image fills height, centered horizontally
    canvasHeight = slideHeight;
    canvasWidth = slideHeight * imageAspect;
    canvasLeft = (slideWidth - canvasWidth) / 2;
    canvasTop = 0;
  } else {
    // Container is wider than image (e.g. wide desktop)
    // Image fills width, centered vertically
    canvasWidth = slideWidth;
    canvasHeight = slideWidth / imageAspect;
    canvasLeft = 0;
    canvasTop = (slideHeight - canvasHeight) / 2;
  }

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
                {/* Slide Frame with generous height matching luxury scale, sharp edges, and optimized mobile proportions */}
                <div className="relative w-full h-[350px] sm:h-[560px] md:h-[650px] lg:h-[720px] xl:h-[780px] bg-neutral-900 overflow-hidden shadow-xs">
                  {/* Mathematical Image Canvas: strictly locked to object-cover geometry */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                      left: `${canvasLeft}px`,
                      top: `${canvasTop}px`,
                    }}
                  >
                    {/* High Definition Background Photograph — luxury-sharpened, sharp-edged */}
                    <img
                      src={slide.bgImage}
                      alt={slide.collectionName}
                      className="luxury-bg-img w-full h-full object-cover select-none pointer-events-none"
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

                  {/* Hotspots: anchored to image canvas, with mobile in-frame clamping hack so all product dots ALWAYS show */}
                  {slide.hotspots.map((hotspot) => {
                    const uniqueHotspotKey = `${slide.keyId}-${hotspot.id}`;
                    const isVisible =
                      activeTooltipId === uniqueHotspotKey ||
                      hoveredTooltipId === uniqueHotspotKey;

                    // Compute exact pixel position relative to slide frame
                    const rawX = canvasLeft + (hotspot.x / 100) * canvasWidth;
                    const rawY = canvasTop + (hotspot.y / 100) * canvasHeight;

                    // Mobile in-frame clamp hack: ensure edge dots are always kept inside the visible frame
                    const minPaddingX = isMobile ? 32 : 16;
                    const maxPaddingX = isMobile ? slideWidth - 32 : slideWidth - 16;
                    const minPaddingY = isMobile ? 40 : 16;
                    const maxPaddingY = isMobile ? slideHeight - 40 : slideHeight - 16;

                    const posX = isMobile
                      ? Math.max(minPaddingX, Math.min(maxPaddingX, rawX))
                      : rawX;
                    const posY = isMobile
                      ? Math.max(minPaddingY, Math.min(maxPaddingY, rawY))
                      : rawY;

                    // Tooltip positioning logic
                    const isNearTop = posY < 85;
                    const isNearBottom = posY > slideHeight - 110;
                    const isNearRight = posX > slideWidth - 100;
                    const isNearLeft = posX < 100;

                    let placementClasses = 'bottom-full mb-3 left-1/2 -translate-x-1/2';
                    if (isNearTop) {
                      placementClasses = `top-full mt-3 ${
                        isNearRight
                          ? 'right-0'
                          : isNearLeft
                          ? 'left-0'
                          : 'left-1/2 -translate-x-1/2'
                      }`;
                    } else if (isNearRight) {
                      placementClasses = 'bottom-full mb-3 right-0';
                    } else if (isNearLeft) {
                      placementClasses = 'bottom-full mb-3 left-0';
                    } else {
                      placementClasses = 'bottom-full mb-3 left-1/2 -translate-x-1/2';
                    }

                    return (
                      <div
                        key={hotspot.id}
                        className="absolute z-20 pointer-events-auto"
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
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
                          className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 cursor-pointer group focus:outline-hidden"
                          aria-label={hotspot.title}
                        >
                          {/* Pulsating Halo Wave */}
                          <span className="arthome-pulse-ring absolute inset-0 rounded-full bg-white/80 pointer-events-none" />

                          {/* Soft Beat Base */}
                          <span className="arthome-soft-beat absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/45 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />

                          {/* Crisp Solid White Center Circle */}
                          <span className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-neutral-300/80" />
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
                            className="block bg-white rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.22)] border border-neutral-100 p-2.5 sm:p-3.5 w-36 sm:w-44 text-center transition-transform hover:scale-[1.02] group/card"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-full h-14 sm:h-20 mb-2 flex items-center justify-center overflow-hidden rounded bg-neutral-50/60">
                              <img
                                src={hotspot.image}
                                alt={hotspot.title}
                                className="max-w-full max-h-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Title */}
                            <h4 className="text-[11px] sm:text-[12.5px] font-medium text-neutral-900 group-hover/card:text-black leading-snug line-clamp-2">
                              {hotspot.title}
                            </h4>
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {/* Text at top of each image — upgraded to champagne for luxury feel */}
                  <div className="absolute top-4 left-4 sm:top-7 sm:left-7 md:top-9 md:left-9 z-10 pointer-events-none">
                    <h2
                      className="font-sans font-light text-[17px] sm:text-[22px] md:text-[24px] tracking-[0.08em] leading-tight select-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                      style={{ color: '#f0ece4', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                    >
                      {slide.collectionName}
                    </h2>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Navigation Arrow: Left (<) at the edge/side of the page */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] sm:shadow-[0_6px_25px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection précédente"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>

        {/* Circular Navigation Arrow: Right (>) at the edge/side of the page */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] sm:shadow-[0_6px_25px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection suivante"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>
      </div>
    </section>
  );
}

export default ArtHomeCollectionSlider;
