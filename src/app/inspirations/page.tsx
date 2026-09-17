"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { Sparkles } from "lucide-react";

const inspirations = [
  {
    title: "Le Minimalisme Chaleureux",
    description: "Des lignes épurées et des matériaux nobles pour un intérieur apaisant qui respire l'élégance.",
    image: "/products/chambre/-1.jpg",
    link: "/all-products?category=chambres",
  },
  {
    title: "L'Art du Salon Moderne",
    description: "Canapés modulables et tables basses graphiques pour créer un espace de vie qui vous ressemble.",
    image: "/products/salon/aa.jpg",
    link: "/all-products?category=sofas",
  },
  {
    title: "Recevoir avec Style",
    description: "Salles à manger conçues pour des moments de partage inoubliables autour de belles tables.",
    image: "/products/salle/11.jpg",
    link: "/all-products?category=salle-a-manger",
  },
];

export default function InspirationsPage() {
  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 md:pt-44 md:pb-16 px-4 md:px-12 bg-gradient-to-b from-[#18191B] to-[#0E0F10]">
        <div className="max-w-6xl mx-auto text-center">
          <LuxuryReveal>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#C7CBD1]" />
              <span className="text-xs uppercase tracking-[4px] text-[#C7CBD1]">
                Inspirations
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-4xl font-light text-[#F2F1EF] mb-4">
              Laissez-vous Inspirer
            </h1>
            <p className="text-sm md:text-base text-[#B7BBC0] max-w-xl mx-auto">
              Découvrez nos idées d&apos;aménagement pour créer des intérieurs qui reflètent votre personnalité.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      {/* Inspiration Cards */}
      <section className="py-16 md:py-24 px-4 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-20">
          {inspirations.map((item, i) => (
            <LuxuryReveal key={i} delay={i * 120}>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
                <div className="border border-[rgba(199,203,209,0.18)] overflow-hidden bg-[#18191B]" style={{ direction: "ltr" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-[4/3] object-cover product-image hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="py-4" style={{ direction: "ltr" }}>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-light text-[#F2F1EF] mb-4">
                    {item.title}
                  </h2>
                  <p className="text-sm md:text-base text-[#B7BBC0] leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 border border-[rgba(199,203,209,0.3)] px-6 py-2.5 text-xs uppercase tracking-[2px] text-[#C7CBD1] hover:bg-[#C7CBD1] hover:text-[#0E0F10] transition-all duration-300"
                  >
                    Explorer
                  </Link>
                </div>
              </div>
            </LuxuryReveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
