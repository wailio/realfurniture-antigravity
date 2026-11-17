'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = 'w-[72vw] md:w-[320px]' }: ProductCardProps) {
  const categoryLabel = product.category ? product.category.replace(/-/g, ' ') : 'Création';

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group flex-shrink-0 ${className} block select-none focus:outline-none`}
    >
      <div className="flex flex-col h-full bg-white transition-all duration-300">
        {/* ── Image Canvas (Apple clean soft-neutral frame) ── */}
        <div className="w-full aspect-[4/3] sm:aspect-[16/12] overflow-hidden bg-[#F5F5F7] rounded-2xl relative border border-neutral-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] group-hover:border-neutral-300/80 transition-all duration-300">
          
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5">
              {product.discount ? (
                <span className="bg-[#111827] text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-sm">
                  -{product.discount}%
                </span>
              ) : (
                <span className="bg-white/90 backdrop-blur-md text-neutral-800 border border-black/5 px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-tight shadow-xs uppercase">
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Favorite Icon */}
            <div
              className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md text-neutral-600 hover:text-red-500 flex items-center justify-center border border-black/5 shadow-xs transition-colors pointer-events-auto"
              aria-hidden="true"
            >
              <Heart size={13} />
            </div>
          </div>

          {/* Hover Explore Quick Pill (Desktop Only) */}
          <div className="hidden md:flex absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200">
            <span className="inline-flex items-center gap-1 bg-[#111827]/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md">
              <span>Voir la pièce</span>
              <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        {/* ── Product Typography & Details (Art Home Furniture inspired) ── */}
        <div className="pt-3 px-1 flex flex-col justify-between flex-1">
          <div>
            <span className="text-[10px] uppercase tracking-[1.5px] font-semibold text-neutral-400 block mb-1">
              {categoryLabel} · Bois Noble
            </span>
            <h3 className="text-neutral-900 text-xs sm:text-[13.5px] font-semibold tracking-tight line-clamp-1 group-hover:text-black transition-colors mb-1">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-neutral-950 font-bold text-xs sm:text-sm tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-neutral-400 font-normal text-[11px] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>En stock</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
