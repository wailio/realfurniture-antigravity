'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { LuxuryReveal } from '@/components/luxury-reveal';

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "Livrez-vous dans toute l'Algérie ou seulement à Alger ?",
    answer:
      "Oui, nous livrons dans les 69 wilayas. La livraison et le montage sont 100% gratuits sur Alger, Blida, Boumerdès, Tipaza et Médéa. Pour les autres wilayas, le délai est de 3 à 5 jours (5 à 8 jours pour le Grand Sud).",
  },
  {
    question: "Quel est le délai de livraison après confirmation de ma commande ?",
    answer:
      "De 48h à 7 jours ouvrés pour les modèles en stock prêts à livrer. Pour les fabrications personnalisées sur mesure en atelier (tissus ou dimensions), comptez 10 à 20 jours avec suivi continu.",
  },
  {
    question: "Comment se déroule le paiement (acompte, paiement à la livraison) ?",
    answer:
      "Le paiement s'effectue à la livraison après inspection complète de votre mobilier. Pour le sur-mesure, un acompte de 30% est versé à la commande, le solde à la réception (espèces, chèque ou CIB).",
  },
  {
    question: "Le montage est-il inclus dans le prix ?",
    answer:
      "Oui, le montage professionnel est entièrement inclus sans aucun surcoût. Nos équipes installent vos meubles dans la pièce de votre choix, effectuent les réglages et reprennent tous les emballages.",
  },
  {
    question: "Quelle garantie offrez-vous sur vos meubles ?",
    answer:
      "Tous nos meubles bénéficient d'une garantie constructeur de 2 à 5 ans couvrant la structure en bois massif, les mousses haute résilience et les mécanismes. Notre SAV est basé à Kouba (Alger).",
  },
  {
    question: "Proposez-vous des meubles sur mesure ou des choix de couleurs et tissus ?",
    answer:
      "Oui, nous proposons plus de 150 tissus et teintes exclusives au choix (velours, bouclette, cuir...) ainsi que des dimensions personnalisées. Rendez-vous au showroom ou contactez-nous sur WhatsApp.",
  },
];

// Delay (ms) before closing on mouse-leave — prevents flicker when moving fast between items
const CLOSE_DELAY = 120;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Ref to hold the pending close timer so we can cancel it if re-entering
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback((index: number) => {
    cancelClose();
    setOpenIndex(index);
  }, [cancelClose]);

  const handleLeave = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenIndex(null);
      closeTimer.current = null;
    }, CLOSE_DELAY);
  }, [cancelClose]);

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
  };

  return (
    <section
      id="faq"
      className="relative w-full py-20 md:py-28 lg:py-32 bg-[#FFFFFF] text-neutral-900 overflow-hidden border-t border-neutral-200/80 font-sans"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14 md:mb-18">
          <LuxuryReveal delay={0}>
            <div className="inline-flex items-center gap-2 border border-neutral-200 bg-neutral-100 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-neutral-800 tracking-wider uppercase mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span>F.A.Q · Questions fréquentes</span>
            </div>
          </LuxuryReveal>

          <LuxuryReveal delay={100}>
            <h2
              id="faq-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight"
            >
              Tout ce que vous devez savoir <br className="hidden sm:inline" />
              <span className="font-serif italic font-light text-neutral-600">avant de choisir.</span>
            </h2>
          </LuxuryReveal>

          <LuxuryReveal delay={150}>
            <p className="text-sm sm:text-base text-neutral-500 mt-3 max-w-xl mx-auto">
              Livraison dans les 69 wilayas, montage gratuit, garanties et options sur mesure.
            </p>
          </LuxuryReveal>
        </div>

        {/* FAQ Cards — hover to expand */}
        <div className="flex flex-col gap-3">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <LuxuryReveal key={index} delay={index * 40}>
                <div
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={handleLeave}
                  className={`
                    relative rounded-2xl border px-5 sm:px-6 py-4 sm:py-5
                    transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                    cursor-pointer select-none
                    ${isOpen
                      ? 'bg-[#F7F7F5] border-neutral-300/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]'
                    }
                  `}
                >
                  {/* Question row */}
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={`text-sm sm:text-[15px] font-medium tracking-tight transition-colors duration-200 leading-snug ${
                        isOpen ? 'text-neutral-900 font-semibold' : 'text-neutral-700'
                      }`}
                    >
                      {item.question}
                    </h3>

                    {/* + → × icon */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen
                          ? 'bg-neutral-900 border-neutral-900 text-white rotate-45'
                          : 'bg-white border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Answer — smooth slide open/close via grid trick */}
                  <div
                    className={`grid transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-neutral-500 pr-8 pb-1">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </LuxuryReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
