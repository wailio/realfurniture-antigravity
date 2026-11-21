'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MapPin, Clock, Phone, Sparkles, ArrowUpRight, Eye,
  Award, Feather, Headset, CheckCircle2, Calendar, X, ChevronRight, Sliders
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { useSiteConfig } from '@/lib/use-site-config';
import { getSafeMapEmbedUrl } from '@/lib/site-config';

/* ─── Types ─── */
interface ShowroomPhoto {
  id: string; title: string;
  category: 'all' | 'salons' | 'salles' | 'chambres' | 'details';
  categoryLabel: string; image: string; description: string; badge?: string;
}

const SHOWROOM_PHOTOS: ShowroomPhoto[] = [
  { id:'1', title:'Espace Salon Prestige & Marbre Calacatta', category:'salons', categoryLabel:'Salons', image:'/showroom-apres.jpg', description:'Présentation de nos canapés modulaires en bouclette texturée et tables en marbre poli.', badge:'Espace Principal' },
  { id:'2', title:'Villa Galerie & Architecture Intérieure', category:'salons', categoryLabel:'Salons', image:'/hero-mansion.jpg', description:'Scénographie lumineuse mettant en valeur les lignes épurées et les finitions dorées brossées.', badge:'Mise en Scène' },
  { id:'3', title:'Salon Réception & Luminaires Suspendus', category:'salons', categoryLabel:'Salons', image:'/arthome-rooms/living-room.jpg', description:'Une harmonie de tons taupe, bois thermo-traité et fauteuils ergonomiques sculptés.', badge:'Collection 2026' },
  { id:'4', title:'Espace Salles à Manger & Tables en Chêne Massif', category:'salles', categoryLabel:'Salles à Manger', image:'/arthome-rooms/dining-room.jpg', description:'Tables ovales et rectangulaires entourées de chaises tapissées main.', badge:'Haute Ébénisterie' },
  { id:'5', title:'Suite Parentale & Lits Capitonnés', category:'chambres', categoryLabel:'Chambres', image:'/arthome-rooms/bedroom.jpg', description:'Têtes de lit monumentales, tables de chevet suspendues et literie grand confort.', badge:'Espace Sommeil' },
  { id:'6', title:"Salon d'Accueil & Matiérothèque Privée", category:'details', categoryLabel:'Détails & Matières', image:'/images/contact-hero.jpg', description:"Rencontrez nos architectes et touchez plus de 150 échantillons de velours, cuirs et bois.", badge:'Conseil VIP' },
  { id:'7', title:"Espace Véranda & Mobilier d'Exception", category:'details', categoryLabel:'Détails & Matières', image:'/arthome-rooms/outdoor.jpg', description:"Sélection de matériaux résistants et designs d'avant-garde ouverts sur la lumière.", badge:'Nouveauté' },
  { id:'8', title:'Détails des Assemblages & Marbres Rares', category:'details', categoryLabel:'Détails & Matières', image:'/images/acbd.jpg', description:'Le soin artisanal apporté aux veinages du bois, coutures sellier et finitions laquées.', badge:'Finitions' },
];

