'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { LuxuryReveal } from '@/components/luxury-reveal';

export interface GoogleReviewItem {
  name: string;
  role: string;
  avatarLetter: string;
  avatarBg: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export const REVIEWS_LIVORA_DATA: GoogleReviewItem[] = [
  {
    name: 'Samah Silini',
    role: 'Acheteuse vérifiée · 3 avis',
    avatarLetter: 'S',
    avatarBg: '#0b5c92',
    rating: 5,
    text: "Magnifique magasin, l'accueil est chaleureux le monsieur très dispo et ils sont très sérieux j'ai adorée ma première expérience avec eux.",
    timeAgo: 'il y a 5 ans'
  },
  {
    name: 'Mami Faouzi',
    role: 'Local Guide · 125 avis · 63 photos',
    avatarLetter: 'M',
    avatarBg: '#8f7137',
    rating: 5,
    text: "Très bel endroit. Qualité des salons et des finitions irréprochable, mobilier haut de gamme remarquable.",
    timeAgo: 'il y a 6 ans'
  },
  {
    name: 'Kenza Kernane',
    role: 'Cliente fidèle · 7 avis',
    avatarLetter: 'K',
    avatarBg: '#2e6930',
    rating: 5,
    text: "Magnifique. Le raffinement et la solidité des matières en font l'adresse de référence pour meubler sa maison.",
    timeAgo: 'il y a 2 ans'
  },
  {
    name: 'fathi chaalane',
    role: 'Local Guide · 1 avis · 15 photos',
    avatarLetter: 'F',
    avatarBg: '#4a5d4e',
    rating: 5,
    text: "Très beaux meubles design, finitions parfaites et accueil très professionnel.",
    timeAgo: 'il y a 2 mois'
  },
  {
    name: 'Bouchra O',
    role: 'Local Guide · 25 avis · 10 photos',
    avatarLetter: 'B',
    avatarBg: '#6b21a8',
    rating: 5,
    text: "Très satisfaite de ma commande. Les meubles sont exceptionnels et l'accompagnement était parfait.",
    timeAgo: 'il y a 4 ans'
  },
  {
    name: 'ADEL BOUGUI',
    role: 'Local Guide · 22 avis · 145 photos',
    avatarLetter: 'A',
    avatarBg: '#c2410c',
    rating: 5,
    text: "Un showroom d'exception avec des pièces uniques et une qualité de conception remarquable.",
    timeAgo: 'il y a 4 ans'
  },
  {
    name: 'Hakim Lounes',
    role: 'Local Guide · 10 avis · 1 photo',
    avatarLetter: 'H',
    avatarBg: '#b91c1c',
    rating: 5,
    text: "Excellente qualité de meubles et personnel très accueillant et à l'écoute.",
    timeAgo: 'il y a 8 mois'
  },
  {
    name: 'mouloud karahaçane',
    role: 'Local Guide · 7 avis · 66 photos',
    avatarLetter: 'M',
    avatarBg: '#475569',
    rating: 5,
    text: "Produits haut de gamme et service impeccable du premier contact jusqu'à la livraison.",
    timeAgo: 'il y a 9 mois'
  },
  {
    name: 'Walid Chair',
    role: 'Client vérifié · 2 avis · 1 photo',
    avatarLetter: 'W',
    avatarBg: '#1e3a8a',
    rating: 5,
    text: "Qualité au top et équipe très professionnelle.",
    timeAgo: 'il y a 5 ans'
  },
  {
    name: 'Monde Events',
    role: 'Local Guide · 7 avis · 11 photos',
    avatarLetter: 'M',
    avatarBg: '#0f766e',
    rating: 5,
    text: "Grand choix de mobilier contemporain de luxe, élégant et soigné.",
    timeAgo: 'il y a 10 mois'
  },
  {
    name: 'Mehdi BM',
    role: 'Local Guide · 18 avis · 1 photo',
    avatarLetter: 'M',
    avatarBg: '#0284c7',
    rating: 5,
    text: "Service et finitions de très haute qualité.",
    timeAgo: 'il y a 4 ans'
  },
  {
    name: 'Souami Nasreddine',
    role: 'Local Guide · 17 avis · 345 photos',
    avatarLetter: 'S',
    avatarBg: '#0369a1',
    rating: 4,
    text: "Très bon magasin avec de belles collections contemporaines.",
    timeAgo: 'il y a 11 mois'
  },
  {
    name: 'aknine Brahim',
    role: 'Local Guide · 185 avis · 298 photos',
    avatarLetter: 'A',
    avatarBg: '#ca8a04',
    rating: 4,
    text: "Superbe showroom et conseils personnalisés pour chaque pièce.",
    timeAgo: 'il y a 2 ans'
  }
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartX = useRef<number | null>(null);
  const currentDragX = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastWheelTime = useRef<number>(0);

  const reviews = REVIEWS_LIVORA_DATA;
  const currentReview = reviews[currentIndex];

  const goNext = () => {
    if (isTransitioning) return;
    setSlideDirection('next');
    setIsTransitioning(true);
    setDragOffset(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setIsTransitioning(false);
    }, 400);
  };

