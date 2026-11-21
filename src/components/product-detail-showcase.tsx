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
  Check,
  ShieldCheck,
  Truck
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
    product.finishes && product.finishes.length > 0 ? product.finishes[0].name : 'Naturel'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Touch swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
    if (distance > 45) {
      nextImage();
    } else if (distance < -45) {
      prevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleWishlist = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    setWishlistToast(nextState ? 'Ajouté à vos favoris' : 'Retiré des favoris');
    setTimeout(() => setWishlistToast(null), 2500);
  };

  const finishes = product.finishes || [
    { name: 'Noyer Foncé', color: '#4A3525' },
    { name: 'Chêne Clair', color: '#D2B48C' },
    { name: 'Blanc Ivoire', color: '#F3EFE6' },
    { name: 'Gris Anthracite', color: '#2B2B2B' },
  ];

  const features = product.features || [
    'Structure en bois noble massif avec assemblage renforcé.',
    'Mousses haute résilience certifiées pour un confort ergonomique durable.',
    'Finitions soignées réalisées à la main dans nos ateliers à Alger.',
  ];

  const orderSubject = `Commande: ${product.name} (${selectedFinish})`;
  const orderMessage = `Bonjour M&F Meubles, je souhaite commander : ${product.name}\n- Finition : ${selectedFinish}\n- Quantité : ${quantity}\n- Prix : ${formatPrice(product.price * quantity)}`;
  const contactUrl = `/contact?product=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.image)}&id=${encodeURIComponent(String(product.id))}&subject=${encodeURIComponent(orderSubject)}&message=${encodeURIComponent(orderMessage)}#contact-form`;
  const whatsappUrl = `https://wa.me/213561719100?text=${encodeURIComponent(orderMessage)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-16 items-start font-sans">
      
      {/* ── Left Column: Clean Daylight Gallery (Apple Style) ── */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div 
          className="relative flex aspect-[4/3] sm:aspect-[16/11] items-center justify-center overflow-hidden rounded-[28px] bg-[#F5F5F7] border border-neutral-200/80 p-4 sm:p-8 select-none group shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                -{product.discount}%
              </span>
            </div>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              key={activeImageIndex}
              src={images[activeImageIndex]} 
              alt={`${product.name} - Vue ${activeImageIndex + 1}`}
              className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 ease-out group-hover:scale-105 drop-shadow-md"
              draggable={false}
            />
          </div>

          {/* Carousel Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Photo précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/90 text-neutral-800 flex items-center justify-center shadow-md hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/90 text-neutral-800 flex items-center justify-center shadow-md hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          {/* Mobile counter pill */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-neutral-700 border border-neutral-200/80 shadow-sm md:hidden">
            {activeImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Voir photo ${idx + 1}`}
                className={`relative shrink-0 aspect-[4/3] w-20 sm:w-24 rounded-2xl overflow-hidden bg-[#F5F5F7] transition-all border-2 cursor-pointer ${
                  activeImageIndex === idx 
                    ? 'border-neutral-900 shadow-sm ring-1 ring-neutral-900' 
                    : 'border-neutral-200/80 opacity-70 hover:opacity-100 hover:border-neutral-400'
                }`}
              >
                <img src={img} alt={`Miniature ${idx + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right Column: Editorial & Purchase Controls ── */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-6 pt-2">
        
        {/* Brand, Title & Price */}
        <LuxuryReveal delay={0}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-3">
              <span>{product.brand || "M&F Meubles"}</span>
              <span>·</span>
              <span className="text-emerald-700">En stock prêt à livrer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base sm:text-lg text-neutral-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-neutral-600 text-sm leading-relaxed">
              {product.description ||
                "Conception raffinée aux lignes contemporaines, façonnée pour apporter cachet et confort dans votre salon ou salle de réception."}
            </p>
          </div>
        </LuxuryReveal>

        {/* Finition Selector */}
        <div className="border-t border-neutral-200/80 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-neutral-500">
              Nuance &amp; Finition
            </span>
            <span className="text-xs font-semibold text-neutral-900">{selectedFinish}</span>
          </div>
          
          <div className="flex gap-2.5 items-center" role="radiogroup" aria-label="Choisir la finition">
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
                  className={`size-9 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                    isSelected 
                      ? 'border-neutral-900 scale-110 ring-2 ring-neutral-900/30 shadow-sm' 
                      : 'border-neutral-300 hover:border-neutral-500'
                  }`}
                  style={{ backgroundColor: f.color }}
                />
              );
            })}
          </div>
        </div>

        {/* Value Points */}
        <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-neutral-200/80 space-y-2.5 text-xs text-neutral-700">
          <div className="flex items-center gap-2.5 font-medium">
            <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
            <span>Livraison &amp; montage gratuits sur Alger, Blida, Tipaza et Boumerdès</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
            <span>Garantie constructeur 5 ans sur la structure et le bois massif</span>
          </div>
        </div>

        {/* Order Controls */}
        <div className="border-t border-neutral-200/80 pt-5 space-y-3">
          <div className="flex items-center gap-3">
            {/* Stepper */}
            <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-100 p-1">
              <button 
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="size-8 rounded-full bg-white flex items-center justify-center text-neutral-700 hover:text-neutral-900 shadow-sm transition-colors cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <span className="w-9 text-center font-bold text-sm text-neutral-900">
                {quantity}
              </span>
              <button 
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="size-8 rounded-full bg-white flex items-center justify-center text-neutral-700 hover:text-neutral-900 shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Main Apple CTA Button */}
            <Link 
              href={contactUrl}
              className="flex-1 py-3 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm tracking-wide text-center transition-all shadow-md hover:scale-[1.01]"
            >
              Commander ce modèle
            </Link>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Commander sur WhatsApp"
              className="size-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-md hover:scale-105 shrink-0"
            >
              <MessageSquare size={17} />
            </a>
          </div>

          {/* Wishlist Link */}
          <div className="flex items-center justify-between pt-1">
            <button 
              type="button"
              onClick={toggleWishlist}
              className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <Heart 
                size={15} 
                className={`transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} 
              />
              <span>{isWishlisted ? 'Dans vos favoris' : 'Enregistrer dans vos favoris'}</span>
            </button>

            {wishlistToast && (
              <span className="text-xs text-emerald-700 font-medium">
                {wishlistToast}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