/* ═══════════════════════════════════════════════════════════════
   BEFORE / AFTER SLIDER
   - Hover to follow mouse automatically (no click/drag needed)
   - Both images stay fixed; only the clip reveals the before layer
   - Smooth lerp via requestAnimationFrame
═══════════════════════════════════════════════════════════════ */
function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayPos, setDisplayPos] = useState(50);
  const targetRef   = useRef(50);
  const currentRef  = useRef(50);
  const rafRef      = useRef<number>(0);
  const activeRef   = useRef(false); // only run RAF when hovered

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const tick = useCallback(() => {
    // Slower lerp = smoother, less glitch on fast mouse movement
    const diff = targetRef.current - currentRef.current;
    if (Math.abs(diff) > 0.015) {
      currentRef.current = lerp(currentRef.current, targetRef.current, 0.16);
      setDisplayPos(currentRef.current);
    } else {
      currentRef.current = targetRef.current;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const setTarget = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Allow full 0–100% travel so images fully cover edge-to-edge
    targetRef.current = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 select-none cursor-ew-resize"
      onMouseMove={(e) => setTarget(e.clientX)}
      onMouseEnter={(e) => { activeRef.current = true; setTarget(e.clientX); }}
      onMouseLeave={() => { activeRef.current = false; }}
      onTouchMove={(e) => { if (e.touches[0]) setTarget(e.touches[0].clientX); }}
      onTouchStart={(e) => { if (e.touches[0]) setTarget(e.touches[0].clientX); }}
    >
      {/* After — full background, stays fixed */}
      <Image src="/showroom-apres.jpg" alt="Showroom après" fill priority className="object-cover object-center pointer-events-none" />

      {/* Before — clipped left side, image itself never moves */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${(100 - displayPos).toFixed(3)}% 0 0)` }}
      >
        <Image src="/showroom-avant.jpg" alt="Showroom avant" fill className="object-cover object-center pointer-events-none" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] pointer-events-none z-10"
        style={{
          left: `${displayPos.toFixed(3)}%`,
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 0 14px rgba(255,255,255,0.7)',
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-2xl flex items-center justify-center border border-neutral-200">
          <span className="text-[11px] font-bold leading-none mr-px">‹</span>
          <span className="text-[11px] font-bold leading-none ml-px">›</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide uppercase pointer-events-none">Avant</div>
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide uppercase pointer-events-none">Showroom Actuel</div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-medium pointer-events-none">
        Passez la souris pour comparer
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL-REVEAL — "L'Art du Détail, de Près."

   MOTION (from reference images):
   - Text is always visible, centered in the sticky viewport
   - 3 images start FAR below the screen (translateY ~100vh)
   - As user scrolls → images rise steadily at scroll speed (1:1)
   - When fully visible → 3 images side-by-side, overlapping text
   - As user scrolls past → images continue rising off the top
   - NO opacity animation on entry or exit — purely positional
   - Slight stagger: left is a bit lower, center lowest, right highest

   TECHNIQUE:
   - Direct DOM writes in scroll handler → zero React re-renders → buttery smooth
   - Section is 320vh tall, sticky inner is 100vh
   - Images travel from +100vh to -100vh over the scroll range
═══════════════════════════════════════════════════════════════ */
function ScrollRevealImages() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const img1Ref     = useRef<HTMLDivElement>(null);
  const img2Ref     = useRef<HTMLDivElement>(null);
  const img3Ref     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect   = section.getBoundingClientRect();
      const vh     = window.innerHeight;
      // scrolled = how many px we've scrolled inside this section
      // 0 when section top is at bottom of viewport
      // max when section bottom is at top of viewport
      const scrolledIntoSection = -rect.top;
      const maxScroll = section.offsetHeight - vh;
      // raw progress 0→1 over the whole section scroll
      const p = Math.max(0, Math.min(1, scrolledIntoSection / Math.max(1, maxScroll)));

      // Images travel from startY px → endY px (in px, relative to viewport)
      // startY: images begin below viewport = +120% of vh below their natural bottom position
      // We express travel as a simple linear interpolation over vh units
      // Image 1 (left): slightly lower offset, starts 10vh lower than img3
      // Image 2 (center): lowest, starts 20vh lower
      // Image 3 (right): highest starting point (least offset)
      const travelPx = vh * 2.4; // total travel distance in px (120vh down to 120vh up)
      const startOffsetPx = vh * 1.2; // start 120vh below their anchored position

      // extra downward offsets for stagger (images enter at slightly different times)
      const offset1 = vh * 0.08; // left: 8vh extra down
      const offset2 = vh * 0.18; // center: 18vh extra down (lowest, enters last)
      const offset3 = 0;         // right: no extra (highest, enters first)

      const y1 = startOffsetPx + offset1 - p * (travelPx + offset1);
      const y2 = startOffsetPx + offset2 - p * (travelPx + offset2);
      const y3 = startOffsetPx + offset3 - p * (travelPx + offset3);

      if (img1Ref.current) {
        img1Ref.current.style.transform = `translateY(${y1.toFixed(1)}px)`;
      }
      if (img2Ref.current) {
        // center also has translateX(-50%) for horizontal centering
        img2Ref.current.style.transform = `translateX(-50%) translateY(${y2.toFixed(1)}px)`;
      }
      if (img3Ref.current) {
        img3Ref.current.style.transform = `translateY(${y3.toFixed(1)}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={sectionRef} className="bg-[#F5F3F0]" style={{ height: '320vh' }}>
      {/* Sticky viewport — text and images live here */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-[#F5F3F0]" />

        {/* Text — in background, images scroll over it */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none" style={{ zIndex: 10 }}>
          <div className="text-center px-6 w-full">
            {/* Thin line: font-serif italic font-light (same as hero "Meilleur magasin") */}
            {/* Bold line: font-sans font-black (same as hero "à Kouba") */}
            <p className="text-[clamp(2.6rem,7.5vw,6.8rem)] leading-[1.1] tracking-tight text-black">
              <span className="font-serif italic font-light block">De plus près,</span>
              <span className="font-sans font-black block">de plus beau.</span>
            </p>
          </div>
        </div>

        {/* Images container — z-20, images scroll OVER the text */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          {/*
            Image 1 — LEFT
            anchored to left side, sitting at mid-height so it fills vertically
          */}
          <div
            ref={img1Ref}
            className="absolute"
            style={{
              left: '5%',
              top: '15%',
              width: '28%',
              willChange: 'transform',
            }}
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
              <Image
                src="/arthome-rooms/dining-room.jpg"
                alt="Salle à manger"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-[10px] font-semibold uppercase tracking-widest">Salle à Manger</p>
                <p className="text-white/65 text-[9px] font-light">Finition chêne massif</p>
              </div>
            </div>
          </div>

          {/*
            Image 2 — CENTER
            horizontally centered (left:50% + translateX(-50%) in JS)
            starts lowest (most stagger), so it lags behind slightly
          */}
          <div
            ref={img2Ref}
            className="absolute"
            style={{
              left: '50%',
              top: '22%',
              width: '26%',
              willChange: 'transform',
            }}
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ aspectRatio: '3/4' }}>
              <Image
                src="/arthome-rooms/bedroom.jpg"
                alt="Suite parentale"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-[10px] font-semibold uppercase tracking-widest">Suite Parentale</p>
                <p className="text-white/65 text-[9px] font-light">Tête de lit capitonnée</p>
              </div>
            </div>
          </div>

          {/*
            Image 3 — RIGHT
            highest (least stagger), appears first
          */}
          <div
            ref={img3Ref}
            className="absolute"
            style={{
              right: '5%',
              top: '10%',
              width: '28%',
              willChange: 'transform',
            }}
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
              <Image
                src="/arthome-rooms/living-room.jpg"
                alt="Salon prestige"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-[10px] font-semibold uppercase tracking-widest">Salon Prestige</p>
                <p className="text-white/65 text-[9px] font-light">Marbre &amp; Bouclette</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ShowroomPage() {
  const siteConfig = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'all' | 'salons' | 'salles' | 'chambres' | 'details'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<ShowroomPhoto | null>(null);

  const filteredPhotos = activeTab === 'all' ? SHOWROOM_PHOTOS : SHOWROOM_PHOTOS.filter(p => p.category === activeTab);
  const phone = siteConfig.phone_raw || '+213550000000';
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent("Bonjour M&F Meubles, je souhaite planifier une visite personnalisée de votre showroom à Kouba.")}`;

  return (
    <main id="main-content" className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <Header theme="light" />

      {/* ── 1. BANNER ── */}
      <section className="relative pt-6 pb-9 md:pt-10 md:pb-14 bg-[#FAFAF8] border-b border-neutral-200/70 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage:'repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(180deg,#000 0,#000 1px,transparent 0,transparent 50%)', backgroundSize:'48px 48px' }} />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-600 shadow-xs mb-3 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Kouba · Alger · Showroom &amp; Espace Design
            </span>
            <h1 className="text-[28px] sm:text-4xl md:text-[42px] font-extrabold text-[#111827] tracking-tight leading-[1.06] mb-2">
              Le Showroom{' '}
              <span className="font-serif italic font-light text-neutral-500">M&amp;F Meubles</span>
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-lg">
              Venez vivre l&apos;expérience du mobilier haut de gamme — touchez, imaginez, choisissez, guidé par nos designers.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all shadow-sm">
                <Calendar className="w-3.5 h-3.5" /> Réserver une visite VIP
              </a>
              <a href="#map-section"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold hover:bg-neutral-50 transition-all">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" /> Itinéraire &amp; Horaires
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BEFORE / AFTER ── */}
      <section className="py-14 md:py-20 bg-neutral-50 border-b border-neutral-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LuxuryReveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-3">
                <Sliders className="w-3 h-3" /> Métamorphose de l&apos;Espace
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">
                Glissez pour découvrir <span className="font-serif italic text-neutral-600">notre transformation</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                D&apos;un vaste espace brut à un écrin luxueux pensé pour révéler la beauté de chaque création.
              </p>
            </div>
          </LuxuryReveal>
          <div className="max-w-5xl mx-auto">
            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* ── 3. SCROLL REVEAL ── */}
      <ScrollRevealImages />

      {/* ── 4. GALLERY ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LuxuryReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Visite Photographique</span>
                <h2 className="text-2xl sm:text-4xl font-light text-neutral-900 tracking-tight mt-1">Les Espaces &amp; Ambiances</h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all','salons','salles','chambres','details'] as const).map((key, i) => {
                  const labels = ['Tous les espaces','Salons','Salles à Manger','Chambres','Matières & Détails'];
                  return (
                    <button key={key} type="button" onClick={() => setActiveTab(key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab===key?'bg-neutral-900 text-white shadow-xs':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                      {labels[i]}
                    </button>
                  );
                })}
              </div>
            </div>
          </LuxuryReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPhotos.map(photo => (
              <div key={photo.id} onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer flex flex-col bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/70 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <Image src={photo.image} alt={photo.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {photo.badge && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">{photo.badge}</span>}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-neutral-900 text-xs font-semibold shadow-lg">
                      <Eye className="w-3.5 h-3.5" /> Agrandir
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{photo.categoryLabel}</span>
                  <h3 className="text-sm font-semibold text-neutral-900 mt-1 leading-snug group-hover:text-neutral-600 transition-colors">{photo.title}</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. LIGHTBOX ── */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-[16/10] w-full">
              <Image src={selectedPhoto.image} alt={selectedPhoto.title} fill className="object-contain" />
            </div>
            <div className="p-6 bg-neutral-950 text-white border-t border-white/10">
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">{selectedPhoto.categoryLabel}</span>
              <h3 className="text-lg font-medium text-white mt-1">{selectedPhoto.title}</h3>
              <p className="text-xs text-neutral-400 font-light mt-1 max-w-2xl leading-relaxed">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. VALEURS — exact clone of About "Nos Valeurs Fondamentales" ── */}
      <section className="w-full py-16 md:py-24 bg-[#F3F1EE] px-4 md:px-12 lg:px-24 border-y border-neutral-200/60">
        <div className="max-w-7xl mx-auto">
          <LuxuryReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#b68d40] block mb-2">
                  Les Piliers de la Maison
                </span>
                <h2 className="font-serif text-[clamp(1.6rem,3.5vw,2.6rem)] text-neutral-900 font-light leading-[1.2]">
                  Nos Valeurs
                </h2>
              </div>
              <p className="text-neutral-500 text-sm max-w-xs leading-relaxed md:text-right">
                Trois engagements qui guident chacune de nos créations, de la conception à la livraison.
              </p>
            </div>
          </LuxuryReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: siteConfig.valeur_1_title || 'Excellence',
                body: siteConfig.valeur_1_text || 'Chaque pièce est fabriquée avec les meilleurs matériaux et un savoir-faire exceptionnel.',
                n: '01',
              },
              {
                icon: Feather,
                title: siteConfig.valeur_2_title || 'Authenticité',
                body: siteConfig.valeur_2_text || "Des designs uniques qui racontent une histoire et reflètent votre personnalité.",
                n: '02',
              },
              {
                icon: Headset,
                title: siteConfig.valeur_3_title || 'Service Client',
                body: siteConfig.valeur_3_text || "Un accompagnement personnalisé du début à la fin, du choix jusqu'à l'installation.",
                n: '03',
              },
            ].map((val, i) => (
              <LuxuryReveal key={i} delay={i * 100}>
                <div className="group bg-[#FAF8F5] border border-neutral-200 p-7 hover:border-[#b68d40]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden h-full flex flex-col">
                  {/* faint number watermark */}
                  <span
                    aria-hidden
                    className="absolute top-4 right-5 font-serif text-6xl font-bold text-neutral-100 select-none group-hover:text-[#b68d40]/10 transition-colors leading-none"
                  >
                    {val.n}
                  </span>

                  <div className="w-10 h-10 border border-[#b68d40]/30 flex items-center justify-center mb-5 bg-[#b68d40]/5">
                    <val.icon className="w-5 h-5 text-[#b68d40]" />
                  </div>
                  <h3 className="font-serif text-lg text-neutral-900 font-light mb-2">
                    {val.title}
                  </h3>
                  <div className="w-8 h-px bg-[#b68d40] mb-3" />
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed flex-1">
                    {val.body}
                  </p>
                </div>
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. MAP & INFO ── */}
      <section id="map-section" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LuxuryReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Informations Pratiques</span>
                  <h2 className="text-2xl sm:text-4xl font-light text-neutral-900 tracking-tight mt-1 mb-6">
                    Venez Découvrir <br /><span className="font-serif italic text-neutral-600">le Showroom</span>
                  </h2>
                  <div className="space-y-4">
                    {[
                      { icon:<MapPin className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5"/>, title:'Adresse', lines:["M&F Meubles · Kouba, Algiers, Algeria, 16311 (accès direct et parking clientèle réservé)."] },
                      { icon:<Clock className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5"/>, title:"Horaires d'Ouverture", lines:['Samedi – Jeudi : 08h30 – 19h00','Vendredi : Fermé'] },
                      { icon:<Phone className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5"/>, title:'Téléphone & WhatsApp', lines:[siteConfig.phone || '0797 59 30 79','Accueil téléphonique 6j/7 de 08h30 à 19h00'] },
                    ].map((row, i) => (
                      <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                        {row.icon}
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-900">{row.title}</h4>
                          {row.lines.map((l, j) => <p key={j} className="text-xs text-neutral-600 font-light mt-0.5">{l}</p>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all shadow-sm">
                    Contacter le Showroom par WhatsApp <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="lg:col-span-7 flex flex-col">
                <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-neutral-200/80 shadow-md relative bg-neutral-100">
                  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-800 shadow-sm flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-700" /> Showroom Kouba
                  </div>
                  <iframe
                    src={getSafeMapEmbedUrl(siteConfig.maps_embed_url)}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin" title="M&F Meubles Showroom Kouba"
                    className="w-full h-full min-h-[400px]"
                  />
                  <a href="https://maps.app.goo.gl/PgX4a88fpg7dPQkFA" target="_blank" rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all shadow-md">
                    Ouvrir dans Google Maps <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      <div className="h-16 md:h-24" />
      <Footer />
    </main>
  );
}
