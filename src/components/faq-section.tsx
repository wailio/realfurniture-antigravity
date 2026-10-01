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
      "Oui, nous livrons dans les 58 wilayas. La livraison et le montage sont 100% gratuits sur Alger, Blida, Boumerdès, Tipaza et Médéa. Pour les autres wilayas, le délai est de 3 à 5 jours (5 à 8 jours pour le Grand Sud).",
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
      "Tous nos meubles bénéficient d'une garantie constructeur de 2 à 5 ans couvrant la structure en bois massif, les mousses haute résilience et les mécanismes. Notre SAV est basé à Birkhadem.",
  },
  {
    question: "Proposez-vous des meubles sur mesure ou des choix de couleurs et tissus ?",
    answer:
      "Oui, nous proposons plus de 150 tissus et teintes exclusives au choix (velours, bouclette, cuir...) ainsi que des dimensions personnalisées. Rendez-vous au showroom ou contactez-nous sur WhatsApp.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Toggle open state on click
  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  // Active tracker: close and reset immediately when mouse leaves that space of the question shape
  useEffect(() => {
    if (openIndex === null) return

    const currentEl = itemRefs.current[openIndex]

    // Check if cursor is outside the question's bounding box
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!currentEl) return
      const rect = currentEl.getBoundingClientRect()
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (!isInside) {
        setOpenIndex(null)
      }
    }

    // Cursor exits window / moves to taskbar / off-screen
    const handleDocMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && !(e as any).toElement) {
        setOpenIndex(null)
      }
    }

    const handleDocMouseLeave = () => {
      setOpenIndex(null)
    }

    const handleWindowBlur = () => {
      setOpenIndex(null)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
    document.addEventListener('mouseout', handleDocMouseOut)
    document.addEventListener('mouseleave', handleDocMouseLeave)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseout', handleDocMouseOut)
      document.removeEventListener('mouseleave', handleDocMouseLeave)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [openIndex])

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
      className="relative w-full py-20 md:py-24 bg-[#0E0F10] text-[#B7BBC0] overflow-hidden border-t border-white/[0.06]"
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
        <div className="text-left mb-10 md:mb-14">
          <LuxuryReveal delay={0} variant="up">
            <div className="inline-flex items-center gap-2 border border-[#d1aa5c]/25 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-none text-[10px] md:text-xs font-sora text-[#f3e3be] tracking-[2.5px] uppercase shadow-sm mb-3">
              <span className="w-1.5 h-1.5 rounded-none bg-[#d1aa5c]" />
              <span>F.A.Q · FOIRE AUX QUESTIONS</span>
            </div>
          </LuxuryReveal>

          {/* Title matching reference image font & lighter golden 'avant d'acheter.' */}
          <LuxuryReveal delay={100} variant="up">
            <h2
              id="faq-heading"
              className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[44px] text-white font-light tracking-tight leading-[1.18]"
            >
              <span>Questions que les gens se posent </span>
              <span className="text-[#f5e2b8] font-normal">avant d&apos;acheter.</span>
            </h2>
          </LuxuryReveal>

          {/* Subtitle: smaller, longer, normal font, delicate light platinum/champagne */}
          <LuxuryReveal delay={180} variant="up">
            <p className="text-[12.5px] sm:text-[13px] text-[#e8dfcf]/75 font-normal tracking-normal mt-2.5 leading-relaxed max-w-3xl font-sans">
              Tout ce que vous devez savoir sur la livraison, nos garanties et le showroom de Birkhadem.
            </p>
          </LuxuryReveal>
        </div>

        {/* ── Questions Line-Separated Stack (Sharp-edged, reduced spacing, normal luxurious question font) ── */}
        <div className="border-t border-white/10 divide-y divide-white/10">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <LuxuryReveal key={index} delay={index * 50 + 100} variant="up">
                <div
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  onMouseLeave={() => {
                    if (openIndex === index) {
                      setOpenIndex(null)
                    }
                  }}
                  className={`group transition-all duration-200 ease-out rounded-none py-3.5 px-3 sm:py-4 sm:px-4 my-0.5 cursor-pointer ${
                    isOpen
                      ? 'border border-[#d1aa5c]/35 shadow-[0_4px_24px_rgba(209,170,92,0.08)]'
                      : 'border border-transparent hover:border-white/10'
                  }`}
                  style={{
                    cursor: 'pointer',
                    background: isOpen
                      ? 'linear-gradient(135deg, rgba(209, 170, 92, 0.09) 0%, rgba(209, 170, 92, 0.03) 100%)'
                      : 'transparent',
                  }}
                  onClick={() => handleToggle(index)}
                >
                  {/* Header Row: Question + Sharp Minimal Toggle Icon */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Simpler, luxurious, normal-looking font for question text */}
                    <h3
                      className={`text-[15px] sm:text-[16.5px] font-sans font-normal tracking-[-0.01em] leading-snug transition-colors duration-200 select-none ${
                        isOpen
                          ? 'text-[#f5e2b8] font-medium'
                          : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {item.question}
                    </h3>

                    {/* Sharp-edged Minimal Action Toggle */}
                    <div
                      className={`shrink-0 w-7 h-7 rounded-none flex items-center justify-center transition-all duration-200 border ${
                        isOpen
                          ? 'bg-[#d1aa5c] border-[#d1aa5c] text-[#0E0F10] rotate-45 shadow-[0_0_12px_rgba(209,170,92,0.35)]'
                          : 'bg-white/[0.03] border-white/15 text-white/50 group-hover:text-white group-hover:border-white/30 group-hover:bg-white/[0.06]'
                      }`}
                      aria-label={isOpen ? 'Fermer la réponse' : 'Ouvrir la réponse'}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Smooth Animated Collapsible Answer Environment */}
                  <div
                    className={`grid transition-all duration-250 ease-out overflow-hidden ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100 mt-2.5 sm:mt-3 pt-2.5 border-t border-[#d1aa5c]/20'
                        : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      {/* Response text keeps clean readable styling */}
                      <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#D4D4D8]/90 font-sora font-light pr-6">
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
