'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { Award, Feather, Headset, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSiteConfig } from '@/lib/site-config';

export default function AboutPage() {
  const siteConfig = useSiteConfig();

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header theme="dark" />
      
      {/* ── Section 1 - Page Hero ── */}
      <section className="relative w-full pt-28 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#141518] to-[#0E0F10] overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <LuxuryReveal>
          <div className="inline-flex items-center gap-1.5 md:gap-2 border border-white/15 px-3 py-1 md:px-4 md:py-1.5 rounded-none text-[10px] md:text-xs uppercase tracking-[2px] md:tracking-[3px] text-[#b68d40] mb-4 md:mb-6">
            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>Maison de Haute Création</span>
          </div>
          <h1 className="font-fraunces font-light text-3xl md:text-6xl lg:text-7xl text-white tracking-tight mb-4 md:mb-6">
            {siteConfig.about_tagline || "À Propos de Château d'art"}
          </h1>
          <div className="flex justify-center w-full mb-8">
            <svg width="200" height="2" viewBox="0 0 200 2" fill="none" xmlns="http://www.w3.org/2000/svg" className="heading-underline">
              <path d="M0 1H200" stroke="#b68d40" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-[#D1D5DB] font-sora text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">
            {siteConfig.about_philosophie || "Redéfinir le luxe d'intérieur à travers des pièces sculpturales, conçues pour transcender les modes et magnifier le quotidien."}
          </p>
        </LuxuryReveal>
      </section>

      {/* ── Section 2 - Mission & Savoir-faire ── */}
      <section className="w-full py-10 md:py-32 bg-[#0E0F10] px-4 md:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <LuxuryReveal variant="left">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[3px] text-[#b68d40] font-bold block font-sora">
                Notre Philosophie
              </span>
              <h2 className="font-fraunces text-2xl md:text-5xl text-white font-light leading-tight">
                L&apos;Art de Vivre Réinventé
              </h2>
              <p className="font-sora text-[#B7BBC0] text-xs md:text-base leading-relaxed">
                {siteConfig.about_philosophie || "Chez Château d'art, nous concevons le mobilier comme l'âme d'un espace intérieur. Chaque pièce est pensée comme une composition architecturale alliant confort absolu, durabilité des matériaux et pureté esthétique."}
              </p>
              <p className="font-sora text-[#B7BBC0] text-xs md:text-base leading-relaxed">
                Du bois massif séché aux velours et bouclettes haut de gamme, nos maîtres ébénistes et tapissiers façonnent chaque modèle avec un soin minutieux. Nous refusons l&apos;uniformité pour privilégier l&apos;émotion et la personnalisation.
              </p>
            </div>
          </LuxuryReveal>

          <LuxuryReveal variant="right" delay={200}>
            <div className="flex items-center justify-center w-full py-4">
              <img
                src="/images/chateau-dart-emblem.png"
                alt="Château d'art - Votre Maison de Luxe"
                className="w-full max-w-[540px] h-auto object-contain transition-transform duration-700 hover:scale-105"
              />
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* ── Section 3 - Values ── */}
      <section className="w-full py-10 md:py-32 bg-[#121316] px-4 md:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <span className="text-xs uppercase tracking-[3px] text-[#b68d40] font-bold block mb-2 font-sora">
              Les Piliers de la Maison
            </span>
            <h2 className="font-fraunces text-2xl md:text-5xl text-white font-light">
              Nos Valeurs Fondamentales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <LuxuryReveal delay={0}>
              <div className="bg-[#0E0F10] border border-white/10 hover:border-[#b68d40]/50 transition-all duration-300 p-5 md:p-8 flex flex-col items-center text-center h-full rounded-sm shadow-lg hover:-translate-y-1">
                <div className="w-11 h-11 md:w-14 md:h-14 border border-[#b68d40]/30 rounded-full flex items-center justify-center mb-4 md:mb-6 bg-[#b68d40]/10">
                  <Award className="w-5 h-5 md:w-7 md:h-7 text-[#b68d40]" />
                </div>
                <h3 className="font-fraunces text-lg md:text-2xl text-white mb-2 md:mb-3 font-light">
                  {siteConfig.valeur_1_title || "Excellence"}
                </h3>
                <div className="w-10 h-[1px] bg-[#b68d40] mb-3 md:mb-4"></div>
                <p className="font-sora text-[#A1A1AA] text-xs md:text-sm leading-relaxed">
                  {siteConfig.valeur_1_text || "Sélection intransigeante des essences de bois, des aciers laqués et des tissus anti-taches haute résistance."}
                </p>
              </div>
            </LuxuryReveal>

            <LuxuryReveal delay={120}>
              <div className="bg-[#0E0F10] border border-white/10 hover:border-[#b68d40]/50 transition-all duration-300 p-5 md:p-8 flex flex-col items-center text-center h-full rounded-sm shadow-lg hover:-translate-y-1">
                <div className="w-11 h-11 md:w-14 md:h-14 border border-[#b68d40]/30 rounded-full flex items-center justify-center mb-4 md:mb-6 bg-[#b68d40]/10">
                  <Feather className="w-5 h-5 md:w-7 md:h-7 text-[#b68d40]" />
                </div>
                <h3 className="font-fraunces text-lg md:text-2xl text-white mb-2 md:mb-3 font-light">
                  {siteConfig.valeur_2_title || "Authenticité"}
                </h3>
                <div className="w-10 h-[1px] bg-[#b68d40] mb-3 md:mb-4"></div>
                <p className="font-sora text-[#A1A1AA] text-xs md:text-sm leading-relaxed">
                  {siteConfig.valeur_2_text || "Des lignes sobres et épurées qui défient les tendances éphémères pour s'épanouir durablement chez vous."}
                </p>
              </div>
            </LuxuryReveal>

            <LuxuryReveal delay={240}>
              <div className="bg-[#0E0F10] border border-white/10 hover:border-[#b68d40]/50 transition-all duration-300 p-5 md:p-8 flex flex-col items-center text-center h-full rounded-sm shadow-lg hover:-translate-y-1">
                <div className="w-11 h-11 md:w-14 md:h-14 border border-[#b68d40]/30 rounded-full flex items-center justify-center mb-4 md:mb-6 bg-[#b68d40]/10">
                  <Headset className="w-5 h-5 md:w-7 md:h-7 text-[#b68d40]" />
                </div>
                <h3 className="font-fraunces text-lg md:text-2xl text-white mb-2 md:mb-3 font-light">
                  {siteConfig.valeur_3_title || "Service Client"}
                </h3>
                <div className="w-10 h-[1px] bg-[#b68d40] mb-3 md:mb-4"></div>
                <p className="font-sora text-[#A1A1AA] text-xs md:text-sm leading-relaxed">
                  {siteConfig.valeur_3_text || "Accompagnement personnalisé, livraison et montage soigné partout en Algérie pour une tranquillité d'esprit totale."}
                </p>
              </div>
            </LuxuryReveal>
          </div>
        </div>
      </section>

      {/* ── Section 4 - History ── */}
      <section className="w-full py-10 md:py-32 bg-[#0E0F10] px-4 md:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <LuxuryReveal variant="left">
            <div className="relative aspect-[4/3] w-full border border-white/10 overflow-hidden shadow-2xl rounded-2xl group">
              <img
                src={siteConfig.about_image || "/images/acbd.jpg"}
                alt="Showroom Château d'art - Façade"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </LuxuryReveal>
          
          <LuxuryReveal variant="right" delay={150}>
            <div className="space-y-4 md:space-y-6">
              <span className="text-xs uppercase tracking-[3px] text-[#b68d40] font-bold block font-sora">
                Trajectoire &amp; Vision
              </span>
              <h2 className="font-fraunces text-2xl md:text-5xl text-white font-light">
                Notre Histoire
              </h2>
              <p className="font-sora text-[#B7BBC0] text-xs md:text-base leading-relaxed">
                {siteConfig.about_histoire || "Née de l'amour des belles matières et du design sculptural, Château d'art s'est développée avec une conviction claire: offrir des meubles d'un raffinement international tout en restant proche des besoins de nos clients."}
              </p>
              {siteConfig.about_histoire_2 && (
                <p className="font-sora text-[#B7BBC0] text-xs md:text-base leading-relaxed">
                  {siteConfig.about_histoire_2}
                </p>
              )}
              {siteConfig.about_histoire_3 && (
                <p className="font-sora text-[#B7BBC0] text-xs md:text-base leading-relaxed">
                  {siteConfig.about_histoire_3}
                </p>
              )}
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* ── Section 5 - CTA ── */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-[#121316] to-[#0E0F10] border-t border-white/10 text-center px-4">
        <LuxuryReveal>
          <h2 className="font-fraunces text-2xl md:text-5xl text-white mb-6 font-light">
            Donnez Vie à Vos Plus Beaux Projets
          </h2>
          <p className="font-sora text-[#A1A1AA] text-xs md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Visitez notre showroom ou contactez nos designers d&apos;intérieur pour une consultation sur mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#b68d40] hover:bg-[#a37c35] text-white px-8 py-4 text-xs font-bold uppercase tracking-[2px] transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>Prendre Rendez-vous</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/all-products"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white text-white px-8 py-4 text-xs font-medium uppercase tracking-[2px] transition-all duration-300 hover:bg-white/5"
            >
              <span>Voir le Catalogue</span>
            </Link>
          </div>
        </LuxuryReveal>
      </section>

      <Footer />
    </main>
  );
}
