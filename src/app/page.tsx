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
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { ProductCard } from '@/components/product-card';
import { CurvedProductShowcase } from '@/components/curved-product-showcase';
import { DesignStories } from '@/components/design-stories';
import { ReviewsSection } from '@/components/reviews-section';
import { HeroQuoteWidget } from '@/components/hero-quote-widget';
import { FaqSection } from '@/components/faq-section';
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

      {/* ── Section 1: Cinematic High-Converting Hero with Interactive Quote Widget ── */}
      <section className="relative w-full min-h-[680px] lg:min-h-[660px] xl:min-h-[700px] overflow-hidden flex items-center py-16 md:py-20 lg:py-10 xl:py-14">
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

        {/* Ambient Dark Overlay tailored for two-column contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F10]/95 via-[#0E0F10]/85 to-[#0E0F10]/75 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0F10]/80 via-transparent to-[#0E0F10] z-10 pointer-events-none" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* ── Left Column: High-Conversion Headline, Copy & Google Reviews (Positioned slightly higher on PC) ── */}
            <div className="lg:col-span-6 xl:col-span-7 text-left flex flex-col items-start lg:-translate-y-3 xl:-translate-y-4">
              {/* Eyebrow badge (Sharp-edged architectural design) */}
              <div className="mb-3.5 lg:mb-2.5 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                <span className="inline-flex items-center gap-2 border border-white/15 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-none text-[10px] md:text-xs font-sora text-[#E4E4E7] tracking-[2.5px] uppercase shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#d1aa5c] shadow-[0_0_8px_#d1aa5c]" />
                  <span>{siteConfig.hero_eyebrow || "CHÂTEAU D'ART · MAISON DE DESIGN"}</span>
                </span>
              </div>

              {/* Main Headline: Thin first line, Thick second line (Matching reference image) */}
              <div className="mb-4 lg:mb-3 animate-fade-in-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
                <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[48px] text-white leading-[1.14] tracking-tight">
                  <span className="font-light text-white/85 block">
                    Meilleur magasin de Meubles,
                  </span>
                  <span className="font-extrabold text-white block mt-1 tracking-tight">
                    à Birkhadem
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="mb-6 lg:mb-4 max-w-xl animate-fade-in-up" style={{ animationDelay: '220ms', animationFillMode: 'both' }}>
                <p className="font-sora text-sm md:text-base lg:text-[14px] xl:text-[15px] text-white/75 leading-relaxed font-normal">
                  {siteConfig.hero_subtitle || "Matières nobles, proportions sculpturales et finitions artisanales pensées pour sublimer vos espaces de vie."}
                </p>
              </div>

              {/* Google Reviews 5-Star Social Proof Badge (Clickable to Google Maps) */}
              <div className="mb-6 lg:mb-4.5 animate-fade-in-up" style={{ animationDelay: '320ms', animationFillMode: 'both' }}>
                <a
                  href="https://www.google.com/maps/place/Ch%C3%A2teau+D'Art+-+meubles/@36.7083703,3.0600586,17z/data=!4m8!3m7!1s0x128fad5fae229a89:0xa8afd38ca1b6e44f!8m2!3d36.7083703!4d3.0626335!9m1!1b1!16s%2Fg%2F11gsn14yk8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex flex-wrap items-center gap-3 px-4 py-2.5 lg:py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#d1aa5c]/40 transition-all duration-300 shadow-lg"
                  title="Voir les avis sur Google Maps"
                >
                  {/* 5 Golden Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#d1aa5c] text-[#d1aa5c]" />
                    ))}
                  </div>

                  <span className="text-xs md:text-sm font-semibold text-white group-hover:text-[#d1aa5c] transition-colors">
                    4.9 / 5 sur Google Maps
                  </span>

                  <span className="hidden sm:inline text-white/30">•</span>

                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    Showroom Birkhadem • Devis gratuit
                  </span>

                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#d1aa5c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              {/* Direct Collection Quick Links */}
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                <Link
                  href="/all-products"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-3 lg:py-2.5 lg:px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border border-white/10"
                >
                  <span>Explorer le catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d1aa5c]" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white px-4 py-3 lg:py-2.5 text-xs font-medium transition-colors"
                >
                  <span>Nous trouver</span>
                </Link>
              </div>
            </div>

            {/* ── Right Column: Interactive One-Question-At-A-Time Funnel Widget ── */}
            <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <HeroQuoteWidget />
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Luxury Animated Delivery & Craftsmanship Ticker ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1E1912] via-[#2c2418] to-[#8b7344] text-white border-y border-white/10 md:px-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_55%)] before:opacity-60">
        {/* Desktop Tickers (Two opposite lines: Right and Left) */}
        <div className="relative hidden overflow-hidden md:block">
          {/* Top Line: Moving to the Right */}
          <div className="border-b border-white/10 py-3.5">
            <div className="delivery-marquee delivery-marquee-right flex w-max items-center gap-10 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f8f3e8] lg:text-sm"
                >
                  <Check className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Livraison + montage dans les 58 wilayas</span>
                  <span className="text-[#d1aa5c]">✦</span>
                  <Truck className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Gratuit sur Alger, Blida, Boumerdès, Médéa &amp; Tipaza</span>
                  <span className="text-[#d1aa5c]">◆</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line: Moving to the Left (Useful furniture guarantees & custom craftmanship) */}
          <div className="bg-[#17130e]/40 py-3.5">
            <div className="delivery-marquee delivery-marquee-left flex w-max items-center gap-10 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f8f3e8] lg:text-sm"
                >
                  <Sparkles className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Fabrication artisanale en bois noble séché</span>
                  <span className="text-[#d1aa5c]">✦</span>
                  <ShieldCheck className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Personnalisation sur-mesure des dimensions &amp; tissus</span>
                  <span className="text-[#d1aa5c]">✦</span>
                  <Check className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Showroom d&apos;exception à Birkhadem · Plans 3D offerts</span>
                  <span className="text-[#d1aa5c]">✦</span>
                  <ShieldCheck className="h-4 w-4 text-[#d1aa5c]" />
                  <span>Paiement sécurisé à la livraison après inspection</span>
                  <span className="text-[#d1aa5c]">◆</span>
                </span>
              ))}
            </div>
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

      {/* ── Section 8: FAQ (SEO Structured Q&A, Golden Environment & MouseLeave Auto-Close) ── */}
      <FaqSection />

      <Footer />
    </main>
  );
}
