'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = 'w-40 md:w-[350px]' }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className={`group flex-shrink-0 ${className} block`}>
      <div className="bg-[#18191B] border border-[rgba(199,203,209,0.18)] transition-all duration-300 group-hover:border-[rgba(199,203,209,0.4)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] h-full flex flex-col relative overflow-hidden">

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 z-10 bg-[#18191B] border border-[rgba(199,203,209,0.18)] text-[#C7CBD1] px-1.5 py-0.5 text-[9px] font-semibold font-sora">
            -{product.discount}%
          </div>
        )}

        {/* Favorite Icon — div not button (can't nest button inside <a>) */}
        <div className="absolute top-2 right-2 z-10 bg-[#18191B]/80 rounded-full p-1.5 text-[#B7BBC0] border border-[rgba(199,203,209,0.18)]" aria-hidden="true">
          <Heart size={13} />
        </div>

        {/* Image Area — tall on mobile */}
        <div className="w-full aspect-[3/4] md:aspect-[4/3] overflow-hidden bg-[#0E0F10]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover product-image transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          />
        </div>

        {/* Info bar — compact, no Commander button */}
        <div className="px-2.5 py-2 flex flex-col font-sora bg-[#141518]">
          <h3 className="text-[#F2F1EF] text-[10px] sm:text-xs font-semibold line-clamp-1 group-hover:text-[#b68d40] transition-colors mb-1">
            {product.name}
          </h3>
          <span className="text-[#b68d40] font-bold text-[10px] sm:text-xs">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
