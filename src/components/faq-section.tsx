'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { LuxuryReveal } from '@/components/luxury-reveal'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "Livrez-vous dans toute l'Algérie ou seulement à Alger ?",
    answer:
      "Oui, nous assurons la livraison sécurisée et le montage dans l'ensemble des 58 wilayas d'Algérie. La livraison et l'installation sont d'ailleurs 100% gratuites sur Alger, Blida, Boumerdès, Tipaza et Médéa. Pour les autres wilayas du Nord et de l'Est/Ouest (Oran, Constantine, Sétif, Annaba, Tlemcen...), la livraison s'effectue en 3 à 5 jours. Pour les wilayas du Sud, nous travaillons avec des transporteurs partenaires spécialisés garantissant un suivi rigoureux sous 5 à 8 jours.",
  },
  {
    question: "Quel est le délai de livraison après confirmation de ma commande ?",
    answer:
      "Pour l'ensemble de nos modèles disponibles en stock ('Prêts à livrer'), la livraison et le montage sont effectués sous 48h à 7 jours ouvrés à Alger et ses environs. Pour les pièces personnalisées confectionnées dans nos ateliers (choix d'étoffes spécifiques, coloris ou dimensions sur mesure), le délai d'ébénisterie et de tapisserie artisanale est généralement de 10 à 20 jours ouvrés, avec un suivi photo régulier partagé directement par nos conseillers sur WhatsApp.",
  },
  {
    question: "Comment se déroule le paiement (acompte, paiement à la livraison) ?",
    answer:
      "La transparence et la confiance sont essentielles : pour les articles en stock, vous ne réglez l'intégralité de votre commande qu'à la livraison chez vous, après déballage, vérification minutieuse et validation de votre meuble avec nos livreurs. Pour les commandes spéciales personnalisées, un acompte de confirmation de 30% est versé à la commande, le solde étant réglé à la réception. Nous acceptons les règlements en espèces, chèques certifiés et cartes bancaires CIB / Edahabia à notre showroom de Birkhadem.",
  },
  {
    question: "Le montage est-il inclus dans le prix ?",
    answer:
      "Absolument, le montage et l'installation sont 100% inclus dans nos prestations, sans aucun frais caché ni supplément. Nos livreurs-monteurs qualifiés installent votre mobilier à l'emplacement exact de votre choix, effectuent tous les réglages nécessaires (alignement des portes, mécanismes extensibles, fixations) et reprennent l'intégralité des cartons et protections pour laisser votre pièce immaculée et prête à vivre.",
  },
  {
    question: "Quelle garantie offrez-vous sur vos meubles ?",
    answer:
      "Toutes nos créations bénéficient d'une garantie contractuelle de 2 à 5 ans selon les gammes. Cette garantie protège la structure en bois massif sélectionné (hêtre, chêne, noyer), la robustesse des assemblages d'ébénisterie, la haute résilience de nos mousses d'assise ainsi que les mécanismes de nos canapés et tables. Notre service après-vente est basé directement à Birkhadem et intervient avec diligence en cas de besoin.",
  },
  {
    question: "Proposez-vous des meubles sur mesure ou des choix de couleurs et tissus ?",
    answer:
      "Oui, la personnalisation haut de gamme est la signature de Château d'art. Pour la plupart de nos salons, salles à manger et chambres, vous pouvez choisir parmi plus de 150 références de tissus exclusifs (velours antitache, bouclettes texturées, cuirs italiens pleine fleur, lins nobles) et adapter les teintes de bois ou dimensions. Vous pouvez initier votre projet directement via notre formulaire en ligne, sur WhatsApp au 0561 71 91 00, ou en touchant nos liasses d'étoffes à notre showroom de Birkhadem.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Toggle open state on click
  const handleToggle = (index: number) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  // When mouse leaves the question, auto-close after a smooth debounce
  const handleMouseLeave = (index: number) => {
    if (openIndex === index) {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = setTimeout(() => {
        setOpenIndex(null)
      }, 450) // fast yet smooth close detection
    }
  }

  // When mouse re-enters, cancel any pending auto-close
  const handleMouseEnter = (index: number) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  // JSON-LD structured data for Google FAQ schema rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section
      id="faq"
      className="relative w-full py-20 md:py-28 bg-[#0E0F10] text-[#B7BBC0] overflow-hidden border-t border-white/[0.06]"
      aria-labelledby="faq-heading"
    >
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Subtle ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none opacity-15 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #d1aa5c 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header (Matching Reference Image Style) ── */}
        <div className="text-center md:text-left mb-12 md:mb-16">
          <LuxuryReveal delay={0} variant="up">
            <div className="inline-flex items-center gap-2 border border-[#d1aa5c]/25 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-none text-[10px] md:text-xs font-sora text-[#e8ca82] tracking-[2.5px] uppercase shadow-sm mb-4">
              <span className="w-1.5 h-1.5 rounded-none bg-[#d1aa5c]" />
              <span>F.A.Q · FOIRE AUX QUESTIONS</span>
            </div>
          </LuxuryReveal>

          <LuxuryReveal delay={100} variant="up">
            <h2
              id="faq-heading"
              className="font-sora text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-white font-light tracking-tight leading-[1.18]"
            >
              <span>Questions que les gens se posent </span>
              <span className="text-[#e8ca82] font-semibold">avant d&apos;acheter.</span>
            </h2>
          </LuxuryReveal>

          <LuxuryReveal delay={180} variant="up">
            <p className="text-xs sm:text-[13px] md:text-sm text-[#d1aa5c] font-medium tracking-wide uppercase mt-3 font-sora">
              Tout ce que vous devez savoir sur la livraison, nos garanties et le showroom de Birkhadem
            </p>
          </LuxuryReveal>
        </div>

        {/* ── Questions Line-Separated Stack ── */}
        <div className="border-t border-white/10 divide-y divide-white/10">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <LuxuryReveal key={index} delay={index * 60 + 120} variant="up">
                <div
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                  className={`group transition-all duration-300 ease-out rounded-2xl p-4 sm:p-6 my-1.5 cursor-pointer ${
                    isOpen
                      ? 'border border-[#d1aa5c]/35 shadow-[0_8px_30px_rgba(209,170,92,0.12)]'
                      : 'border border-transparent hover:border-white/10'
                  }`}
                  style={{
                    cursor: 'pointer',
                    background: isOpen
                      ? 'linear-gradient(135deg, rgba(209, 170, 92, 0.12) 0%, rgba(209, 170, 92, 0.05) 100%)'
                      : 'transparent',
                  }}
                  onClick={() => handleToggle(index)}
                >
                  {/* Header Row: Question + Plus/Close Icon */}
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={`text-base sm:text-lg md:text-[19px] font-sora font-medium leading-snug transition-colors duration-200 select-none ${
                        isOpen
                          ? 'text-[#f5d78e]'
                          : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {item.question}
                    </h3>

                    {/* Smooth Rotating Toggle Button */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                        isOpen
                          ? 'bg-[#d1aa5c] border-[#d1aa5c] text-[#0E0F10] rotate-45 shadow-[0_0_15px_rgba(209,170,92,0.4)]'
                          : 'bg-white/[0.04] border-white/15 text-white/60 group-hover:text-white group-hover:border-white/30 group-hover:bg-white/[0.08]'
                      }`}
                      aria-label={isOpen ? 'Fermer la réponse' : 'Ouvrir la réponse'}
                    >
                      <Plus className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Smooth Animated Collapsible Answer Environment */}
                  <div
                    className={`grid transition-all duration-300 ease-out overflow-hidden ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100 mt-3 sm:mt-4 pt-3 border-t border-[#d1aa5c]/20'
                        : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm md:text-[14.5px] leading-relaxed text-white/80 font-sora font-light">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </LuxuryReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
