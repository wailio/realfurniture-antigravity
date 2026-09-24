'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Truck, 
  ShieldCheck,
  ChevronLeft, 
  ChevronRight, 
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { ProductCard } from '@/components/product-card';
import { CurvedProductShowcase } from '@/components/curved-product-showcase';
import { DesignStories } from '@/components/design-stories';
import { ReviewsSection } from '@/components/reviews-section';
import { products, formatPrice } from '@/lib/products';
import { useSiteConfig } from '@/lib/use-site-config';

export default function HomePage() {
  const siteConfig = useSiteConfig();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'Salle à manger', image: '/categories/salle-a-manger.jpg', slug: 'salle-a-manger' },
    { name: 'Canapés', image: '/categories/canapes.jpg', slug: 'sofas' },
    { name: 'Chambres', image: '/categories/chambres.jpg', slug: 'chambres' },
    { name: 'Armoire', image: '/categories/armoire.jpg', slug: 'armoire' },
    { name: 'Accessoires', image: '/categories/accessoires.jpg', slug: 'accessories' },
  ];

  const reviews = [
    { 
      name: siteConfig.review_1_name || 'Dr. Amina K.', 
      city: 'Alger',
      text: siteConfig.review_1_text || 'La qualité des finitions et le confort du salon dépassent toutes mes attentes. Une véritable pièce maîtresse dans notre maison.',
      rating: 5 
    },
    { 
      name: siteConfig.review_2_name || 'Yacine M.', 
      city: 'Oran',
      text: siteConfig.review_2_text || "Livraison ponctuelle et montage très professionnel. Les matériaux en bois massif et les tissus sont d'un raffinement rare.",
      rating: 5 
    },
    { 
      name: siteConfig.review_3_name || 'Nadia & Farouk B.', 
      city: 'Constantine',
      text: siteConfig.review_3_text || "Nous avons meublé notre salle à manger et notre chambre complète. L'accompagnement de l'équipe a été exceptionnel du début à la fin.",
      rating: 5 
    },
    { 
      name: siteConfig.review_4_name || 'Karim S.', 
      city: 'Sétif',
      text: siteConfig.review_4_text || "Le design contemporain s'intègre avec une élégance naturelle. Service client réactif et conseils avisés. Je recommande sans réserve.",
      rating: 5 
    },
  ];

  const [productList, setProductList] = React.useState<any[]>(products);

  React.useEffect(() => {
    fetch('/api/products?t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data);
        }
      })
      .catch(() => {});
  }, []);

  const carouselProducts = productList.slice(0, 6);
  const gridProducts = productList.slice(6, 12);

  return (
    <main className="min-h-screen bg-[#0E0F10] font-sans">
      <Header theme="dark" />

      {/* ── Section 1: Cinematic Hero with Video Background ── */}
      <section className="relative w-full h-[600px] md:h-[750px] lg:h-[880px] overflow-hidden flex items-center justify-center">
        {/* Background Video or Custom Image */}
        {siteConfig.hero_image_1 ? (
          <img
            src={siteConfig.hero_image_1}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/bgvideo.mp4" type="video/mp4" />
          </video>
        )}

        {/* Ambient Dark Overlay for Editorial Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0F10]/70 via-[#0E0F10]/50 to-[#0E0F10] z-10 pointer-events-none" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow badge */}
          <div 
            className="mb-5 animate-fade-in-up" 
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <span className="inline-flex items-center gap-2 border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-none text-[9px] md:text-[11px] font-sora text-[#E4E4E7] tracking-[3px] md:tracking-[4px] uppercase shadow-sm">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#b68d40]" />
              <span>{siteConfig.hero_eyebrow || "CHÂTEAU D'ART · MAISON DE DESIGN"}</span>
            </span>
          </div>
          
          {/* Subheading */}
          <div 
            className="mb-2 animate-fade-in-up" 
            style={{ animationDelay: '120ms', animationFillMode: 'both' }}
          >
            <span className="font-fraunces font-light text-xl md:text-3xl text-white/90">
              {siteConfig.hero_subheading || "L'art du confort pour"}
            </span>
          </div>

          {/* Focal title with underline hairline */}
          <div 
            className="relative mb-6 animate-fade-in-up" 
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            <h1 className="font-fraunces font-light text-[clamp(2rem,8vw,5.8rem)] md:text-[clamp(2.8rem,9vw,5.8rem)] text-white leading-[1.08] tracking-tight">
              {siteConfig.hero_heading || "espaces d'exception"}
            </h1>
            <svg 
              viewBox="0 0 360 34" 
              className="w-full max-w-[280px] md:max-w-[420px] mx-auto absolute -bottom-3 md:-bottom-5 left-1/2 -translate-x-1/2"
            >
              <path 
                d="M20 17 L340 17" 
                fill="none" 
                stroke="#b68d40" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                className="heading-underline"
                style={{ strokeDasharray: '320', strokeDashoffset: '0', animation: 'draw 1.5s cubic-bezier(0.22,1,0.36,1) forwards' }}
              />
            </svg>
          </div>

          <div 
            className="mb-10 max-w-xl animate-fade-in-up" 
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <p className="font-sora text-xs md:text-base text-white/80 leading-relaxed">
              {siteConfig.hero_subtitle || "Matières nobles, proportions sculpturales et finitions artisanales pensées pour sublimer vos espaces de vie."}
            </p>
          </div>

          {/* Call to action */}
          <div 
            className="flex flex-row items-center gap-2 md:gap-4 animate-fade-in-up" 
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <Link 
              href="/all-products" 
              className="inline-flex items-center justify-center gap-1.5 md:gap-2.5 bg-[#b68d40] hover:bg-[#a37c35] text-white px-4 py-2.5 md:px-8 md:py-4 uppercase tracking-[1.5px] md:tracking-[2.5px] text-[9px] md:text-xs font-bold transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>Explorer</span>
              <ArrowRight size={11} className="md:hidden" />
              <ArrowRight size={14} className="hidden md:block" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center gap-1.5 border border-white/20 hover:border-white/50 bg-black/30 backdrop-blur-xs text-white/90 hover:text-white px-4 py-2.5 md:px-8 md:py-4 uppercase tracking-[1.5px] md:tracking-[2.5px] text-[9px] md:text-xs font-medium transition-all duration-300"
            >
              <span>{siteConfig.hero_cta || "Rendez-vous"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: Luxury Animated Delivery & Assembly Ticker ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1E1912] via-[#2c2418] to-[#8b7344] text-white border-y border-white/10 md:px-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_55%)] before:opacity-60">
        {/* Desktop Ticker (Moving to the right, single continuous line) */}
        <div className="relative hidden overflow-hidden py-4 md:block">
          <div className="delivery-marquee delivery-marquee-right flex w-max items-center gap-10 whitespace-nowrap">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8f3e8] md:text-base"
              >
                <Check className="h-5 w-5 text-[#d1aa5c]" />
                <span>Livraison + montage dans les 58 wilayas</span>
                <span className="text-[#d1aa5c]">✦</span>
                <Truck className="h-5 w-5 text-[#d1aa5c]" />
                <span>Gratuit sur Alger, Blida, Boumerdès, Médéa &amp; Tipaza</span>
                <span className="text-[#d1aa5c]">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Ticker (Two lines moving in opposite directions) */}
        <div className="relative space-y-px overflow-hidden md:hidden">
          {/* Top Line: Moving to the Right */}
          <div className="border-b border-white/10 bg-black/10 py-3">
            <div className="delivery-marquee delivery-marquee-right flex w-max items-center gap-8 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f8f3e8]"
                >
                  <Check className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Livraison + montage dans les 58 wilayas</span>
                  <span className="text-[#d1aa5c]">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line: Moving to the Left */}
          <div className="bg-[#17130e]/35 py-3">
            <div className="delivery-marquee delivery-marquee-left flex w-max items-center gap-8 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f8f3e8]"
                >
                  <Truck className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Gratuit sur Alger, Blida, Boumerdès, Médéa &amp; Tipaza</span>
                  <span className="text-[#d1aa5c]">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: 3D Curved Product Showcase ── */}
      <CurvedProductShowcase />

      {/* ── Section 4: Categories ── */}
      <section className="bg-gradient-to-b from-[#0E0F10] to-[#141518] pt-10 md:pt-14 pb-6 md:pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 border border-white/10 px-3.5 py-1 text-[11px] uppercase tracking-[3px] text-[#A1A1AA] mb-2 rounded-none">
              <Sparkles className="w-3 h-3 text-[#b68d40]" />
              Nos Univers
            </span>
            <h2 className="font-fraunces font-light text-2xl sm:text-3xl md:text-4xl text-white">
              Explorer par Catégorie
            </h2>
          </div>
          
          <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap justify-start md:justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 pb-1 scrollbar-hide">
            {categories.map((cat, index) => (
              <LuxuryReveal key={cat.name} delay={index * 60} className="shrink-0">
                <Link href={`/all-products?category=${cat.slug}`} scroll={false} className="interactive-tap group flex flex-col items-center">
                  <div className="w-22 h-22 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-30 lg:h-30 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-[#b68d40] transition-all duration-500 mb-2.5 shadow-md group-hover:shadow-[0_8px_20px_rgba(182,141,64,0.25)]">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  <span className="font-sora text-xs sm:text-sm text-[#D1D5DB] group-hover:text-[#b68d40] transition-colors duration-300 font-medium tracking-wide">
                    {cat.name}
                  </span>
                </Link>
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Products Carousel ('NOS PRODUITS') ── */}
      <section className="bg-[#0E0F10] py-16 md:py-24 overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex justify-between items-end">
          <h2 className="font-fraunces font-light italic text-3xl md:text-4xl text-[#F2F1EF] uppercase tracking-wide">
            NOS PRODUITS
          </h2>
          <div className="hidden md:flex gap-3">
            <button 
              onClick={() => scrollCarousel('left')}
              className="w-10 h-10 flex items-center justify-center bg-[#F2F1EF]/95 text-[#0E0F10] hover:bg-[#0E0F10] hover:text-[#F2F1EF] border border-[#F2F1EF]/95 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="w-10 h-10 flex items-center justify-center bg-[#F2F1EF]/95 text-[#0E0F10] hover:bg-[#0E0F10] hover:text-[#F2F1EF] border border-[#F2F1EF]/95 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Mobile Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 z-10 md:hidden">
            <button 
              onClick={() => scrollCarousel('left')}
              className="w-8 h-8 flex items-center justify-center bg-[#18191B] border border-[rgba(199,203,209,0.3)] text-[#C7CBD1] rounded-full shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10 md:hidden">
            <button 
              onClick={() => scrollCarousel('right')}
              className="w-8 h-8 flex items-center justify-center bg-[#18191B] border border-[rgba(199,203,209,0.3)] text-[#C7CBD1] rounded-full shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sideways scrollable container */}
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 md:gap-6 px-4 sm:px-6 lg:px-8 pb-8 scrollbar-hide md:[mask-image:linear-gradient(90deg,transparent_0%,black_5%,black_95%,transparent_100%)] snap-x snap-mandatory"
          >
            {carouselProducts.map((product, idx) => (
              <LuxuryReveal key={product.id} delay={idx * 100} className="shrink-0 snap-start">
                <ProductCard product={product} />
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Modèles Prêts Grid (Wide Horizontal Luxury Editorial Format) ── */}
      <section className="bg-[#101114] py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 border border-[#b68d40]/30 bg-[#18191B] px-3.5 py-1 text-[11px] uppercase tracking-[3px] text-[#b68d40] font-bold mb-3 font-sora shadow-sm rounded-none">
              <Sparkles className="w-3 h-3 text-[#b68d40]" />
              Disponibilité Immédiate
            </span>
            <h2 className="font-fraunces font-light text-3xl sm:text-4xl md:text-5xl text-white mb-3">
              Modèles Prêts à Livrer
            </h2>
            <div className="w-16 h-[2px] bg-[#b68d40] mx-auto mb-4" />
            <p className="font-sora text-xs sm:text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
              Sélection exclusive de créations confectionnées et prêtes pour une expédition soignée chez vous sous 48 à 72 heures.
            </p>
          </div>
          
          {/* 2-Column Wide Horizontal Cards Grid (Close to each other, horizontally broad) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">
            {gridProducts.map((product, idx) => (
              <LuxuryReveal key={product.id} delay={idx * 80} className="w-full">
                <div className="group relative bg-[#141518] border border-white/10 hover:border-[#b68d40]/60 transition-all duration-500 rounded-none overflow-hidden flex flex-col h-full shadow-xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
                  
                  {/* Wide Horizontal Image Viewport */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] w-full overflow-hidden bg-[#0A0B0C]">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                    />

                    {/* Ambient Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141518] via-transparent to-black/40 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/75 backdrop-blur-md border border-white/15 text-[#f4d79a] text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-1 font-sora shadow-md rounded-none">
                          {product.category.replace('-', ' ')}
                        </span>
                        {product.discount && (
                          <span className="bg-[#b68d40] text-black text-[10px] font-bold px-2 py-1 font-sora shadow-md rounded-none">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Ready to ship badge */}
                      <span className="inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-medium tracking-wider px-2.5 py-1 font-sora shadow-md rounded-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Expédition 48h</span>
                      </span>
                    </div>

                    {/* Quick link overlay */}
                    <Link 
                      href={`/product/${product.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={product.name}
                    />
                  </div>

                  {/* Editorial Bottom Surface */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between font-sora bg-[#141518]">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] sm:text-[11px] text-[#b68d40] font-semibold uppercase tracking-[2.5px]">
                          {product.brand || "Château d'art"}
                        </span>
                        <span className="text-[10px] text-[#71717A] tracking-wider uppercase">
                          Prêt à livrer
                        </span>
                      </div>

                      <Link href={`/product/${product.id}`} className="block group/title">
                        <h3 className="font-fraunces text-lg sm:text-xl md:text-2xl text-white font-normal leading-snug line-clamp-1 group-hover/title:text-[#b68d40] transition-colors mb-1.5">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#9CA3AF] line-clamp-1 leading-relaxed mb-3">
                        {product.description || "Création sculpturale confectionnée dans le respect de l'ébénisterie d'art."}
                      </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-bold text-[#f4d79a]">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-[#71717A] line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#71717A] tracking-wide">
                          Livraison + montage inclus
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          className="interactive-tap px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium tracking-wider uppercase border border-white/15 transition-all"
                        >
                          Détails
                        </Link>
                        <Link
                          href={`/contact?product=${encodeURIComponent(product.name)}&subject=${encodeURIComponent(`Commande rapide: ${product.name}`)}#contact-form`}
                          className="interactive-tap px-4 sm:px-5 py-2 bg-[#b68d40] hover:bg-[#c99b4d] text-black text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:scale-105"
                        >
                          Commander
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </LuxuryReveal>
            ))}
          </div>
          
          <div className="mt-12 md:mt-16 text-center">
            <Link 
              href="/all-products" 
              className="interactive-tap inline-flex items-center gap-2 border border-white/20 bg-[#0E0F10] text-white px-10 py-4 uppercase tracking-[2.5px] text-xs font-bold transition-all duration-300 hover:bg-[#b68d40] hover:border-[#b68d40] hover:text-black shadow-xl hover:scale-105"
            >
              <span>Voir tout le catalogue complet</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 6.5: Design Stories & Inspirations (Interactive Video Shapes) ── */}
      <DesignStories />

      {/* ── Section 7: Témoignages & Avis Clients Google (Livora Layout for Desktop, Mobile preserved) ── */}
      <ReviewsSection />

      <Footer />
    </main>
  );
}
