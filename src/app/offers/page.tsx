"use client";

import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LuxuryReveal } from "@/components/luxury-reveal";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";
import { Gift, Percent, Truck, Tag } from "lucide-react";

export default function OffersPage() {
  const discountedProducts = products.filter((p) => p.discount && p.discount > 0);

  return (
    <main className="min-h-screen bg-[#FFFFFF] font-sans text-[#111827]">
      <Header theme="light" />

      {/* Hero */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F9FA] via-white to-white text-center">
        <div className="max-w-3xl mx-auto">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 shadow-sm mb-4">
              <Tag size={12} className="text-neutral-600" />
              <span>Offres Spéciales</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
              Profitez de nos{" "}
              <span className="font-serif italic font-light text-neutral-600">meilleures offres.</span>
            </h1>
            <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Réductions exclusives sur une sélection de meubles haut de gamme — livrés et installés partout en Algérie.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <LuxuryReveal>
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Percent size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Jusqu&apos;à -16%</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">Sur une large sélection de canapés et chambres à coucher.</p>
              </div>
            </div>
          </LuxuryReveal>

          <LuxuryReveal delay={80}>
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Livraison gratuite</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">Alger, Blida, Boumerdès, Médéa et Tipaza inclus.</p>
              </div>
            </div>
          </LuxuryReveal>

          <LuxuryReveal delay={160}>
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <Gift size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Paiement flexible</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">Règlement à la livraison après inspection complète.</p>
              </div>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Discounted Products Grid */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto">
          <LuxuryReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                Modèles en <span className="font-serif italic font-light text-neutral-600">Promotion</span>
              </h2>
              <p className="text-neutral-500 text-sm mt-2">
                {discountedProducts.length} pièce{discountedProducts.length !== 1 ? 's' : ''} disponible{discountedProducts.length !== 1 ? 's' : ''} avec réduction
              </p>
            </div>
          </LuxuryReveal>

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {discountedProducts.map((product, i) => (
                <LuxuryReveal key={product.id} delay={i * 50}>
                  <ProductCard product={product} className="w-full" />
                </LuxuryReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500 text-base">Aucune promotion active pour le moment.</p>
              <p className="text-neutral-400 text-sm mt-1">Revenez bientôt pour découvrir nos offres.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