  const goPrev = () => {
    if (isTransitioning) return;
    setSlideDirection('prev');
    setIsTransitioning(true);
    setDragOffset(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      setIsTransitioning(false);
    }, 400);
  };

  // Automatic transition every 5.5s, pauses on hover or drag
  useEffect(() => {
    if (isPaused || isDragging) return;
    timerRef.current = setInterval(() => {
      goNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isTransitioning, isPaused, isDragging]);

  // ── MOUSE DRAG / SWIPE HANDLERS FOR BOTH SIDES ──
  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on buttons/links
    if ((e.target as HTMLElement).closest('button, a')) return;
    dragStartX.current = e.clientX;
    currentDragX.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || dragStartX.current === null) return;
    currentDragX.current = e.clientX;
    const diff = e.clientX - dragStartX.current;
    // Dampen drag offset for smooth feel
    setDragOffset(diff * 0.4);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (dragStartX.current !== null && currentDragX.current !== null) {
      const distance = currentDragX.current - dragStartX.current;
      if (distance < -40) {
        goNext();
      } else if (distance > 40) {
        goPrev();
      } else {
        setDragOffset(0);
      }
    }
    dragStartX.current = null;
    currentDragX.current = null;
  };

  // ── TOUCH HANDLERS FOR TOUCHSCREENS & TRACKPADS ──
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    currentDragX.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || dragStartX.current === null) return;
    currentDragX.current = e.touches[0].clientX;
    const diff = e.touches[0].clientX - dragStartX.current;
    setDragOffset(diff * 0.4);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // ── HORIZONTAL MOUSE WHEEL / TRACKPAD SWIPE ──
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 600) return; // Debounce wheel gestures

    if (Math.abs(e.deltaX) > 25 || (e.shiftKey && Math.abs(e.deltaY) > 25)) {
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      lastWheelTime.current = now;
      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <section 
      className="relative bg-[#0E0F10] py-20 md:py-28 lg:py-32 border-t border-white/10 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); handleMouseUp(); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ══════════════════════════════════════════════════════════════════════
            DESKTOP VIEW: EXACT LIVORA PIXEL-BY-PIXEL ARCHITECTURE
            Both left (chair) and right (review) are fully mouse draggable & swipable!
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 xl:gap-14 items-center">
          
          {/* ── Left Column: Transparent Cutout Image directly on background (Draggable with cursor-grab) ── */}
          <div className="lg:col-span-5 flex items-center justify-center relative cursor-grab active:cursor-grabbing">
            <LuxuryReveal delay={100} variant="left">
              <div 
                className="relative group transition-transform duration-300 ease-out"
                style={{
                  transform: isDragging ? `translateX(${dragOffset * 0.3}px) scale(0.99)` : undefined
                }}
              >
                <img
                  src="/reviews-chair-lamp-transparent.png"
                  alt="Fauteuil cuir cognac, plante et lampadaire Château d'art"
                  className="w-full max-w-[530px] h-auto object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] pointer-events-none"
                  draggable={false}
                />
              </div>
            </LuxuryReveal>
          </div>

          {/* ── Right Column: Exact Livora Elements & Spacing (Draggable with cursor-grab) ── */}
          <div className="lg:col-span-7 flex flex-col justify-center cursor-grab active:cursor-grabbing">
            <LuxuryReveal delay={200} variant="right">
              
              {/* 1. Sharp-edged Badge: "Happy Customer" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#18191D] border border-[#b68d40]/40 w-fit mb-5 shadow-sm pointer-events-none">
                <span className="size-1.5 rounded-none bg-[#b68d40]" />
                <span className="text-[11px] font-sora font-semibold uppercase tracking-[2.5px] text-[#b68d40]">
                  Happy Customer
                </span>
              </div>

              {/* 2. Exact Livora Main Heading: "Beautiful Furniture Trusted By Modern Families" */}
              <h2 className="font-fraunces font-normal text-3xl xl:text-[44px] text-white leading-[1.2] mb-6 tracking-tight pointer-events-none">
                Beautiful Furniture Trusted By Modern Families
              </h2>

              {/* 3. Swiper Slide Content with Smooth Mouse Drag & Pop-out Transition */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                <div
                  key={currentIndex}
                  className={`transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isTransitioning 
                      ? (slideDirection === 'next' ? 'opacity-0 translate-x-6' : 'opacity-0 -translate-x-6')
                      : 'opacity-100 translate-x-0'
                  }`}
                  style={{
                    transform: isDragging 
                      ? `translateX(${dragOffset}px)` 
                      : (isTransitioning ? (slideDirection === 'next' ? 'translateX(24px)' : 'translateX(-24px)') : 'translateX(0)')
                  }}
                >
                  {/* 5 Golden Stars matching exact Livora elementskit-stars */}
                  <div className="flex items-center gap-1.5 mb-5 pointer-events-none">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#b68d40] text-[#b68d40]"
                      />
                    ))}
                  </div>

                  {/* Testimonial Quote Text with quotes */}
                  <p className="font-sora text-[#D1D5DB] text-sm xl:text-[16px] leading-[1.75] mb-8 font-light pointer-events-none">
                    &quot;{currentReview.text}&quot;
                  </p>

                  {/* Hairline Divider matching Livora */}
                  <div className="w-full h-px bg-white/10 mb-7 pointer-events-none" />

                  {/* Author Meta + Giant Watermark Quote matching Livora */}
                  <div className="flex items-center justify-between pointer-events-none">
                    
                    {/* Author block: round avatar image/initials + name + role */}
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="size-12 rounded-full flex items-center justify-center text-white font-bold font-fraunces text-base shadow-md border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: currentReview.avatarBg }}
                      >
                        {currentReview.avatarLetter}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-sora font-semibold text-white text-sm xl:text-[15px] tracking-wide">
                          {currentReview.name}
                        </h4>
                        <span className="font-sora text-xs text-[#A1A1AA] mt-0.5">
                          {currentReview.role}
                        </span>
                      </div>
                    </div>

                    {/* Exact Livora Watermark Quote Icon (SVG identical to elementskit-watermark-icon) */}
                    <div className="text-white/[0.08] pr-2 pointer-events-none select-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 80 80" fill="currentColor">
                        <path d="M68.6733 67.636C70.746 67.4633 72.1278 65.5633 71.7824 63.6633C71.6096 62.6269 71.0915 61.7633 70.2278 61.0724C61.5915 55.3724 61.0733 48.636 62.6278 43.4542H74.546C76.446 43.4542 78.0005 41.8996 78.0005 39.9996V15.8178C78.0005 13.9178 76.446 12.3633 74.546 12.3633H46.9096C45.0096 12.3633 43.4551 13.9178 43.4551 15.8178V46.5633C43.4551 50.8815 44.8369 55.1997 47.4278 58.6542C50.5369 62.7996 56.7551 67.4633 68.6733 67.636Z" />
                        <path d="M27.2188 67.636C29.2915 67.4633 30.6733 65.5633 30.3278 63.6633C30.1551 62.6269 29.6369 61.7633 28.7733 61.0724C20.1369 55.3724 19.6188 48.636 21.1733 43.4542H33.0915C34.9915 43.4542 36.546 41.8996 36.546 39.9996V15.8178C36.546 13.9178 34.9915 12.3633 33.0915 12.3633H5.45513C3.55513 12.3633 2.00058 13.9178 2.00058 15.8178V46.5633C2.00058 50.8815 3.3824 55.1997 5.97331 58.6542C9.0824 62.7996 15.3006 67.4633 27.2188 67.636Z" />
                      </svg>
                    </div>

                  </div>
                </div>

                {/* Subtle Controls: Dots & Navigation arrows */}
                <div className="flex items-center justify-between pt-6 mt-4">
                  <div className="flex items-center gap-2">
                    {reviews.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTransitioning) return;
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentIndex(idx);
                            setIsTransitioning(false);
                          }, 300);
                        }}
                        aria-label={`Aller à l'avis ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentIndex === idx 
                            ? 'w-6 bg-[#b68d40]' 
                            : 'w-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      aria-label="Avis précédent"
                      className="size-8 rounded-full border border-white/15 bg-[#141518] text-white flex items-center justify-center hover:bg-[#b68d40] hover:text-black hover:border-[#b68d40] transition-colors focus:outline-none"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      aria-label="Avis suivant"
                      className="size-8 rounded-full border border-white/15 bg-[#141518] text-white flex items-center justify-center hover:bg-[#b68d40] hover:text-black hover:border-[#b68d40] transition-colors focus:outline-none"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

              </div>
            </LuxuryReveal>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE VIEW (Preserved exactly as requested)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-[3px] text-[#b68d40] font-bold block mb-2 font-sora">
              Avis Vérifiés
            </span>
            <h2 className="font-fraunces font-light text-2xl sm:text-3xl text-white mb-3">
              Ce Que Disent Nos Clients
            </h2>
            <div className="w-16 h-[2px] bg-[#b68d40] mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.slice(0, 4).map((review, index) => (
              <LuxuryReveal key={index} delay={index * 100}>
                <div className="bg-[#121316] border border-white/10 p-6 h-full flex flex-col justify-between rounded-sm shadow-md">
                  <div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#b68d40] text-[#b68d40]" />
                      ))}
                    </div>
                    <p className="font-sora text-[#D1D5DB] text-xs leading-relaxed mb-4 italic">
                      &laquo; {review.text} &raquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-sora">
                    <span className="font-fraunces text-white text-xs font-semibold">{review.name}</span>
                    <span className="text-[10px] text-[#b68d40]">{review.timeAgo}</span>
                  </div>
                </div>
              </LuxuryReveal>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/place/Ch%C3%A2teau+D'Art+-+meubles/@36.7083703,3.0600586,17z/data=!4m8!3m7!1s0x128fad5fae229a89:0xa8afd38ca1b6e44f!8m2!3d36.7083703!4d3.0626335!9m1!1b1!16s%2Fg%2F11gsn14yk8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-sora text-[#b68d40] hover:underline"
            >
              <span>Voir tous nos avis sur Google Maps</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
