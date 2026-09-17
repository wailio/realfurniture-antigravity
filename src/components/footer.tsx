'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Check, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { TikTokIcon } from '@/components/icons';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0B0C] text-[#B7BBC0] font-sora py-16 md:py-24 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-[1440px]">
        {/* Top brand motto row */}
        <div className="pb-12 mb-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link href="/" className="inline-block mb-3 group">
              <img
                src="/logo.png"
                alt="Château d'art"
                className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </Link>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-lg leading-relaxed">
              Maison de mobilier et d&apos;art de vivre. L&apos;alliance de l&apos;artisanat d&apos;exception et des lignes contemporaines.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs tracking-wider text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-[#b68d40] animate-pulse" />
              Livraison dans les 58 wilayas
            </span>
          </div>
        </div>

        {/* 4-column Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_0.9fr_1fr] gap-8">
          
          {/* Column 1: L'Atelier & Showroom */}
          <div className="bg-[#121316] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-fraunces text-xl font-light mb-4">
                L&apos;Atelier &amp; Showroom
              </h3>
              <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                Chaque création Château d&apos;art est conçue pour traverser le temps. Visitez notre showroom ou contactez nos conseillers pour un accompagnement personnalisé.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#D1D5DB] border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#b68d40]" />
                <a href="tel:0561719100" className="hover:text-white transition-colors font-semibold">0561 71 91 00</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#b68d40]" />
                <a href="mailto:chateau.art01@gmail.com" className="hover:text-white transition-colors">chateau.art01@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#b68d40]" />
                <span>Alger – Ouvert 6/7j de 9h30 à 20h00</span>
              </div>
            </div>
          </div>

          {/* Column 2: Newsletter Privilège */}
          <div className="bg-[#121316] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[3px] text-[#b68d40] font-bold block mb-2">
                Club Privilège
              </span>
              <h3 className="text-white font-fraunces text-xl font-light mb-3">
                Nouveautés &amp; Arrivages
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6">
                Accédez en avant-première à nos nouvelles créations, séries limitées et offres de saison.
              </p>
            </div>

            {subscribed ? (
              <div className="p-4 rounded-md bg-[#b68d40]/15 border border-[#b68d40]/30 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-[#b68d40]" />
                <span>Merci. Vous recevrez nos invitations exclusives.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Votre adresse email" 
                    className="w-full bg-[#0A0B0C] border border-white/15 px-4 py-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#b68d40] transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#b68d40] hover:bg-[#a37c35] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>S&apos;inscrire</span>
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>

          {/* Column 3: Explorer */}
          <div className="bg-[#121316] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-fraunces text-xl font-light mb-6 flex items-center gap-2">
                <span>Explorer</span>
                <span className="w-6 h-[1px] bg-[#b68d40]" />
              </h3>
              <ul className="space-y-3 text-xs md:text-sm">
                <li>
                  <Link href="/all-products" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Tous nos meubles
                  </Link>
                </li>
                <li>
                  <Link href="/rooms" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Collections par pièce
                  </Link>
                </li>
                <li>
                  <Link href="/offers" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Offres privilèges
                  </Link>
                </li>
                <li>
                  <Link href="/inspirations" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Inspirations &amp; Lookbook
                  </Link>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="relative rounded-sm overflow-hidden border border-white/10 h-28 w-full group">
                <iframe
                  title="Château d'art sur Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5906046037494!2d3.060058575713971!3d36.70837457287061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fad5fae229a89%3A0xa8afd38ca1b6e44f!2sCh%C3%A2teau%20D'Art%20-%20meubles!5e0!3m2!1sfr!2sdz!4v1789588881010!5m2!1sfr!2sdz"
                  className="w-full h-full grayscale contrast-[1.1] brightness-[0.8] hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <span className="text-[11px] text-[#A1A1AA] block">
                Showroom Alger – 6/7j de 9h30 à 20h00
              </span>
            </div>
          </div>

          {/* Column 4: Maison & Contact */}
          <div className="bg-[#121316] p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-fraunces text-xl font-light mb-6 flex items-center gap-2">
                <span>Maison</span>
                <span className="w-6 h-[1px] bg-[#b68d40]" />
              </h3>
              <ul className="space-y-3 text-xs md:text-sm mb-6">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Notre histoire &amp; savoir-faire
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Prendre rendez-vous
                  </Link>
                </li>
                <li>
                  <Link href="/contact?subject=Devis" className="hover:text-white transition-colors inline-block hover:translate-x-1 duration-200">
                    Demande de devis sur mesure
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-3">Réseaux Officiels</span>
              <div className="flex gap-2.5">
                <a 
                  href="https://www.instagram.com/chateau_dart_meubles/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Château d'art"
                  className="w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://www.facebook.com/chateau.dart.alger/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Château d'art"
                  className="w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://www.tiktok.com/@chateaudart_meubles" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Château d'art"
                  className="w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.youtube.com/@chateaudart/featured" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Château d'art"
                  className="w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#71717A] gap-4">
          <p>© 2026 Château d&apos;art. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Service Client</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
