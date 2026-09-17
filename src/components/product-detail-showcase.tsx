'use client';

import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Minus, 
  Plus, 
  MessageSquare, 
  Sparkles
} from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';
import { LuxuryReveal } from '@/components/luxury-reveal';

interface ProductDetailShowcaseProps {
  product: Product;
}

export function ProductDetailShowcase({ product }: ProductDetailShowcaseProps) {
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedFinish, setSelectedFinish] = useState<string>(
    product.finishes && product.finishes.length > 0 ? product.finishes[0].name : 'Marron'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const [isImagePopping, setIsImagePopping] = useState<boolean>(false);

  // Touch swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Scroll reveal IntersectionObserver matching mobenia reference
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const [isImageRevealed, setIsImageRevealed] = useState<boolean>(false);

  useEffect(() => {
    const el = imageBoxRef.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsImageRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImageRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    triggerPop();
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    triggerPop();
  };

  const triggerPop = () => {
    setIsImagePopping(true);
    setTimeout(() => setIsImagePopping(false), 350);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleWishlist = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    setWishlistToast(nextState ? 'Produit ajouté à votre liste de souhaits' : 'Produit retiré de votre liste de souhaits');
    setTimeout(() => setWishlistToast(null), 2500);
  };

  const finishes = product.finishes || [
    { name: 'Marron', color: '#5A3D28' },
    { name: 'Blanc Ivoire', color: '#EDE8DF' },
    { name: 'Ivoire / Nature', color: '#C8B293' },
    { name: 'Noir Ébène', color: '#1A1A1A' },
  ];

  const features = product.features || [
    'Dimensions sur mesure, pensées pour un aménagement fluide au quotidien.',
    'Ensemble coordonné avec lit, chevets, commode ou mobilier assorti.',
    '4 finitions exclusives disponibles : marron noble, blanc pur, ivoire naturel, noir ébène.',
  ];

  const orderSubject = `Commande: ${product.name} (${selectedFinish})`;
  const orderMessage = `Bonjour Château d'art, je souhaite commander : ${product.name}\n- Finition : ${selectedFinish}\n- Quantité : ${quantity}\n- Prix : ${formatPrice(product.price * quantity)}`;
  const contactUrl = `/contact?product=${encodeURIComponent(product.name)}&subject=${encodeURIComponent(orderSubject)}&message=${encodeURIComponent(orderMessage)}#contact-form`;
  const whatsappUrl = `https://wa.me/213561719100?text=${encodeURIComponent(orderMessage)}`;

  // Corner paths matching Mobenia reference
  const cornerAccents = [
    { top: 16, left: 16, path: "M0,20 L0,0 L20,0" },
    { top: 16, right: 16, path: "M0,0 L20,0 L20,20" },
    { bottom: 16, left: 16, path: "M0,0 L0,20 L20,20" },
    { bottom: 16, right: 16, path: "M20,0 L20,20 L0,20" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 md:items-start">
      {/* ── Left Column: Interactive Image Carousel ── */}
      <div className="flex flex-col gap-3">
        <div 
          ref={imageBoxRef}
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#141518] border border-white/10 p-3 md:p-6 select-none group shadow-2xl cursor-pointer hover:bg-[#18191D] transition-colors"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 4 Luxury Gold Corner Accents pop-in with exact timing & opacity matching reference */}
          {cornerAccents.map((c, s) => (
            <svg
              key={s}
              width="24"
              height="24"
              viewBox="0 0 20 20"
              style={{
                position: 'absolute',
                top: c.top,
                left: c.left,
                right: c.right,
                bottom: c.bottom,
                opacity: isImageRevealed ? 1 : 0,
                transition: 'opacity 0.9s ease-out 500ms',
                pointerEvents: 'none',
                zIndex: 20
              }}
            >
              <path
                d={c.path}
                stroke="#b68d40"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ))}

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-4 left-12 z-20">
              <span className="bg-[#b68d40] text-black text-xs font-bold px-3 py-1 rounded-none shadow-lg tracking-wider font-sora">
                -{product.discount}% OFF
              </span>
            </div>
          )}

          {/* Main Image with scroll reveal & pop-out: blur + grayscale + scale down into focus */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              key={activeImageIndex}
              src={images[activeImageIndex]} 
              alt={`${product.name} - Vue ${activeImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '2px',
                filter: isImageRevealed 
                  ? (isImagePopping ? 'grayscale(0) blur(0px) brightness(1.05)' : 'grayscale(0) blur(0px)')
                  : 'grayscale(1) blur(6px)',
                opacity: isImageRevealed ? 1 : 0.85,
                transform: isImageRevealed 
                  ? (isImagePopping ? 'scale(1.06)' : 'scale(1)')
                  : 'scale(1.04)',
                transition: 'filter 1.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.3s cubic-bezier(0.22, 1, 0.36, 1), transform 1.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              draggable={false}
            />
          </div>

          {/* Left / Right Carousel Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Photo précédente"
                className="absolute left-[-1.25rem] md:left-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8b878]/60 bg-[#241b12]/75 text-[#f4d79a] shadow-[0_4px_18px_rgba(36,27,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-sm transition-all hover:scale-110 hover:border-[#f4d79a] hover:bg-[#8a6a32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b878]"
              >
                <ChevronLeft className="size-8 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Photo suivante"
                className="absolute right-[-1.25rem] md:right-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8b878]/60 bg-[#241b12]/75 text-[#f4d79a] shadow-[0_4px_18px_rgba(36,27,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-sm transition-all hover:scale-110 hover:border-[#f4d79a] hover:bg-[#8a6a32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b878]"
              >
                <ChevronRight className="size-8 stroke-[1.5]" />
              </button>
            </>
          )}

          {/* Counter pill on mobile */}
          <div className="absolute bottom-4 right-12 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-sora text-[#D1D5DB] border border-white/10 md:hidden">
            {activeImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* ── Mobile Thumbnails (under main image) with Reveal ── */}
        {images.length > 1 && (
          <LuxuryReveal delay={250}>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setActiveImageIndex(idx); triggerPop(); }}
                  aria-label={`Voir la photo ${idx + 1}`}
                  className={`flex-shrink-0 aspect-square w-16 rounded-lg overflow-hidden bg-[#141518] transition-all border-2 ${
                    activeImageIndex === idx 
                      ? 'border-[#b68d40] scale-105 shadow-[0_0_0_2px_rgba(182,141,64,0.3)]' 
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`Miniature ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          </LuxuryReveal>
        )}
      </div>

      {/* ── Right Column: Editorial & Purchase Controls with Scroll Reveals ── */}
      <div className="flex flex-col justify-start space-y-3 pt-6 md:space-y-4 md:pt-16 font-sora">
        
        {/* Brand & Title (delay 0ms) */}
        <LuxuryReveal delay={0}>
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#b68d40] font-semibold tracking-[3px] uppercase mb-1">
              <Sparkles size={13} className="text-[#b68d40]" />
              <span>{product.brand || "Château d'art"}</span>
            </div>
            <h1 className="font-fraunces text-xl md:text-2xl font-serif font-bold text-white mb-2 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-xl md:text-2xl font-bold text-[#f4d79a]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base md:text-lg text-white/50 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </LuxuryReveal>

        {/* Rating, Finishes & Features (delay 150ms) */}
        <LuxuryReveal delay={150}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1 text-[#b68d40] text-sm">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-xs text-[#A1A1AA]">0 Reviews · Avis vérifiés</span>
            </div>

            {/* Finition Selector */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-medium text-[#E4E4E7]">Finition :</span>
                <div className="flex gap-2 items-center" role="radiogroup" aria-label="Choisir la finition">
                  {finishes.map((f) => {
                    const isSelected = selectedFinish === f.name;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedFinish(f.name)}
                        aria-label={`Finition ${f.name}`}
                        className={`relative size-9 rounded-full border-2 transition-all p-0.5 ${
                          isSelected 
                            ? 'border-[#b68d40] scale-110 shadow-[0_0_0_2px_rgba(182,141,64,0.35)] ring-2 ring-[#b68d40]/40' 
                            : 'border-white/20 hover:border-[#b68d40] opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: f.color }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-white/70">{selectedFinish}</span>
              </div>

              {/* Bullet Points Checklist */}
              <div className="flex flex-col gap-1.5 text-xs md:text-sm text-[#D1D5DB] pt-1">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#b68d40] font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LuxuryReveal>

        <div className="h-px bg-white/10 my-1" />

        {/* Quantity, Main CTA & Wishlist (delay 300ms) */}
        <LuxuryReveal delay={300}>
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-white/20 rounded-lg bg-[#141518] text-white overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-2 md:px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#f4d79a]">
                  {quantity}
                </span>
                <button 
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-2 md:px-3 py-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Main CTA Button */}
              <Link 
                href={contactUrl}
                className="flex-1 md:flex-auto px-6 md:px-8 py-2 md:py-2.5 bg-[#b68d40] hover:bg-[#c99b4d] text-black font-bold uppercase tracking-wider rounded-lg transition-all text-xs md:text-sm text-center shadow-lg hover:shadow-[0_4px_25px_rgba(182,141,64,0.4)] hover:scale-[1.02]"
              >
                Commandez maintenant
              </Link>

              {/* Direct WhatsApp Ordering Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Commander sur WhatsApp"
                className="p-2.5 md:p-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors flex items-center justify-center shadow-lg hover:scale-105"
              >
                <MessageSquare size={16} />
              </a>
            </div>

            {/* Wishlist Link */}
            <div className="flex items-center justify-between pt-1">
              <button 
                type="button"
                onClick={toggleWishlist}
                className="flex items-center gap-2 text-xs md:text-sm text-[#A1A1AA] hover:text-[#b68d40] transition-colors"
              >
                <Heart 
                  size={16} 
                  className={`transition-colors ${isWishlisted ? 'fill-[#b68d40] text-[#b68d40]' : 'text-[#A1A1AA]'}`} 
                />
                <span>{isWishlisted ? 'Ajouté à la liste de souhaits' : 'Ajouter à la liste de souhaits'}</span>
              </button>

              {wishlistToast && (
                <span className="text-xs text-[#b68d40] animate-fade-in">
                  {wishlistToast}
                </span>
              )}
            </div>
          </div>
        </LuxuryReveal>

        {/* ── Desktop Thumbnails with Reveal (delay 250ms) ── */}
        {images.length > 1 && (
          <LuxuryReveal delay={250}>
            <div className="hidden md:flex gap-2 overflow-x-auto pb-1 pt-2 md:pl-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setActiveImageIndex(idx); triggerPop(); }}
                  aria-label={`Voir la photo ${idx + 1}`}
                  className={`flex-shrink-0 aspect-square w-20 rounded-lg overflow-hidden bg-[#141518] transition-all border-2 ${
                    activeImageIndex === idx 
                      ? 'border-[#b68d40] scale-105 shadow-[0_0_0_2px_rgba(182,141,64,0.35)]' 
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`Vue ${idx + 1} de ${product.name}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          </LuxuryReveal>
        )}

      </div>
    </div>
  );
}
