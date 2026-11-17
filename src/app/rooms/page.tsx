"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { ArrowRight } from "lucide-react";

const ROOM_CATEGORIES = [
  { slug: "salle-a-manger", label: "Salle à Manger", description: "Des ensembles raffinés pour des repas inoubliables avec ceux que vous aimez." },
  { slug: "chambres", label: "Chambres à Coucher", description: "Des chambres élégantes pensées pour votre sérénité et votre confort." },
  { slug: "sofas", label: "Salons & Canapés", description: "Des canapés et salons modulables pour des espaces de vie chaleureux." },
];

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] font-sans text-[#111827]">
      <Header theme="light" />

      {/* Hero */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F9FA] via-white to-white text-center">
        <div className="max-w-3xl mx-auto">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 shadow-sm mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span>Collections par Pièce</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
              Chaque espace,{" "}
              <span className="font-serif italic font-light text-neutral-600">sa collection.</span>
            </h1>
            <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Explorez nos meubles organisés par pièce de vie pour trouver l&apos;harmonie parfaite dans votre intérieur.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      {/* Room Sections */}
      {ROOM_CATEGORIES.map((room, i) => {
        const roomProducts = products.filter((p) => p.category === room.slug).slice(0, 4);
        if (roomProducts.length === 0) return null;

        return (
          <section key={room.slug} className={`py-14 md:py-20 px-4 sm:px-6 lg:px-8 ${i % 2 === 1 ? 'bg-[#F8F9FA]' : 'bg-white'} border-t border-neutral-200/80`}>
            <div className="max-w-7xl mx-auto">
              <LuxuryReveal delay={i * 80}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1.5">
                      Univers
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                      {room.label}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1 max-w-md">{room.description}</p>
                  </div>
                  <Link
                    href={`/all-products?category=${room.slug}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-sm shrink-0"
                  >
                    <span>Voir toute la collection</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </LuxuryReveal>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {roomProducts.map((product, j) => (
                  <LuxuryReveal key={product.id} delay={j * 60}>
                    <ProductCard product={product} className="w-full" />
                  </LuxuryReveal>
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link
                  href={`/all-products?category=${room.slug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Voir toute la collection</span>
                  <ArrowRight size={13} />
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
