"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

const ROOM_CATEGORIES = [
  { slug: "salle-a-manger", label: "Salle à manger", description: "Des ensembles de salle à manger raffinés pour des repas inoubliables." },
  { slug: "chambres", label: "Chambres à coucher", description: "Des chambres élégantes pensées pour votre confort." },
  { slug: "sofas", label: "Salons & Canapés", description: "Des canapés et salons modulables pour vos espaces de vie." },
];

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 md:pt-44 md:pb-16 px-4 md:px-12 bg-gradient-to-b from-[#18191B] to-[#0E0F10]">
        <div className="max-w-6xl mx-auto text-center">
          <LuxuryReveal>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-4xl font-light text-[#F2F1EF] mb-4">
              Collections par Pièce
            </h1>
            <p className="text-sm md:text-base text-[#B7BBC0] max-w-xl mx-auto">
              Explorez nos meubles organisés par espace de vie pour trouver l&apos;harmonie parfaite.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      {/* Room Sections */}
      {ROOM_CATEGORIES.map((room, i) => {
        const roomProducts = products.filter((p) => p.category === room.slug).slice(0, 4);
        if (roomProducts.length === 0) return null;

        return (
          <section key={room.slug} className="py-16 md:py-24 px-4 md:px-12">
            <div className="max-w-7xl mx-auto">
              <LuxuryReveal delay={i * 100}>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-3xl font-light text-[#F2F1EF] mb-2">
                      {room.label}
                    </h2>
                    <p className="text-sm text-[#B7BBC0]">{room.description}</p>
                  </div>
                  <Link
                    href={`/all-products?category=${room.slug}`}
                    className="hidden md:inline-flex items-center gap-1 text-sm text-[#C7CBD1] border-b border-[rgba(199,203,209,0.3)] pb-0.5 hover:border-[#C7CBD1] transition-colors"
                  >
                    Voir tout
                  </Link>
                </div>
              </LuxuryReveal>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {roomProducts.map((product, j) => (
                  <LuxuryReveal key={product.id} delay={j * 80}>
                    <ProductCard product={product} className="w-full" />
                  </LuxuryReveal>
                ))}
              </div>

              <div className="mt-6 text-center md:hidden">
                <Link
                  href={`/all-products?category=${room.slug}`}
                  className="text-sm text-[#C7CBD1] border-b border-[rgba(199,203,209,0.3)] pb-0.5"
                >
                  Voir toute la collection
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      <Footer />
    </main>
  );
}
