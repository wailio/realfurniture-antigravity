'use client';

import React from 'react';

export function WhatsAppButton() {
  const phoneNumber = '213561719100';
  const defaultMessage = "Bonjour Château d'art, je souhaite me renseigner sur vos collections.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Assistance WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center group pointer-events-auto"
    >
      {/* Luxury Tooltip Label (Reveals on Hover) */}
      <div
        className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-sm bg-[#121316]/95 border border-white/15 text-white shadow-2xl backdrop-blur-md opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span className="font-sora text-xs tracking-wide text-[#F2F1EF]">
          Discutez avec nous
        </span>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Château d'art sur WhatsApp"
        className="relative flex items-center justify-center w-13 h-13 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-[0_14px_35px_rgba(37,211,102,0.7)] group-active:scale-95 cursor-pointer"
      >
        {/* Soft Ambient Light Halo (Breathing effect matching screenshot) */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366]/40 blur-md -z-10 group-hover:bg-[#25D366]/60 group-hover:blur-lg transition-all duration-500 animate-whatsapp-halo"
          aria-hidden="true"
        />

        {/* Outer Ripple Wave on hover */}
        <span
          className="absolute -inset-1 rounded-full border border-[#25D366]/50 opacity-0 group-hover:opacity-100 animate-ping -z-10 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* User's Uploaded WhatsApp PNG Icon */}
        <img
          src="/whatsapp.png"
          alt="WhatsApp"
          className="w-12 h-12 md:w-13 md:h-13 object-contain select-none pointer-events-none transition-transform duration-300 group-hover:rotate-6 brightness-0 invert drop-shadow-xs"
          draggable={false}
        />
      </a>
    </aside>
  );
}
