"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { Sparkles, ArrowRight } from "lucide-react";

const inspirations = [
  {
    title: "Le Minimalisme Chaleureux",
    description: "Des lignes épurées et des matériaux nobles pour un intérieur apaisant qui respire l'élégance naturelle au quotidien.",
    image: "/products/chambre/chmbr.jpg",
    link: "/all-products?category=chambres",
    tag: "Chambres",
  },
  {
    title: "L'Art du Salon Moderne",
    description: "Canapés modulables et tables basses graphiques pour créer un espace de vie qui vous ressemble et invite à la détente.",
    image: "/products/salon/couch.jpg",
    link: "/all-products?category=sofas",
    tag: "Salons",
  },
  {
    title: "Recevoir avec Style",
    description: "Salles à manger conçues pour des moments de partage inoubliables autour de belles tables et de pièces signature.",
    image: "/products/salle/sallesmanger.jpg",
    link: "/all-products?category=salle-a-manger",
    tag: "Salle à Manger",
  },
];

export default function InspirationsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#FFFFFF] font-sans text-[#111827]">
      <Header theme="light" />

      {/* Hero — same style as Collection banner */}
      <section className="relative pt-6 pb-9 md:pt-10 md:pb-14 bg-[#FAFAF8] border-b border-neutral-200/70 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(180deg,#000 0,#000 1px,transparent 0,transparent 50%)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-600 shadow-xs mb-3 uppercase tracking-wider">
              <Sparkles size={12} />
              Inspirations &amp; Ambiances
            </span>
            <h1 className="text-[28px] sm:text-4xl md:text-[42px] font-extrabold text-[#111827] tracking-tight leading-[1.06] mb-2">
              Laissez-vous{' '}
              <span className="font-serif italic font-light text-neutral-500">inspirer.</span>
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-lg">
              Découvrez nos idées d&apos;aménagement pour créer des intérieurs qui reflètent votre personnalité et votre style de vie.
            </p>
          </div>
        </div>
      </section>

      {/* Inspiration Cards */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80">
        <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
          {inspirations.map((item, i) => (
            <LuxuryReveal key={i} delay={i * 80}>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${i % 2 === 1 ? "md:grid-flow-dense" : ""}`}>
                
                {/* Image */}
                <div className={`${i % 2 === 1 ? "md:col-start-2" : ""}`}>
                  <div className="relative rounded-3xl overflow-hidden border border-neutral-200/80 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] bg-neutral-100 aspect-[4/3] group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[11px] font-semibold text-neutral-800 shadow-sm">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`py-4 ${i % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""}`}>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-3">
                    Inspiration N°{i + 1}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight mb-4">
                    {item.title}
                  </h2>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed mb-8">
                    {item.description}
                  </p>
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <span>Explorer cette collection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </LuxuryReveal>
          ))}
        </div>
      </section>

      <div className="h-16 md:h-24" />
      <Footer />
    </main>
  );
}
