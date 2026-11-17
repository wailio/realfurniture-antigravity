'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X, Check } from 'lucide-react';
import { useSiteConfig } from '@/lib/use-site-config';

interface HeaderProps {
  theme?: 'dark' | 'light' | 'overlay';
  sticky?: boolean;
}

export function Header({ theme = 'overlay', sticky = false }: HeaderProps) {
  const siteConfig = useSiteConfig();
  const isOverlay = theme === 'overlay';
  const isDark = theme === 'dark' || isOverlay;

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'FR' | 'AR'>('FR');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    { name: 'Canapés & Salons', href: '/all-products?category=sofas' },
    { name: 'Chambres & Suites', href: '/all-products?category=chambres' },
    { name: 'Armoires & Dressings', href: '/all-products?category=armoire' },
    { name: 'Accessoires & Décoration', href: '/all-products?category=accessories' },
  ];

  return (
    <header
      className={`w-full z-40 transition-all duration-300 ${
        sticky ? 'sticky top-0' : isOverlay ? 'absolute top-0 inset-x-0' : 'relative'
      } ${
        isOverlay
          ? 'bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b border-white/10'
          : isDark
            ? scrolled
              ? 'bg-[#0B0D11]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.35)]'
              : 'bg-[#0B0D11] border-b border-white/10'
            : scrolled && sticky
              ? 'bg-white/95 backdrop-blur-2xl border-b border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
              : 'bg-white border-b border-neutral-200/80 shadow-xs'
      }`}
    >
      <div className="max-w-[1560px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-4 md:py-5 flex items-center justify-between gap-6">
        {/* ── LEFT: Brand Logo Icon (Clean, without text) ── */}
        <Link href="/" className="group flex items-center shrink-0 focus-visible:outline-none">
          <img
            src="/bigtower.png"
            alt="Château d'Art"
            className={`h-10 sm:h-11 md:h-12 lg:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
              isDark
                ? 'brightness-0 invert drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]'
                : 'drop-shadow-xs'
            }`}
          />
        </Link>

        {/* ── CENTER: Compact Navigation Menu (Art Home Furniture Font, Size & Spacing) ── */}
        <nav
          className={`hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] xl:text-[13.5px] font-medium tracking-normal transition-colors ${
            isDark ? 'text-white/85' : 'text-neutral-700'
          }`}
        >
          <Link
            href="/"
            className={`py-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
          >
            Accueil
          </Link>

          {/* Collection with Dropdown */}
          <div
            className="relative"
            ref={productsDropdownRef}
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <Link
              href="/all-products"
              className={`inline-flex items-center gap-1 py-1.5 transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-black'
              }`}
            >
              <span>Collection</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDark ? 'text-white/50' : 'text-neutral-400'
                } ${isProductsOpen ? 'rotate-180' : ''}`}
              />
            </Link>

            {/* Dropdown Menu */}
            <div
              className={`absolute left-0 top-full pt-2 w-60 transition-all duration-200 ${
                isProductsOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-1'
              }`}
            >
              <div
                className={`rounded-2xl shadow-2xl p-2 overflow-hidden border backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/15 bg-[#0C0F16]/95 text-neutral-200'
                    : 'border-neutral-200/80 bg-white/95 text-neutral-800'
                }`}
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className={`block px-4 py-2 text-xs tracking-wide rounded-xl transition-colors ${
                      isDark
                        ? 'hover:bg-white/10 hover:text-white text-neutral-300'
                        : 'hover:bg-neutral-100 hover:text-black text-neutral-700'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/about"
            className={`py-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
          >
            À Propos
          </Link>

          <Link
            href="/showroom"
            className={`py-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
          >
            Showroom
          </Link>

          <Link
            href="/inspirations"
            className={`py-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
          >
            Inspirations
          </Link>

          <Link
            href="/contact"
            className={`py-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
          >
            Contact
          </Link>
        </nav>

        {/* ── RIGHT: Smooth Language Switcher with Flags Only (No phone, no devis button) ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none backdrop-blur-md ${
                isDark
                  ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border-white/20 shadow-xs'
                  : 'text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200'
              }`}
              aria-haspopup="true"
              aria-expanded={isLangOpen}
            >
              <img
                src={selectedLang === 'FR' ? '/flags/fr.webp' : '/flags/sa.webp'}
                alt={selectedLang}
                className="w-4 h-2.5 object-cover rounded-xs"
              />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isLangOpen && (
              <div
                className={`absolute right-0 mt-2 w-32 backdrop-blur-2xl border rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150 ${
                  isDark
                    ? 'bg-[#0D0F14]/95 border-white/15 text-neutral-200'
                    : 'bg-white/95 border-neutral-200/80 text-neutral-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLang('FR');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-medium ${
                    isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src="/flags/fr.webp" alt="France" className="w-4 h-2.5 object-cover rounded-xs" />
                    <span>FR</span>
                  </div>
                  {selectedLang === 'FR' && <Check className="w-3.5 h-3.5 text-[#d1aa5c]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLang('AR');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-medium ${
                    isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src="/flags/sa.webp" alt="Arabic" className="w-4 h-2.5 object-cover rounded-xs" />
                    <span>AR</span>
                  </div>
                  {selectedLang === 'AR' && <Check className="w-3.5 h-3.5 text-[#d1aa5c]" />}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors rounded-xl ${
              isDark
                ? 'text-white hover:bg-white/10'
                : 'text-neutral-800 hover:text-black hover:bg-neutral-100'
            }`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden backdrop-blur-2xl border-t px-6 py-6 animate-in fade-in duration-200 shadow-2xl ${
            isDark
              ? 'bg-[#0B0D11]/98 border-white/10 text-white'
              : 'bg-white/98 border-neutral-200 text-neutral-800'
          }`}
        >
          {/* Nav Links */}
          <nav className={`flex flex-col text-sm font-medium divide-y tracking-wide ${
            isDark ? 'text-neutral-200 divide-white/10' : 'text-neutral-800 divide-neutral-100'
          }`}>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 font-semibold uppercase tracking-wider text-xs ${isDark ? 'text-white' : 'text-black'}`}
            >
              Accueil
            </Link>

            <div>
              <button
                type="button"
                onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                className={`w-full flex items-center justify-between py-3 font-semibold uppercase tracking-wider text-xs ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
              >
                <span>Collection</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileProductsOpen && (
                <div className={`pl-3 py-1 flex flex-col gap-1.5 my-1 text-xs rounded-xl p-2.5 ${
                  isDark ? 'bg-white/10 text-neutral-200' : 'bg-neutral-50 text-neutral-600'
                }`}>
                  <Link href="/all-products" onClick={() => setIsMobileMenuOpen(false)} className={`py-1 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    Tous les modèles
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className={`py-1 ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 uppercase tracking-wider text-xs ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
              À Propos
            </Link>
            <Link href="/showroom" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 uppercase tracking-wider text-xs ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
              Showroom
            </Link>
            <Link href="/inspirations" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 uppercase tracking-wider text-xs ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
              Inspirations
            </Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 uppercase tracking-wider text-xs ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
