'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = 'w-40 md:w-[350px]' }: ProductCardProps) {
  const router = useRouter();

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(
      `/contact?product=${encodeURIComponent(product.name)}&subject=${encodeURIComponent(
        `Commande: ${product.name}`
      )}&message=${encodeURIComponent(
        `Je souhaite commander ce produit: ${product.name}`
      )}#contact-form`
    );
  };
  return (
    <Link href={`/product/${product.id}`} className={`group flex-shrink-0 ${className} block`}>
      <div className="bg-[#18191B] border border-[rgba(199,203,209,0.18)] transition-all duration-300 group-hover:border-[rgba(199,203,209,0.4)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] h-full flex flex-col relative overflow-hidden">
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 z-10 bg-[#18191B] border border-[rgba(199,203,209,0.18)] text-[#C7CBD1] px-2 py-1 text-xs font-semibold font-sora">
            -{product.discount}%
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 z-10 bg-[#18191B]/80 rounded-full p-2 text-[#B7BBC0] hover:text-[#F2F1EF] hover:bg-[#18191B] transition-colors border border-[rgba(199,203,209,0.18)]" aria-label="Add to favorites">
          <Heart size={16} />
        </button>

        {/* Image Area */}
        <div className="w-full aspect-square md:aspect-[4/3] overflow-hidden bg-[#0E0F10]">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover product-image transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" 
          />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-grow font-sora bg-[#141518]">
          <span className="text-[#A1A1AA] text-[10px] sm:text-[11px] uppercase tracking-wider mb-0.5">
            {product.brand || "Château d'art"}
          </span>
          <h3 className="text-[#F2F1EF] text-xs sm:text-sm font-semibold mb-2.5 line-clamp-1 group-hover:text-[#b68d40] transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto pt-1 flex items-center justify-between gap-1.5 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[#F2F1EF] font-bold text-xs sm:text-sm">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[#71717A] text-[10px] sm:text-[11px] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleBuyClick}
              className="px-2.5 sm:px-3 py-1 bg-[#b68d40] hover:bg-[#a37c35] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-none transition-colors shadow-xs flex-shrink-0"
              aria-label={`Commander ${product.name}`}
            >
              Commander
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
