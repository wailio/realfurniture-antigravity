import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0E0F10] flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="error-label font-fraunces text-[#C7CBD1]/70 tracking-[4px] text-xl mb-8 opacity-0">
          404
        </div>
        
        <div className="chair-reveal mb-12 opacity-0 transform translate-y-8">
          <span className="font-fraunces text-9xl text-[#18191B] font-bold" style={{ WebkitTextStroke: '1px #C7CBD1' }}>
            ?
          </span>
        </div>
        
        <h1 className="heading-reveal font-fraunces text-4xl md:text-5xl lg:text-6xl text-[#F2F1EF] mb-6 opacity-0">
          Cette pièce n'existe pas
        </h1>
        
        <div className="flex justify-center w-full mb-6">
          <svg width="150" height="2" viewBox="0 0 150 2" fill="none" xmlns="http://www.w3.org/2000/svg" className="underline-reveal">
            <path d="M0 1H150" stroke="#C7CBD1" strokeWidth="2" strokeDasharray="150" strokeDashoffset="150" />
          </svg>
        </div>
        
        <p className="subheading-reveal font-fraunces text-[#F2F1EF] text-lg md:text-xl mb-10 opacity-0">
          Page introuvable
        </p>
        
        <div className="button-reveal opacity-0">
          <Link href="/" className="px-8 py-4 bg-transparent border border-[#C7CBD1] text-[#C7CBD1] font-sora font-medium uppercase tracking-wider hover:bg-[rgba(199,203,209,0.1)] transition-colors duration-300">
            Retour à l'accueil
          </Link>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
