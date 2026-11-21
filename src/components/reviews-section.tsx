'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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
    name: 'Amina Mina',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'A',
    avatarBg: '#0b5c92',
    rating: 5,
    text: "Merci énormément M&F Meuble j'ai bien reçu ma commande et je suis très satisfait merci pour le sérieux et le professionnalisme et bonne continuation🙏",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Me Khalida Mehannek',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'K',
    avatarBg: '#2e6930',
    rating: 5,
    text: "Achat Fluide, Parfait de bout en bout ! Service commercial attentif, réactif et sérieux. Livreurs également très pro, ponctuelle et sympathique. Je recommande sans hésiter ⭐️⭐️⭐️⭐️⭐️",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Nihel Rh',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'N',
    avatarBg: '#8f7137',
    rating: 5,
    text: "Très bonne adresse. Des meubles magnifiques avec une qualité irréprochable. Service rapide et une équipe très professionnelle. Bonne continuation.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Salim Mahdi',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'S',
    avatarBg: '#4a5d4e',
    rating: 5,
    text: "Très bien, accueil chaleureux et mobilier de haute qualité.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Intissar Lazoughli',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'I',
    avatarBg: '#c2410c',
    rating: 5,
    text: "Haut standing, un service irréprochable et un accueil très chaleureux au showroom.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Lilya Boukhatem',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'L',
    avatarBg: '#6b21a8',
    rating: 5,
    text: "Maman et toute la famille vous remercient pour la qualité remarquable et le sérieux de votre travail.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Boudaoud Fairouz',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'B',
    avatarBg: '#0b5c92',
    rating: 5,
    text: "Une expérience parfaite avec M&F Meubles. Qualité exceptionnelle, livraison soignée et écoute irréprochable.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Mossad kara',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'M',
    avatarBg: '#b91c1c',
    rating: 5,
    text: "Excellente qualité de conception et des conseils d'experts pour agencer notre salon. Très satisfaits.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Faycal Mahdi',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'F',
    avatarBg: '#475569',
    rating: 5,
    text: "Mobilier haut de gamme avec des finitions impeccables et un grand respect des délais de livraison.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'ferhati fadi',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'F',
    avatarBg: '#1e3a8a',
    rating: 5,
    text: "Une référence incontournable pour le mobilier à Alger. Service professionnel et produits d'une solidité exemplaire.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Slimane Bakelli',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'S',
    avatarBg: '#2e6930',
    rating: 5,
    text: "Très satisfait de notre salon sur-mesure. Travail soigné et très bon rapport qualité/prix.",
    timeAgo: 'Avis vérifié'
  },
  {
    name: 'Hicham Daoudi',
    role: 'Avis vérifié Google Maps',
    avatarLetter: 'H',
    avatarBg: '#8f7137',
    rating: 5,
    text: "Superbe showroom à Kouba et accueil formidable. Finitions et boiseries de premier ordre.",
    timeAgo: 'Avis vérifié'
  },
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Drag and swipe states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const currentDragX = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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
    }, 350);
  };

  const goPrev = () => {
    if (isTransitioning) return;
    setSlideDirection('prev');
    setIsTransitioning(true);
    setDragOffset(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      setIsTransitioning(false);
    }, 350);
  };

  // Automatic transition every 6s
  useEffect(() => {
    if (isPaused || isDragging) return;
    timerRef.current = setInterval(() => {
      goNext();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isTransitioning, isPaused, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
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

  return (
    <section 
      className="relative bg-white py-20 md:py-28 lg:py-32 border-t border-neutral-200/80 overflow-hidden select-none font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); handleMouseUp(); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP VIEW */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 xl:gap-14 items-center">
          
          {/* Left Column: Transparent Cutout Image */}
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
                  alt="Mobilier d'exception M&F Meubles"
                  className="w-full max-w-[530px] h-auto object-contain pointer-events-none"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 16px 32px rgba(140,110,70,0.13))',
                  }}
                  draggable={false}
                />
              </div>
            </LuxuryReveal>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 flex flex-col justify-center cursor-grab active:cursor-grabbing">
            <LuxuryReveal delay={150} variant="right">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 w-fit mb-5 shadow-sm pointer-events-none">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold tracking-wider text-neutral-800 uppercase">
                  Avis Clients Vérifiés · 5.0 / 5 (12 avis Google)
                </span>
              </div>

              {/* Apple Thick-and-Thin Heading */}
              <h2 className="text-3xl xl:text-[42px] font-extrabold text-[#111827] leading-[1.2] mb-6 tracking-tight pointer-events-none">
                Ce que nos clients partagent <br />
                <span className="font-serif italic font-light text-neutral-600">avec fierté.</span>
              </h2>

              {/* Swiper Slide Content */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                <div
                  key={currentIndex}
                  className={`transition-all duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] ${
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
                  {/* Golden Stars */}
                  <div className="flex items-center gap-1.5 mb-5 pointer-events-none">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-neutral-700 text-base xl:text-[18px] leading-relaxed mb-8 font-normal pointer-events-none">
                    &ldquo;{currentReview.text}&rdquo;
                  </p>

                  <div className="w-full h-px bg-neutral-200/80 mb-7 pointer-events-none" />

                  {/* Author Block + Watermark */}
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="size-12 rounded-full flex items-center justify-center text-white font-bold font-serif text-lg shadow-sm border border-white flex-shrink-0"
                        style={{ backgroundColor: currentReview.avatarBg }}
                      >
                        {currentReview.avatarLetter}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-neutral-900 text-sm xl:text-[15px] tracking-tight">
                          {currentReview.name}
                        </h4>
                        <span className="text-xs text-neutral-500 mt-0.5">
                          {currentReview.role} · {currentReview.timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* Watermark Quote Icon */}
                    <div className="text-neutral-200 pr-2 pointer-events-none select-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 80 80" fill="currentColor">
                        <path d="M68.6733 67.636C70.746 67.4633 72.1278 65.5633 71.7824 63.6633C71.6096 62.6269 71.0915 61.7633 70.2278 61.0724C61.5915 55.3724 61.0733 48.636 62.6278 43.4542H74.546C76.446 43.4542 78.0005 41.8996 78.0005 39.9996V15.8178C78.0005 13.9178 76.446 12.3633 74.546 12.3633H46.9096C45.0096 12.3633 43.4551 13.9178 43.4551 15.8178V46.5633C43.4551 50.8815 44.8369 55.1997 47.4278 58.6542C50.5369 62.7996 56.7551 67.4633 68.6733 67.636Z" />
                        <path d="M27.2188 67.636C29.2915 67.4633 30.6733 65.5633 30.3278 63.6633C30.1551 62.6269 29.6369 61.7633 28.7733 61.0724C20.1369 55.3724 19.6188 48.636 21.1733 43.4542H33.0915C34.9915 43.4542 36.546 41.8996 36.546 39.9996V15.8178C36.546 13.9178 34.9915 12.3633 33.0915 12.3633H5.45513C3.55513 12.3633 2.00058 13.9178 2.00058 15.8178V46.5633C2.00058 50.8815 3.3824 55.1997 5.97331 58.6542C9.0824 62.7996 15.3006 67.4633 27.2188 67.636Z" />
                      </svg>
                    </div>

                  </div>
                </div>

                {/* Apple Controls: Dots & Navigation arrows */}
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
                            ? 'w-6 bg-neutral-900' 
                            : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      aria-label="Avis précédent"
                      className="size-9 rounded-full border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      aria-label="Avis suivant"
                      className="size-9 rounded-full border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </LuxuryReveal>
          </div>

        </div>

        {/* MOBILE VIEW */}
        <div className="lg:hidden">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-[2px] text-neutral-500 font-bold block mb-1">
              Google Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-2">
              Ce Que Disent <span className="font-serif italic font-light text-neutral-600">Nos Clients</span>
            </h2>
            <div className="w-12 h-0.5 bg-neutral-900 mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.slice(0, 4).map((review, index) => (
              <LuxuryReveal key={index} delay={index * 80}>
                <div className="bg-[#F8F9FA] border border-neutral-200/90 p-5 rounded-2xl h-full flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex gap-1 mb-2.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed mb-4">
                      &laquo; {review.text} &raquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-neutral-900 text-xs font-semibold">{review.name}</span>
                    <span className="text-[11px] text-neutral-400">{review.timeAgo}</span>
                  </div>
                </div>
              </LuxuryReveal>
            ))}
          </div>

          <div className="text-center mt-6">
            <a
              href="https://maps.app.goo.gl/PgX4a88fpg7dPQkFA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 underline hover:text-neutral-600"
            >
              <span>Voir les 12 avis vérifiés 5 étoiles sur Google Maps</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
