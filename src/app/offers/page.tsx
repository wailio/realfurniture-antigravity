"use client";

import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { Gift, Percent, Truck } from "lucide-react";

export default function OffersPage() {
  // Products with discounts
  const discountedProducts = products.filter((p) => p.discount && p.discount > 0);

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 md:pt-44 md:pb-16 px-4 md:px-12 bg-gradient-to-b from-[#18191B] to-[#0E0F10]">
        <div className="max-w-6xl mx-auto text-center">
          <LuxuryReveal>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-[#C7CBD1]" />
              <span className="text-xs uppercase tracking-[4px] text-[#C7CBD1]">
                Offres Spéciales
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-4xl font-light text-[#F2F1EF] mb-4">
              Offres & Promotions
            </h1>
            <p className="text-sm md:text-base text-[#B7BBC0] max-w-xl mx-auto">
              Profitez de nos réductions exclusives sur une sélection de meubles de qualité.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="py-12 md:py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <LuxuryReveal>
            <div className="border border-[rgba(199,203,209,0.18)] bg-[#18191B] p-8 md:p-12 flex items-center gap-6">
              <Percent className="h-10 w-10 text-[#C7CBD1] flex-shrink-0" />
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-light text-[#F2F1EF] mb-1">
                  Jusqu&apos;à -16% de réduction
                </h3>
                <p className="text-sm text-[#B7BBC0]">
                  Sur une large sélection de canapés et chambres à coucher.
                </p>
              </div>
            </div>
          </LuxuryReveal>
          <LuxuryReveal delay={100}>
            <div className="border border-[rgba(199,203,209,0.18)] bg-[#18191B] p-8 md:p-12 flex items-center gap-6">
              <Truck className="h-10 w-10 text-[#C7CBD1] flex-shrink-0" />
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-light text-[#F2F1EF] mb-1">
                  Livraison gratuite
                </h3>
                <p className="text-sm text-[#B7BBC0]">
                  Alger, Blida, Boumerdès, Médéa et Tipaza.
                </p>
              </div>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Discounted Products Grid */}
      <section className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <LuxuryReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-light text-[#F2F1EF] mb-10 text-center">
              Produits en Promotion
            </h2>
          </LuxuryReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {discountedProducts.map((product, i) => (
              <LuxuryReveal key={product.id} delay={i * 80}>
                <ProductCard product={product} className="w-full" />
              </LuxuryReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
