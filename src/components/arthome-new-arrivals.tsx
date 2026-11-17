'use client';

import React from 'react';
import Link from 'next/link';

export function ArtHomeNewArrivals() {
  return (
    <section className="relative w-full overflow-hidden mb-[45px] sm:mb-[60px] md:mb-[6vh] select-none">
      {/* ── Background with Black Marble Texture + Dark Overlay ── */}
      <div
        className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-8 py-20 md:py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/arthome-new-arrivals-bg.jpg')",
        }}
      >
        {/* Exact Elementor dark overlay: rgba(33, 37, 41, 0.80) */}
        <div className="absolute inset-0 bg-[#212529]/80 pointer-events-none" />

        {/* ── Inner Content Container (width: 83.729%, max 850px) ── */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[850px] mx-auto">
          
          {/* Main Title: Cormorant Italic Light 98px clamp */}
          <h2 className="font-serif italic font-light text-white tracking-normal leading-[1.1] text-[46px] sm:text-[68px] md:text-[84px] lg:text-[98px] mb-3 sm:mb-4 drop-shadow-sm">
            New Arrivals
          </h2>

          {/* Subtitle: Inter Tight 20px / 1.6em / #F6F6F3 max-w-[550px] */}
          <p className="font-sans text-[16px] sm:text-[18px] md:text-[20px] font-normal text-[#F6F6F3] leading-[1.6] max-w-[550px] mx-auto mb-7 sm:mb-8 font-light">
            Explore our latest curated designs, combining innovative craftsmanship with modern elegance.
          </p>

          {/* Button: Shop now with signature Vamtam rolling text hover animation */}
          <Link
            href="/all-products"
            className="group relative inline-flex items-center justify-center bg-[#EEEDE6] hover:bg-[#EEEDE6] text-black rounded-none px-8 sm:px-10 py-4 sm:py-[18px] text-[13.5px] sm:text-[14px] font-medium uppercase tracking-[0.06em] overflow-hidden transition-colors select-none shadow-sm"
          >
            {/* Rolling text wrapper */}
            <span className="relative block overflow-hidden h-[18px] leading-[18px]">
              {/* Default text that slides UP on hover */}
              <span className="block transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-[105%]">
                Shop now
              </span>
              {/* Replacement text that slides UP from underneath */}
              <span className="absolute top-0 left-0 w-full block transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] translate-y-[105%] group-hover:translate-y-0">
                Shop now
              </span>
            </span>
          </Link>

        </div>
      </div>
    </section>
  );
}
