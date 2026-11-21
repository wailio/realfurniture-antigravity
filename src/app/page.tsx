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
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { CurvedProductShowcase } from '@/components/curved-product-showcase';
import { ArtHomeCollectionSlider } from '@/components/arthome-collection-slider';
import { ArtHomeNewArrivals } from '@/components/arthome-new-arrivals';
import { ArtHomeRoomsAndFeatured } from '@/components/arthome-rooms-and-featured';
import { DesignStories } from '@/components/design-stories';
import { HeroQuoteWidget } from '@/components/hero-quote-widget';
import { FaqSection } from '@/components/faq-section';
import { products } from '@/lib/products';
import { useSiteConfig } from '@/lib/use-site-config';

export default function HomePage() {
  const siteConfig = useSiteConfig();

  const categories = [
    { name: 'Salle à manger', image: '/categories/salle-a-manger.jpg', slug: 'salle-a-manger' },
    { name: 'Canapés & Salons', image: '/categories/canapes.jpg', slug: 'sofas' },
    { name: 'Chambres & Suites', image: '/categories/chambres.jpg', slug: 'chambres' },
    { name: 'Armoires & Dressings', image: '/categories/armoire.jpg', slug: 'armoire' },
    { name: 'Accessoires', image: '/categories/accessoires.jpg', slug: 'accessories' },
  ];

  const [productList, setProductList] = React.useState<any[]>(products);

  // 5 Showroom Showcase Background Images — starting strictly with '1bg-b' (hero-1.jpg)
  const heroImages = [
    { src: '/hero/hero-1.jpg', alt: "M&F Meubles — Salon d'angle modulable de prestige", label: "Salon Modulable" },
    { src: '/hero/hero-2.jpg', alt: "M&F Meubles — Canapés Chesterfield et marbre d'exception", label: "Chesterfield Luxe" },
    { src: '/hero/hero-3.jpg', alt: "M&F Meubles — Table à manger et finitions or", label: "Salle à Manger" },
    { src: '/hero/hero-4.jpg', alt: "M&F Meubles — Espace salle à manger contemporain avec miroir", label: "Espace Réception" },
    { src: '/hero/hero-5.jpg', alt: "M&F Meubles — Séjour complet et meuble TV haut de gamme", label: "Salon Séjour" },
  ];

  const [activeHeroIndex, setActiveHeroIndex] = React.useState(0);

  React.useEffect(() => {
    // 5.5 seconds per slide: smooth, relaxing luxury showroom ambiance
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

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

  return (
    <main id="main-content" className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#111827] selection:text-white">
      {/* ── Section 1: Compact Architectural Hero with Taskbar Directly Overlaid ── */}
      <section className="hero-section relative w-full min-h-[640px] lg:min-h-[670px] xl:min-h-[700px] overflow-hidden flex flex-col justify-between bg-[#08090C]">
        {/* ── 5 Showroom Showcase Background Images (Continuous Crossfade & Subtle Zoom) ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {heroImages.map((img, idx) => {
            const isActive = idx === activeHeroIndex;
            return (
              <div
                key={img.src}
                className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isActive ? 2 : 1,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full h-full object-cover object-[center_42%] select-none transition-transform duration-[6000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  style={{
                    filter: 'contrast(1.04) brightness(0.92) saturate(1.05)',
                  }}
                />
              </div>
            );
          })}

          {/* Luxury Atmospheric Lighting & Scrim Effects: */}
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(4, 5, 8, 0.90) 0%, rgba(4, 5, 8, 0.45) 55%, transparent 100%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, rgba(5, 7, 10, 0.88) 0%, rgba(5, 7, 10, 0.72) 36%, rgba(5, 7, 10, 0.28) 70%, rgba(5, 7, 10, 0.05) 100%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(circle at 38% 54%, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.02) 42%, transparent 70%), radial-gradient(circle at 78% 68%, rgba(225, 185, 105, 0.09) 0%, transparent 50%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(4, 5, 8, 0.55) 100%)',
            }}
          />

          {/* Seamless bottom fade into the gold ticker */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111827] via-[#111827]/70 to-transparent pointer-events-none z-10" />
        </div>

        {/* ── TOP TASKBAR: Placed Directly on the Background Image ── */}
        <Header theme="overlay" />

        {/* ── HERO CONTENT GRID: Compact, Visible Above the Fold Without Scrolling ── */}
        <div className="relative z-20 w-full max-w-[1560px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-20 pb-8 md:pt-24 md:pb-10 lg:pt-24 lg:pb-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-center">
            
            {/* ── Left Column: Lightly Scaled Up for Prominence ── */}
            <div className="lg:col-span-6 xl:col-span-7 text-left flex flex-col items-start lg:-translate-y-1">
              
              {/* Eyebrow badge */}
              <div className="mb-2.5">
                <span className="text-[11px] sm:text-[12px] tracking-[0.18em] text-[#d1aa5c] uppercase font-medium flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-[#d1aa5c]/60" />
                  <span>Choisissez ce que vous souhaitez sur le côté droit</span>
                  <span className="inline-block w-5 h-px bg-[#d1aa5c]/60" />
                </span>
              </div>

              {/* Main Headline with Apple / Luxury thick-and-thin typographic duel */}
              <div className="mb-3">
                <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] xl:text-[54px] text-white leading-[1.08] tracking-tight">
                  <span className="font-serif italic font-light text-white/95 block text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] xl:text-[52px] mb-0.5 drop-shadow-md">
                    Meilleur magasin de Meubles,
                  </span>
                  <span className="font-sans font-black text-white block tracking-tight drop-shadow-lg text-4xl sm:text-5xl md:text-[48px] lg:text-[52px] xl:text-[58px]">
                    à Kouba, Alger
                  </span>
                </h1>
              </div>

              {/* Useful Subtitle (Max 3 lines, comfortable reading size) */}
              <div className="mb-5 max-w-xl">
                <p className="text-[13.5px] sm:text-[14.5px] md:text-[15px] text-white/80 leading-relaxed font-light drop-shadow-sm line-clamp-3">
                  Canapés d&apos;exception, salons modulaires et mobilier sur-mesure confectionnés dans nos ateliers et showroom à Kouba (Alger) avec des finitions haut de gamme pour sublimer votre intérieur.
                </p>
              </div>

              {/* CTA Buttons — Slightly larger & comfortable */}
              <div className="flex flex-wrap items-center gap-3.5 mb-6">
                <a
                  href="#devis"
                  className="inline-flex items-center justify-center px-6 sm:px-7 py-3 rounded-full bg-[#d1aa5c] hover:bg-amber-400 text-black font-semibold text-xs sm:text-[12.5px] tracking-wider uppercase transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  Demander un devis
                </a>
                <Link
                  href="/all-products"
                  className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full border border-white/35 hover:border-white hover:bg-white/10 text-white/90 hover:text-white text-xs sm:text-[12.5px] font-normal tracking-wide transition-all duration-200 backdrop-blur-xs"
                >
                  <span>découvrir les créations</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Stats Row with delicate vertical dividers & Slideshow indicators */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4 border-t border-white/12 text-white/90">
                <a
                  href="https://maps.app.goo.gl/PgX4a88fpg7dPQkFA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">4.9</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[10.5px] text-white/65 tracking-wider mt-0.5">Avis vérifiés Google Maps</span>
                </a>

                <div className="h-7 w-px bg-white/15" />

                <div className="flex flex-col">
                  <span className="font-bold text-base sm:text-lg text-white leading-none">100%</span>
                  <span className="text-[10px] sm:text-[10.5px] text-white/65 tracking-wider mt-1">sur-mesure garanti</span>
                </div>

                <div className="h-7 w-px bg-white/15" />

                <div className="flex flex-col">
                  <span className="font-bold text-base sm:text-lg text-white leading-none">10 ans</span>
                  <span className="text-[10px] sm:text-[10.5px] text-white/65 tracking-wider mt-1">garantie boiserie</span>
                </div>
              </div>

              {/* Minimal Luxury Slideshow Navigation Indicators */}
              <div className="flex items-center gap-2 mt-5">
                {heroImages.map((img, idx) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setActiveHeroIndex(idx)}
                    aria-label={`Afficher ${img.label}`}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === activeHeroIndex
                        ? 'w-8 bg-[#d1aa5c]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
                <span className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-light">
                  {heroImages[activeHeroIndex]?.label}
                </span>
              </div>
            </div>

            {/* ── Right Column: Interactive Widget (Raised Up) ── */}
            <div className="lg:col-span-6 xl:col-span-5 w-full flex flex-col items-center lg:items-end lg:justify-center lg:-translate-y-2 xl:-translate-y-3">
              <div className="w-full flex justify-center lg:justify-end">
                <HeroQuoteWidget />
              </div>

              {/* Mobile CTA shortcuts below widget */}
              <div className="flex lg:hidden items-center gap-2 mt-3 w-full justify-center">
                <Link
                  href="/all-products"
                  className="inline-flex items-center gap-1.5 bg-[#111827] text-white px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-xs"
                >
                  <span>Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 bg-white text-neutral-800 border border-neutral-200 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                >
                  <span>Showroom</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Luxury Animated Delivery & Craftsmanship Ticker with Artistic Paint Throws ── */}
      <section className="relative overflow-hidden bg-[#101217] text-white border-y border-white/[0.12]">
        {/* Ambient Luminous White Paint Diffusions (Soft Atelier Mist) */}
        <div className="pointer-events-none absolute -top-10 left-[15%] h-36 w-80 rounded-full bg-white/[0.09] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-[20%] h-32 w-96 rounded-full bg-white/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-[55%] -translate-y-1/2 h-24 w-64 rounded-full bg-white/[0.06] blur-2xl" />

        {/* Artistic Hand-Crafted Paint Throws & Random Splatters Overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-65 mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 96"
          fill="none"
        >
          {/* Dynamic White Paint Throw / Brush Splashes (Organic curved gestures) */}
          <path
            d="M-20,48 C60,20 140,75 220,38 C280,10 320,62 380,44 C420,32 450,55 490,48 C430,60 360,65 300,52 C210,78 120,50 -20,62 Z"
            fill="url(#whitePaintGlow1)"
            opacity="0.35"
          />
          <path
            d="M620,25 C710,5 790,60 880,32 C950,10 1020,45 1110,28 C1040,55 960,42 900,58 C820,65 730,40 620,42 Z"
            fill="url(#whitePaintGlow2)"
            opacity="0.3"
          />
          <path
            d="M1180,60 C1240,30 1310,75 1390,40 C1430,22 1470,50 1500,35 C1470,62 1420,68 1360,55 C1290,75 1230,68 1180,72 Z"
            fill="url(#whitePaintGlow1)"
            opacity="0.25"
          />

          {/* Random Paint Splatters & Droplets (Flicks of white paint of various sizes) */}
          <circle cx="85" cy="22" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="98" cy="30" r="2.8" fill="#FFFFFF" opacity="0.65" />
          <circle cx="112" cy="18" r="1.2" fill="#FFFFFF" opacity="0.5" />
          <circle cx="125" cy="36" r="3.2" fill="#FFFFFF" opacity="0.75" />
          <circle cx="140" cy="26" r="1.6" fill="#FFFFFF" opacity="0.6" />
          <circle cx="160" cy="42" r="2.2" fill="#FFFFFF" opacity="0.4" />
          <circle cx="175" cy="20" r="1.0" fill="#FFFFFF" opacity="0.7" />

          <circle cx="340" cy="68" r="2.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="355" cy="74" r="1.5" fill="#FFFFFF" opacity="0.5" />
          <circle cx="370" cy="62" r="3.5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="388" cy="78" r="1.8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="405" cy="65" r="2.0" fill="#FFFFFF" opacity="0.45" />

          <circle cx="580" cy="18" r="2.2" fill="#FFFFFF" opacity="0.75" />
          <circle cx="598" cy="28" r="3.6" fill="#FFFFFF" opacity="0.6" />
          <circle cx="615" cy="14" r="1.4" fill="#FFFFFF" opacity="0.8" />
          <circle cx="632" cy="32" r="2.0" fill="#FFFFFF" opacity="0.5" />

          <circle cx="820" cy="72" r="3.0" fill="#FFFFFF" opacity="0.7" />
          <circle cx="838" cy="64" r="1.5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="855" cy="80" r="2.4" fill="#FFFFFF" opacity="0.8" />
          <circle cx="875" cy="68" r="1.2" fill="#FFFFFF" opacity="0.5" />

          <circle cx="1060" cy="24" r="3.2" fill="#FFFFFF" opacity="0.65" />
          <circle cx="1078" cy="16" r="1.6" fill="#FFFFFF" opacity="0.8" />
          <circle cx="1095" cy="34" r="2.6" fill="#FFFFFF" opacity="0.7" />
          <circle cx="1115" cy="20" r="1.2" fill="#FFFFFF" opacity="0.45" />

          <circle cx="1290" cy="70" r="2.8" fill="#FFFFFF" opacity="0.75" />
          <circle cx="1308" cy="78" r="1.4" fill="#FFFFFF" opacity="0.5" />
          <circle cx="1325" cy="62" r="3.4" fill="#FFFFFF" opacity="0.65" />
          <circle cx="1345" cy="74" r="1.8" fill="#FFFFFF" opacity="0.8" />

          {/* Linear Paint Gradients */}
          <defs>
            <linearGradient id="whitePaintGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="whitePaintGlow2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle Edge Fade Gradients for Seamless Dissolve */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-[#101217] via-[#101217]/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-[#101217] via-[#101217]/90 to-transparent z-10" />

        {/* Desktop Tickers (Two opposite lines: Right and Left) */}
        <div className="relative hidden overflow-hidden md:block">
          {/* Top Line: Gliding to the Right */}
          <div className="border-b border-white/[0.08] py-3">
            <div className="delivery-marquee delivery-marquee-right flex w-max items-center gap-12 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 text-[12px] lg:text-[12.5px] font-normal uppercase tracking-[0.2em] text-white/80"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.12] text-white border border-white/25 text-[11px] font-semibold tracking-wider shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                    Livraison 58 Wilayas
                  </span>
                  <span>Montage professionnel soigné</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="text-white font-medium">Offerte sur Alger &amp; wilayas limitrophes</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.09] text-white border border-white/20 text-[11px] font-medium tracking-wider">
                    Ateliers d&apos;artisanat
                  </span>
                  <span>Confection sur-mesure</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="text-white font-medium">Showroom d&apos;exception à Kouba (Alger)</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line: Gliding to the Left */}
          <div className="py-3 bg-white/[0.02]">
            <div className="delivery-marquee delivery-marquee-left flex w-max items-center gap-12 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 text-[12px] lg:text-[12.5px] font-normal uppercase tracking-[0.2em] text-white/80"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.12] text-white border border-white/25 text-[11px] font-semibold tracking-wider shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                    Garantie 10 Ans
                  </span>
                  <span>Boiserie noble séchée au four</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="text-white font-medium">Tissus anti-taches &amp; cuirs italiens au choix</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.09] text-white border border-white/20 text-[11px] font-medium tracking-wider">
                    Étude 3D Offerte
                  </span>
                  <span>Personnalisation complète des dimensions</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                  <span className="text-white font-medium">Paiement sécurisé après inspection</span>
                  <span className="text-white/40 text-[10px]">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Ticker (Two sleek calm gliding lines with white capsules) */}
        <div className="relative overflow-hidden md:hidden">
          {/* Top Line: Moving to the Right */}
          <div className="border-b border-white/[0.08] py-2.5">
            <div className="delivery-marquee delivery-marquee-right flex w-max items-center gap-8 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.18em] text-white/80"
                >
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25 text-[9.5px] font-semibold">
                    58 Wilayas
                  </span>
                  <span>Livraison &amp; montage soigné</span>
                  <span className="text-white/40 text-[9px]">✦</span>
                  <span className="text-white font-medium">Showroom Kouba</span>
                  <span className="text-white/40 text-[9px]">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line: Moving to the Left */}
          <div className="py-2.5 bg-white/[0.02]">
            <div className="delivery-marquee delivery-marquee-left flex w-max items-center gap-8 whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.18em] text-white/80"
                >
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25 text-[9.5px] font-semibold">
                    Garantie 10 ans
                  </span>
                  <span>Boiserie noble · Sur-mesure</span>
                  <span className="text-white/40 text-[9px]">✦</span>
                  <span className="text-white font-medium">Paiement après inspection</span>
                  <span className="text-white/40 text-[9px]">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: 3D Curved Product Showcase ── */}
      <CurvedProductShowcase />

      {/* ── Section 4: Compact Thin Options Bar ("Nos Univers") with Square Apple Glass Tiles & Large Circles ── */}
      <section className="relative py-6 sm:py-7 md:py-8 overflow-hidden border-y border-white/60">
        {/* Layer 1: Real Mansion Hero Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/hero-mansion.jpg"
            alt="Atelier d'exception"
            className="w-full h-full object-cover object-[center_38%] scale-105 select-none"
            style={{
              filter: 'contrast(1.05) brightness(0.92) saturate(1.05)',
            }}
          />
        </div>

        {/* Layer 2: Pure Apple / iOS Glassy Frosted Diffusion (Soft, Eye-Comfy, Thin Dock Aesthetic) */}
        <div className="absolute inset-0 pointer-events-none backdrop-blur-2xl md:backdrop-blur-3xl bg-white/70" />

        {/* Layer 3: Architectural 2D Furniture Shapes Distributed Across the Entire Section (30% or less opacity) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* 1. Far Left Top: Dining Table & Chairs 2D Plan */}
          <div className="absolute -top-6 left-[2%] opacity-[0.07] -rotate-12 transition-transform duration-700">
            <img
              src="/shapes/shape-dining-set.png"
              alt=""
              className="w-26 sm:w-32 md:w-38 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 2. Upper Mid-Left: Wood Coffee Table with Books */}
          <div className="absolute top-[8%] left-[21%] opacity-[0.06] rotate-12 hidden sm:block">
            <img
              src="/shapes/shape-coffee-table.png"
              alt=""
              className="w-16 sm:w-20 md:w-22 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 3. Upper Center (Behind Header): Stools & Round Lounge Piece */}
          <div className="absolute -top-8 left-[48%] -translate-x-1/2 opacity-[0.06] -rotate-15">
            <img
              src="/shapes/shape-round-stools.png"
              alt=""
              className="w-20 sm:w-24 md:w-26 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 4. Upper Mid-Right: Designer Olive Plant */}
          <div className="absolute top-[12%] right-[22%] opacity-[0.06] rotate-45 hidden md:block">
            <img
              src="/shapes/shape-olive-plant.png"
              alt=""
              className="w-14 sm:w-16 md:w-18 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 5. Far Right Top: Luxury 2-Seater Sofa 2D Plan */}
          <div className="absolute -top-4 right-[2%] opacity-[0.07] rotate-8 transition-transform duration-700">
            <img
              src="/shapes/shape-sofa-top.png"
              alt=""
              className="w-28 sm:w-34 md:w-40 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 6. Lower Far-Left: Organic Olive Plant Accent */}
          <div className="absolute bottom-[8%] left-[4%] opacity-[0.06] -rotate-30 hidden sm:block">
            <img
              src="/shapes/shape-olive-plant.png"
              alt=""
              className="w-14 sm:w-16 md:w-18 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 7. Lower Mid-Left: Vertical Sofa with Cushions */}
          <div className="absolute -bottom-10 left-[26%] opacity-[0.06] -rotate-8 hidden md:block">
            <img
              src="/shapes/shape-sofa-vertical.png"
              alt=""
              className="w-18 sm:w-22 md:w-24 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 8. Lower Center: Sculptural Armchair with Cushions */}
          <div className="absolute -bottom-8 left-[52%] -translate-x-1/2 opacity-[0.06] rotate-12 hidden sm:block">
            <img
              src="/shapes/shape-armchair.png"
              alt=""
              className="w-16 sm:w-18 md:w-22 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 9. Lower Mid-Right: Round Stools & Table Combo */}
          <div className="absolute -bottom-8 right-[24%] opacity-[0.06] rotate-18 hidden lg:block">
            <img
              src="/shapes/shape-round-stools.png"
              alt=""
              className="w-18 sm:w-20 md:w-22 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* 10. Far Right Bottom: Long Artisan Buffet Table */}
          <div className="absolute -bottom-8 right-[3%] opacity-[0.07] -rotate-6 hidden sm:block">
            <img
              src="/shapes/shape-buffet-table.png"
              alt=""
              className="w-16 sm:w-20 md:w-24 h-auto drop-shadow-xs"
              draggable={false}
            />
          </div>
        </div>

        {/* Layer 4: Interactive Content with Compact Square Apple Frosted Glass Tiles */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Thin, Sleek Options Bar Header */}
          <div className="text-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1aa5c]" />
              <span className="text-[10px] md:text-[10.5px] uppercase tracking-[2.5px] text-neutral-600 font-semibold">
                Nos Univers
              </span>
            </div>
            <h2 className="font-serif italic font-normal text-xl sm:text-2xl md:text-[26px] text-neutral-900 tracking-tight leading-tight">
              Explorer par <span className="font-sans font-extrabold not-italic text-neutral-950">Catégorie</span>
            </h2>
          </div>
          
          {/* Square Option Tiles Grid with Maximized Inner Circles */}
          <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap justify-start md:justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 pb-2 px-1 scrollbar-hide">
            {categories.map((cat, index) => (
              <LuxuryReveal key={cat.name} delay={index * 50} className="shrink-0">
                <Link
                  href={`/all-products?category=${cat.slug}`}
                  scroll={false}
                  className="group flex flex-col items-center justify-between aspect-square w-[125px] sm:w-[140px] md:w-[152px] lg:w-[160px] bg-white/70 hover:bg-white/95 backdrop-blur-2xl border border-white/85 hover:border-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.14)] rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Big Circular Photo Frame (Larger scale inside the square tile) */}
                  <div className="relative w-[82px] h-[82px] sm:w-[94px] sm:h-[94px] md:w-[104px] md:h-[104px] lg:w-[110px] lg:h-[110px] rounded-full overflow-hidden p-1 bg-white/95 shadow-sm border border-neutral-200/70 group-hover:border-neutral-950 group-hover:shadow-md transition-all duration-400 shrink-0">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Clean Category Label at the bottom of the square */}
                  <div className="w-full px-1 text-center">
                    <span className="block text-[11px] sm:text-xs font-semibold text-neutral-800 group-hover:text-black transition-colors tracking-tight truncate">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cloned Art Home Furniture Interactive Collection Slider (Hotspots & Lookbook Carousel) ── */}
      <section className="relative mt-12 sm:mt-16 md:mt-20 mb-[45px] sm:mb-[60px] md:mb-[6vh]">
        <ArtHomeCollectionSlider />
      </section>

      {/* ── Cloned Art Home Furniture 'New Arrivals' Section (Black Marble, Cormorant Title, Vamtam Rolling Button) ── */}
      <ArtHomeNewArrivals />

      {/* ── Section 5 & 6: Art Home Cloned Unified Section ('Shop by Rooms' & 'NOS CRÉATIONS DU MOMENT') ── */}
      <ArtHomeRoomsAndFeatured products={productList} />

      {/* ── Section 6.5: Design Stories & Inspirations (Social Videos) ── */}
      <DesignStories />

      {/* ── Section 8: FAQ ── */}
      <FaqSection />

      <Footer />
    </main>
  );
}
