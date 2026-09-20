'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Phone, ChevronDown, Menu, X, Check, Instagram, Facebook, Youtube } from 'lucide-react';
import { TikTokIcon } from '@/components/icons';

interface HeaderProps {
  theme?: 'dark' | 'light';
}

export function Header({ theme = 'dark' }: HeaderProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'FR' | 'AR'>('FR');

  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { name: 'Salle à manger', href: '/all-products?category=salle-a-manger' },
    { name: 'Canapés', href: '/all-products?category=sofas' },
    { name: 'Chambres', href: '/all-products?category=chambres' },
    { name: 'Armoires', href: '/all-products?category=armoire' },
    { name: 'Accessoires', href: '/all-products?category=accessories' },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 w-full z-50 shadow-md font-sora transition-colors duration-300">
      {/* ── ROW 1: Top Promo Bar (Dark, Full Width, with Socials on Left) ── */}
      <div className="bg-[#0A0B0C] text-[#F2F1EF] text-xs py-1.5 px-4 sm:px-6 md:px-10 lg:px-12 border-b border-white/5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* LEFT: Social Icons — all screens, tiny on mobile */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <a href="https://www.instagram.com/chateau_dart_meubles/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#B7BBC0] hover:text-[#b68d40] transition-colors p-0.5">
              <Instagram className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            </a>
            <a href="https://www.facebook.com/chateau.dart.alger/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#B7BBC0] hover:text-[#b68d40] transition-colors p-0.5">
              <Facebook className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            </a>
            <a href="https://www.tiktok.com/@chateaudart_meubles" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-[#B7BBC0] hover:text-[#b68d40] transition-colors p-0.5">
              <TikTokIcon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            </a>
            <a href="https://www.youtube.com/@chateaudart/featured" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#B7BBC0] hover:text-[#b68d40] transition-colors p-0.5 hidden sm:block">
              <Youtube className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            </a>
          </div>

          {/* RIGHT: Promo text — right on mobile, center on desktop */}
          <div className="flex-1 md:text-center text-right font-medium tracking-wider">
            <span className="md:hidden text-[9px] text-[#B7BBC0]">Sale Up To 50% Off</span>
            <span className="hidden md:inline text-[11px]">Exclusive Furniture Sale Up To 50% Off</span>
          </div>

          {/* RIGHT: desktop only */}
          <div className="hidden md:flex items-center justify-end w-[116px] text-[10px] text-[#A1A1AA] uppercase tracking-widest font-medium">
            <span>Haute Création</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Main Header Bar (Task Bar with Prominent Logo) ── */}
      <div
        className={`py-1 md:py-1.5 px-4 sm:px-6 md:px-10 lg:px-12 min-h-[64px] md:min-h-[92px] lg:min-h-[96px] flex items-center transition-colors duration-300 ${
          isDark
            ? 'bg-[#101114] border-b border-white/10'
            : 'bg-white border-b border-[#E4E4E7]'
        }`}
      >
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          
          {/* LEFT: Phone / Need Help block — desktop only */}
          <div className="hidden md:flex flex-1 items-center justify-start">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3.5 transition-transform duration-250 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68d40]"
              aria-label="Besoin d'aide ? 0561 71 91 00"
            >
              <div
                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-250 ease-out group-hover:bg-[#8f7137] group-hover:text-white group-hover:shadow-[0_6px_18px_rgba(182,141,64,0.38)] ${
                  isDark
                    ? 'bg-[#F4F4F5] text-[#121316]'
                    : 'bg-[#F4F4F5] text-[#18181B]'
                }`}
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-250" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span
                  className={`text-[11px] font-medium transition-colors duration-250 tracking-wide ${
                    isDark
                      ? 'text-[#9CA3AF] group-hover:text-[#f4d79a]'
                      : 'text-[#71717A] group-hover:text-[#8f7137]'
                  }`}
                >
                  Need Help ?
                </span>
                <span
                  className={`text-sm md:text-base font-bold transition-colors duration-250 tracking-tight ${
                    isDark
                      ? 'text-white group-hover:text-[#f4d79a]'
                      : 'text-[#18181B] group-hover:text-[#8f7137]'
                  }`}
                >
                  0561 71 91 00
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Logo — left on mobile, centered on desktop */}
          <div className="flex-1 md:flex-shrink-0 flex items-center justify-start md:justify-center">
            <Link href="/" className="group flex items-center py-0">
              <img
                src="/bigtower.png"
                alt="Château d'art"
                className="h-[52px] sm:h-[56px] md:h-[76px] lg:h-[84px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </Link>
          </div>

          {/* RIGHT: CTA Button + Language Switcher (NO search, wishlist, account, or cart icons) */}
          <div className="flex-1 flex items-center justify-end gap-2.5 md:gap-3.5">
            {/* CTA Button — desktop only */}
            <Link
              href="/all-products"
              className="hidden md:inline-flex items-center justify-center w-24 md:w-28 h-8 md:h-9 rounded-none bg-[#b68d40] hover:bg-[#a37c35] text-white font-bold text-[11px] md:text-xs uppercase tracking-wider shadow-sm transition-all duration-200"
            >
              Découvrir
            </Link>

            {/* Language Switcher with User's Uploaded Flag Images */}
            <div className="hidden md:block relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`inline-flex items-center justify-center gap-1.5 md:gap-2 text-white w-24 md:w-28 h-8 md:h-9 rounded-none text-[11px] md:text-xs font-semibold shadow-sm transition-colors ${
                  isDark
                    ? 'bg-[#23262D] hover:bg-[#2D313A] border border-white/10'
                    : 'bg-[#374151] hover:bg-[#2D333B]'
                }`}
                aria-haspopup="true"
                aria-expanded={isLangOpen}
              >
                {selectedLang === 'FR' ? (
                  <>
                    <img
                      src="/flags/fr.webp"
                      alt="France"
                      className="w-4.5 h-3 object-cover rounded-none shadow-xs"
                    />
                    <span>FR</span>
                  </>
                ) : (
                  <>
                    <img
                      src="/flags/sa.webp"
                      alt="Arabic"
                      className="w-4.5 h-3 object-cover rounded-none shadow-xs"
                    />
                    <span>AR</span>
                  </>
                )}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isLangOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Language Dropdown */}
              {isLangOpen && (
                <div className="absolute right-0 mt-1 w-full min-w-[140px] bg-[#1E2024] border border-white/15 rounded-none shadow-2xl py-1.5 z-50 animate-fade-in-down">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLang('FR');
                      setIsLangOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/flags/fr.webp"
                        alt="France"
                        className="w-5 h-3.5 object-cover rounded-none"
                      />
                      <span>Français</span>
                    </div>
                    {selectedLang === 'FR' && (
                      <Check className="w-3.5 h-3.5 text-[#b68d40]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLang('AR');
                      setIsLangOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/flags/sa.webp"
                        alt="Arabic"
                        className="w-5 h-3.5 object-cover rounded-none"
                      />
                      <span>العربية</span>
                    </div>
                    {selectedLang === 'AR' && (
                      <Check className="w-3.5 h-3.5 text-[#b68d40]" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${
                isDark
                  ? 'text-white hover:text-[#b68d40]'
                  : 'text-[#18181B] hover:text-[#b68d40]'
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Navigation Bar ── */}
      <nav
        className={`hidden md:block py-2 md:py-2.5 px-6 md:px-12 transition-colors duration-300 ${
          isDark
            ? 'bg-[#15161A] border-b border-white/10'
            : 'bg-[#F5F1E8] border-b border-[#E9E4DA]'
        }`}
      >
        <div
          className={`max-w-[1440px] mx-auto flex items-center justify-center gap-9 md:gap-12 lg:gap-16 text-sm font-medium tracking-wide ${
            isDark ? 'text-[#E4E4E7]' : 'text-[#27272A]'
          }`}
        >
          {/* Accueil */}
          <Link
            href="/"
            className="hover:text-[#b68d40] transition-colors py-1 font-medium"
          >
            Accueil
          </Link>

          {/* Produits with Dropdown */}
          <div
            className="relative"
            ref={productsDropdownRef}
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <Link
              href="/all-products"
              className="inline-flex items-center gap-1.5 py-1 text-[#b68d40] font-semibold hover:text-[#cf9d42] transition-colors"
            >
              <span>Produits</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProductsOpen ? 'rotate-180' : ''
                }`}
              />
            </Link>

            {/* Dropdown Menu */}
            <div
              className={`absolute left-0 top-full pt-2 w-52 transition-all duration-200 ${
                isProductsOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-1'
              }`}
            >
              <div
                className={`rounded-md shadow-2xl py-2.5 overflow-hidden border ${
                  isDark
                    ? 'bg-[#1A1C21] border-white/15 text-[#E4E4E7]'
                    : 'bg-white border-[#E9E4DA] text-[#3F3F46]'
                }`}
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className={`block px-5 py-2.5 text-sm transition-colors ${
                      isDark
                        ? 'hover:bg-white/10 hover:text-white'
                        : 'hover:text-[#18181B] hover:bg-[#F5F1E8]'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Pièces */}
          <Link
            href="/rooms"
            className="hover:text-[#b68d40] transition-colors py-1"
          >
            Pièces
          </Link>

          {/* Inspirations */}
          <Link
            href="/inspirations"
            className="hover:text-[#b68d40] transition-colors py-1"
          >
            Inspirations
          </Link>

          {/* Offres */}
          <Link
            href="/offers"
            className="hover:text-[#b68d40] transition-colors py-1"
          >
            Offres
          </Link>

          {/* À Propos */}
          <Link
            href="/about"
            className="hover:text-[#b68d40] transition-colors py-1"
          >
            À Propos
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className="hover:text-[#b68d40] transition-colors py-1"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* ── MOBILE MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden backdrop-blur-xl bg-[#0A0B0C]/88 border-b border-white/10 px-5 py-4 animate-fade-in shadow-2xl">
          {/* Phone shortcut */}
          <a
            href="tel:0561719100"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2.5 mb-3 bg-white/5 border border-white/10 rounded-sm"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#b68d40] text-white flex-shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-[#B7BBC0] block leading-none mb-0.5">Need Help?</span>
              <span className="text-xs font-bold text-white">0561 71 91 00</span>
            </div>
          </a>

          {/* Nav Links */}
          <nav className="flex flex-col text-sm font-medium text-[#E4E4E7]">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/8 hover:text-[#b68d40] transition-colors">Accueil</Link>

            <div>
              <button
                type="button"
                onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                className="w-full flex items-center justify-between py-2 border-b border-white/8 text-[#b68d40]"
              >
                <span>Produits</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileProductsOpen && (
                <div className="pl-3 py-1.5 flex flex-col gap-1 bg-white/5 rounded-sm my-1 text-xs text-[#B7BBC0]">
                  <Link href="/all-products" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-white hover:text-[#b68d40]">Tous les produits</Link>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-[#b68d40]">{cat.name}</Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/rooms" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/8 hover:text-[#b68d40] transition-colors">Pièces</Link>
            <Link href="/inspirations" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/8 hover:text-[#b68d40] transition-colors">Inspirations</Link>
            <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/8 hover:text-[#b68d40] transition-colors">Offres</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/8 hover:text-[#b68d40] transition-colors">À Propos</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#b68d40] transition-colors">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
