'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { ReviewsSection } from '@/components/reviews-section';
import {
  Award,
  Feather,
  Headset,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSiteConfig } from '@/lib/use-site-config';

/* ─────────────────────────── small stat counter ─────────────────────────── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const steps = 50;
          const inc = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += inc;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutPage() {
  const siteConfig = useSiteConfig();

  return (
    <main id="main-content" className="min-h-screen bg-white text-neutral-900 font-sans">
      <Header theme="light" />

      {/* ═══════════════════════════════════════════════════════
          §1  EDITORIAL HERO — compact, typographic, asymmetric
          ═══════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-end">

            {/* Left — text */}
            <LuxuryReveal variant="left" className="lg:col-span-7">
              <div>
                {/* eyebrow */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#b68d40]">
                    Maison de Haute Création
                  </span>
                  <span className="flex-1 h-px bg-neutral-200 max-w-[60px]" />
                </div>

                {/* headline — serif + gold underline */}
                <h1 className="font-serif font-light text-[clamp(2rem,5vw,3.75rem)] text-neutral-950 leading-[1.1] tracking-tight">
                  {siteConfig.about_tagline || (
                    <>
                      L&apos;Art du Mobilier<br />
                      <span className="relative inline-block">
                        d&apos;Exception
                        <svg
                          aria-hidden
                          className="absolute -bottom-2 left-0 w-full"
                          viewBox="0 0 300 6"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path d="M0 3 Q75 0 150 3 Q225 6 300 3" stroke="#b68d40" strokeWidth="2" fill="none"/>
                        </svg>
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-neutral-500 text-sm md:text-base max-w-lg mt-6 leading-relaxed font-light">
                  {siteConfig.about_philosophie ||
                    "M&F Meubles crée des pièces qui allient l'héritage artisanal algérien et le design contemporain le plus pointu."}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <Link
                    href="/showroom"
                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-[2px] px-6 py-3 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Visiter le Showroom
                  </Link>
                  <Link
                    href="/all-products"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[2px] text-neutral-700 hover:text-neutral-950 transition-colors group"
                  >
                    Voir la Collection
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </LuxuryReveal>

            {/* Right — big emblem with floating stats */}
            <LuxuryReveal variant="right" delay={200} className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[380px]">
                <Image
                  src="/images/mf-logo-new.png"
                  alt="M&F Meubles — Logo"
                  width={380}
                  height={380}
                  className="w-full h-auto object-contain opacity-[0.92]"
                  priority
                />

                {/* Floating badge — top-left */}
                <div className="absolute -top-2 -left-4 bg-white border border-neutral-200 shadow-lg px-3 py-2 text-center min-w-[80px]">
                  <div className="text-xl font-bold text-neutral-900 leading-none">
                    <CountUp target={21} suffix="" />
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500 mt-0.5 font-medium">Ans (depuis 2005)</div>
                </div>

                {/* Floating badge — bottom-right */}
                <div className="absolute -bottom-2 -right-2 bg-white border border-neutral-200 shadow-lg px-3 py-2 text-center min-w-[90px]">
                  <div className="text-xl font-bold text-neutral-900 leading-none">
                    <CountUp target={12} suffix="" />
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500 mt-0.5 font-medium">Avis Google 5★</div>
                </div>
              </div>
            </LuxuryReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §2  STATS BAR — editorial numbers row
          ═══════════════════════════════════════════════════════ */}
      <section className="border-b border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
            {[
              { n: 21, s: '', label: "Années d'expérience (depuis 2005)" },
              { n: 69, s: '', label: 'Wilayas livrées' },
              { n: 500, s: '+', label: 'Projets sur-mesure' },
              { n: 12, s: '', label: 'Avis Google 5 étoiles' },
            ].map((stat, i) => (
              <LuxuryReveal key={i} delay={i * 80}>
                <div className="py-7 px-4 sm:px-8 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-none tracking-tight">
                    <CountUp target={stat.n} suffix={stat.s} />
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1.5 font-medium tracking-wide">{stat.label}</div>
                </div>
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §3  VALUES — 3 cards, typographic, editorial
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full py-16 md:py-24 bg-neutral-50 px-4 md:px-12 lg:px-24 border-y border-neutral-100">
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
                body:
                  siteConfig.valeur_1_text ||
                  'Chaque pièce est fabriquée avec les meilleurs matériaux et un savoir-faire exceptionnel.',
                n: '01',
              },
              {
                icon: Feather,
                title: siteConfig.valeur_2_title || 'Authenticité',
                body:
                  siteConfig.valeur_2_text ||
                  "Des designs uniques qui racontent une histoire et reflètent votre personnalité.",
                n: '02',
              },
              {
                icon: Headset,
                title: siteConfig.valeur_3_title || 'Service Client',
                body:
                  siteConfig.valeur_3_text ||
                  "Un accompagnement personnalisé du début à la fin, du choix jusqu'à l'installation.",
                n: '03',
              },
            ].map((val, i) => (
              <LuxuryReveal key={i} delay={i * 100}>
                <div className="group bg-white border border-neutral-200/70 p-7 hover:border-[#b68d40]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden h-full flex flex-col">
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

      {/* ═══════════════════════════════════════════════════════
          §4  REVIEWS — imported component
          ═══════════════════════════════════════════════════════ */}
      <ReviewsSection />

      {/* ═══════════════════════════════════════════════════════
          §6  HISTORY — image left, text right, full-bleed feel
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full py-16 md:py-24 bg-white px-4 md:px-12 lg:px-24 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* photo */}
          <LuxuryReveal variant="left">
            <div className="relative group overflow-hidden aspect-[4/3] shadow-xl bg-neutral-100">
              <Image
                src={siteConfig.about_image || '/images/locationim.jpg'}
                alt="Showroom M&F Meubles — Kouba"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-6 py-5">
                <span className="text-white text-xs font-medium tracking-wide">
                  Showroom M&amp;F Meubles · Kouba, Alger
                </span>
              </div>
            </div>
          </LuxuryReveal>

          {/* text */}
          <LuxuryReveal variant="right" delay={150}>
            <div className="space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#b68d40]">
                Trajectoire &amp; Vision
              </span>
              <h2 className="font-serif text-[clamp(1.6rem,3.5vw,2.6rem)] text-neutral-900 font-light leading-[1.2]">
                Notre Histoire
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {siteConfig.about_histoire ||
                  "Fondée avec la vision d'offrir un mobilier d'excellence en Algérie, M&F Meubles s'impose comme une référence incontournable."}
              </p>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {siteConfig.about_histoire_2 ||
                  "Chaque collection est le fruit d'un dialogue entre nos artisans et les grands courants du design international."}
              </p>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {siteConfig.about_histoire_3 ||
                  'Nous sélectionnons rigoureusement nos matériaux pour vous offrir durabilité, confort et élégance intemporelle.'}
              </p>

              {/* mini icon-row */}
              <div className="flex flex-wrap gap-4 pt-2">
                {['Algérie · 69 wilayas', 'Livraison + Montage', 'Sur-Mesure'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 border border-neutral-200 px-3 py-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#b68d40]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §7  CTA — full-width editorial band
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full pt-16 pb-28 md:pt-20 md:pb-36 bg-neutral-900 text-center px-4 relative overflow-hidden">
        {/* faint diagonal lines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)',
          }}
        />
        <LuxuryReveal>
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#b68d40] block mb-4">
            Prêt à Commencer ?
          </span>
          <h2 className="font-serif text-[clamp(1.5rem,4vw,2.75rem)] text-white font-light leading-[1.2] mb-4">
            Donnez Vie à Vos Plus Beaux Projets
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8 leading-relaxed font-light">
            Visitez notre showroom ou contactez nos designers pour une consultation sur mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#b68d40] hover:bg-[#a37c35] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-[2px] transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              <span>Prendre Rendez-vous</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/all-products"
              className="inline-flex items-center gap-2 border border-white/25 hover:border-white text-white/80 hover:text-white px-7 py-3.5 text-xs font-medium uppercase tracking-[2px] transition-all duration-300"
            >
              Voir le Catalogue
            </Link>
          </div>
        </LuxuryReveal>
      </section>

      <div className="h-16 md:h-24" />
      <Footer />
    </main>
  );
}
