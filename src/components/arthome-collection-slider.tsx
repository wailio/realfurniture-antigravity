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
    bgImage: '/arthome-collection/living-room-bg.jpg',
    hotspots: [
      {
        id: 'lr-couch',
        x: 28,
        y: 53,
        title: "Canapé d'Angle Camel Prestige",
        image: '/arthome-collection/canape-angle-velours.jpg',
        link: '/all-products?category=sofas',
        position: 'top',
      },
      {
        id: 'lr-table',
        x: 48,
        y: 63,
        title: 'Table Basse Gigogne Duo Chêne & Bronze',
        image: '/arthome-collection/table-basse-duo.png',
        link: '/all-products?category=accessories',
        position: 'top',
      },
    ],
  },
  {
    id: 2,
    collectionName: 'Salon Prestige Collection',
    bgImage: '/arthome-collection/dining-room-bg.jpg',
    hotspots: [
      {
        id: 'dr-table',
        x: 51,
        y: 62,
        title: 'Table Basse Bronze Marbre Oxydé',
        image: '/arthome-collection/table-basse-bronze.jpg',
        link: '/all-products?category=accessories',
        position: 'top',
      },
      {
        id: 'dr-lamp',
        x: 91,
        y: 55,
        title: 'Console & Lampe Laiton Prestige',
        image: '/arthome-collection/console-lampe-laiton.png',
        link: '/all-products?category=accessories',
        position: 'left',
      },
      {
        id: 'dr-couch',
        x: 27,
        y: 46,
        title: 'Canapé Panoramique Crème Grand Confort',
        image: '/arthome-collection/canape-panoramique-creme.jpg',
        link: '/all-products?category=sofas',
        position: 'bottom',
      },
    ],
  },
  {
    id: 3,
    collectionName: 'The Home Collection',
    bgImage: '/arthome-collection/the-home-bg.jpg',
    hotspots: [
      {
        id: 'th-1',
        x: 14,
        y: 40,
        title: 'Single Round Tea Table',
        image: '/arthome-collection/single-round-tea-table.jpg',
        link: '/all-products?category=accessories',
        position: 'bottom',
      },
      {
        id: 'th-2',
        x: 39,
        y: 48,
        title: 'Bouclé chaise sectional sofa',
        image: '/arthome-collection/boucle-chaise-sectional-sofa.jpg',
        link: '/all-products?category=sofas',
        position: 'bottom',
      },
      {
        id: 'th-3',
        x: 57,
        y: 63,
        title: 'Geometric white tea table',
        image: '/arthome-collection/geometric-white-tea-table.jpg',
        link: '/all-products?category=accessories',
        position: 'top',
      },
      {
        id: 'th-4',
        x: 82,
        y: 52,
        title: 'Sculptural bouclé accent chair',
        image: '/arthome-collection/sculptural-boucle-accent-chair.jpg',
        link: '/all-products?category=sofas',
        position: 'top',
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
  // Mobile: peek = 60px, gap = 14px
  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  const peekWidth = isMobile ? 60 : isTablet ? 120 : 300;
  const gap = isMobile ? 14 : isTablet ? 24 : 40;
  const slideWidth = Math.max(280, containerWidth - peekWidth - gap);

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
      `}</style>

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
                className="relative shrink-0 overflow-hidden bg-white"
                style={{ width: `${slideWidth}px` }}
              >
                {/* Slide Frame with generous height matching original luxury scale */}
                <div className="relative w-full h-[460px] sm:h-[560px] md:h-[650px] lg:h-[720px] xl:h-[780px] bg-neutral-100 overflow-hidden shadow-xs">
                  {/* High Definition Background Photograph */}
                  <img
                    src={slide.bgImage}
                    alt={slide.collectionName}
                    className="w-full h-full object-cover object-center pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* Atmospheric Luxury Vignette */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/15 via-transparent to-black/10" />

                  {/* Text at top of each image matching Art Home Furniture (No shadow, clean black typography) */}
                  <div className="absolute top-5 left-5 sm:top-7 sm:left-7 md:top-9 md:left-9 z-10 pointer-events-none">
                    <h2 className="font-sans font-normal text-[20px] sm:text-[22px] md:text-[24px] text-black tracking-normal leading-tight select-none">
                      {slide.collectionName}
                    </h2>
                  </div>

                  {/* Hotspots: always rendered on each slide with interactive cards */}
                  {slide.hotspots.map((hotspot) => {
                    const uniqueHotspotKey = `${slide.keyId}-${hotspot.id}`;
                    const isVisible =
                      activeTooltipId === uniqueHotspotKey ||
                      hoveredTooltipId === uniqueHotspotKey;

                    // Tooltip positioning logic
                    const isNearTop = hotspot.y < 35;
                    const isNearBottom = hotspot.y > 65;
                    const isNearRight = hotspot.x > 75;
                    const isNearLeft = hotspot.x < 25;

                    let placementClasses = 'bottom-full mb-3 left-1/2 -translate-x-1/2';
                    if (hotspot.position === 'top' || isNearBottom) {
                      placementClasses = 'bottom-full mb-3 left-1/2 -translate-x-1/2';
                    }
                    if (hotspot.position === 'bottom' || isNearTop) {
                      placementClasses = 'top-full mt-3 left-1/2 -translate-x-1/2';
                    }
                    if (hotspot.position === 'left' || isNearRight) {
                      placementClasses = 'bottom-full mb-3 right-0';
                    }
                    if (isNearLeft && hotspot.position !== 'left') {
                      placementClasses = 'bottom-full mb-3 left-0';
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
                            className="block bg-white rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.22)] border border-neutral-100 p-3 sm:p-3.5 w-40 sm:w-44 text-center transition-transform hover:scale-[1.02] group/card"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-full h-16 sm:h-20 mb-2 flex items-center justify-center overflow-hidden rounded bg-neutral-50/60">
                              <img
                                src={hotspot.image}
                                alt={hotspot.title}
                                className="max-w-full max-h-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Title */}
                            <h4 className="text-[11.5px] sm:text-[12.5px] font-medium text-neutral-900 group-hover/card:text-black leading-snug line-clamp-2">
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
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_6px_25px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection précédente"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>

        {/* Circular Navigation Arrow: Right (>) at the edge/side of the page */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-white text-neutral-900 shadow-[0_6px_25px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:bg-neutral-50 active:scale-90 hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer border border-neutral-200/80"
          aria-label="Collection suivante"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>
      </div>
    </section>
  );
}

export default ArtHomeCollectionSlider;
