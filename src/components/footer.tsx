'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Check, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { TikTokIcon } from '@/components/icons';
import { useSiteConfig } from '@/lib/use-site-config';
import { getSafeMapEmbedUrl } from '@/lib/site-config';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared furniture outline paths — rendered TWICE (dark on white / light on dark)
   ViewBox: 0 0 1440 165  |  midline at y = 82.5
   Each piece's visual center is tuned to sit near y ≈ 82 so both halves show.
───────────────────────────────────────────────────────────────────────────── */
function FurniturePaths() {
  return (
    <>
      {/* 1 ── 3-SEATER SOFA (left) — back top ~y22, legs bottom ~y144 */}
      <g transform="translate(18,22) rotate(-0.7,151,61)" strokeWidth="1.5">
        {/* Left armrest */}
        <path d="M 6,15 Q 0,15 0,25 L 0,106 L 24,106 L 24,22 Q 24,10 15,10 L 10,10 Q 6,10 6,15 Z" />
        {/* Right armrest */}
        <path d="M 276,15 Q 282,15 282,25 L 282,106 L 258,106 L 258,22 Q 258,10 267,10 L 272,10 Q 276,10 276,15 Z" />
        {/* Back cushions */}
        <rect x="22" y="10" width="238" height="54" rx="11" />
        <line x1="101" y1="10" x2="101" y2="64" strokeWidth="0.9" />
        <line x1="181" y1="10" x2="181" y2="64" strokeWidth="0.9" />
        {/* Seat */}
        <rect x="22" y="62" width="238" height="44" rx="8" />
        <line x1="101" y1="62" x2="101" y2="106" strokeWidth="0.9" />
        <line x1="181" y1="62" x2="181" y2="106" strokeWidth="0.9" />
        {/* Legs */}
        <line x1="42" y1="106" x2="39" y2="122" strokeWidth="1.6" />
        <line x1="240" y1="106" x2="243" y2="122" strokeWidth="1.6" />
      </g>

      {/* 2 ── FLOOR LAMP (slim, full height) — shade ~y8, base ~y160 */}
      <g transform="translate(368,3)" strokeWidth="1.3">
        <path d="M -20,28 L 20,28 L 13,8 L -13,8 Z" />
        <line x1="-17" y1="24" x2="17" y2="24" strokeWidth="0.7" />
        <line x1="0" y1="28" x2="0" y2="150" />
        <path d="M -19,150 Q -23,154 -19,158 L 19,158 Q 23,154 19,150 Z" />
        <ellipse cx="0" cy="158" rx="23" ry="4" />
      </g>

      {/* 3 ── ARMCHAIR — back top ~y30, legs ~y137 */}
      <g transform="translate(450,30) rotate(1.3,66,54)" strokeWidth="1.4">
        <path d="M 5,12 Q 0,12 0,22 L 0,86 L 20,86 L 20,20 Q 20,8 12,8 Q 5,8 5,12 Z" />
        <path d="M 125,12 Q 130,12 130,22 L 130,86 L 110,86 L 110,20 Q 110,8 118,8 Q 125,8 125,12 Z" />
        <rect x="18" y="8" width="94" height="50" rx="10" />
        <line x1="65" y1="8" x2="65" y2="58" strokeWidth="0.8" />
        <rect x="18" y="56" width="94" height="38" rx="7" />
        <line x1="30" y1="94" x2="27" y2="108" strokeWidth="1.6" />
        <line x1="102" y1="94" x2="105" y2="108" strokeWidth="1.6" />
      </g>

      {/* 4 ── COFFEE TABLE (low) — surface ~y57, legs bottom ~y100 */}
      <g transform="translate(644,57)" strokeWidth="1.4">
        <rect x="0" y="0" width="198" height="13" rx="5" />
        <path d="M 24,13 L 18,43 M 24,13 L 30,43" />
        <path d="M 174,13 L 168,43 M 174,13 L 180,43" />
        <rect x="22" y="37" width="154" height="8" rx="3" strokeWidth="1" />
      </g>

      {/* 5 ── DINING CHAIR side profile — back top ~y32, legs ~y132 */}
      <g transform="translate(884,32) rotate(-1.2,38,50)" strokeWidth="1.4">
        <path d="M 6,0 Q 2,0 0,10 L 0,100" />
        <path d="M 0,44 Q 0,41 5,41 L 70,41 Q 74,41 74,44 L 74,56 Q 74,59 70,59 L 5,59 Q 0,59 0,56 Z" />
        <line x1="70" y1="59" x2="74" y2="100" />
        <line x1="0" y1="20" x2="9" y2="20" strokeWidth="0.9" />
        <line x1="0" y1="33" x2="9" y2="33" strokeWidth="0.9" />
      </g>

      {/* 6 ── PENDANT LAMP — wire ~y23, shade bottom ~y123 */}
      <g transform="translate(1026,23)" strokeWidth="1.3">
        <line x1="0" y1="0" x2="0" y2="42" />
        <path d="M -30,42 Q -37,78 -29,98 L 29,98 Q 37,78 30,42 Z" />
        <ellipse cx="0" cy="44" rx="30" ry="5" />
        <ellipse cx="0" cy="98" rx="29" ry="5" />
        <ellipse cx="0" cy="70" rx="33" ry="4" strokeWidth="0.8" />
      </g>

      {/* 7 ── VASE + BRANCHES — leaf tips ~y20, base ~y147 */}
      <g transform="translate(1150,18)" strokeWidth="1.3">
        <path d="M 22,82 Q 5,82 2,70 L 1,22 Q -1,10 12,5 Q 22,0 32,5 Q 42,10 40,22 L 38,70 Q 35,82 22,82 Z" />
        <ellipse cx="21" cy="6" rx="11" ry="4" />
        <path d="M 21,4 Q 11,-18 -3,-40" />
        <path d="M 21,4 Q 28,-22 18,-44" />
        <path d="M 21,4 Q 39,-14 50,-34" />
        <path d="M -3,-40 Q -16,-50 -10,-36" strokeWidth="1" />
        <path d="M 18,-44 Q 8,-56 20,-48" strokeWidth="1" />
        <path d="M 50,-34 Q 62,-42 55,-26" strokeWidth="1" />
      </g>

      {/* 8 ── SIDEBOARD / BUFFET — top ~y42, legs ~y122 */}
      <g transform="translate(1207,42) rotate(0.6,111,42)" strokeWidth="1.5">
        <rect x="0" y="0" width="220" height="62" rx="7" />
        <line x1="74" y1="6" x2="74" y2="56" strokeWidth="0.9" />
        <line x1="146" y1="6" x2="146" y2="56" strokeWidth="0.9" />
        <line x1="58" y1="31" x2="68" y2="31" strokeWidth="2" />
        <line x1="130" y1="31" x2="140" y2="31" strokeWidth="2" />
        <line x1="202" y1="31" x2="212" y2="31" strokeWidth="2" />
        <line x1="22" y1="62" x2="20" y2="80" strokeWidth="2" />
        <line x1="198" y1="62" x2="200" y2="80" strokeWidth="2" />
      </g>
    </>
  );
}

export function Footer() {
  const siteConfig = useSiteConfig();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const mapSrc = getSafeMapEmbedUrl(siteConfig.maps_embed_url);

  return (
    <footer className="relative font-sans" style={{ marginTop: -82, position: 'relative', zIndex: 10 }}>

      {/* ════════════════════════════════════════════════════════
          ONE unified dark bg — blurred hero image covers everything.
          White mask hides the dark bg for the top 82px so furniture
          tops appear on the white page, bottoms on the dark footer.
      ════════════════════════════════════════════════════════ */}
      <div className="relative bg-[#0f0f0f] text-white">

        {/* Single blurred hero bg — full footer height */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <img
            src="/hero-mansion.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center select-none"
            style={{ filter: 'blur(32px) brightness(0.20) saturate(0.6)', transform: 'scale(1.12)' }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/40 via-transparent to-[#0f0f0f]/80" />
        </div>

        {/* White mask — covers top 82px so furniture tops sit on white page */}
        <div
          className="absolute top-0 inset-x-0 bg-white pointer-events-none"
          style={{ height: 82, zIndex: 1 }}
        />

        {/* ── Furniture outline zone (165px, straddles white→dark boundary) ── */}
        <div className="relative" style={{ height: 165, zIndex: 2 }} aria-hidden="true">
          {/* SVG A — dark strokes on white top half */}
          <svg
            viewBox="0 0 1440 165"
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: 'inset(0 0 50% 0)' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="rgba(18,18,18,0.22)" strokeLinecap="round" strokeLinejoin="round">
              <FurniturePaths />
            </g>
          </svg>
          {/* SVG B — white strokes on dark bottom half */}
          <svg
            viewBox="0 0 1440 165"
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: 'inset(50% 0 0 0)' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="rgba(255,255,255,0.28)" strokeLinecap="round" strokeLinejoin="round">
              <FurniturePaths />
            </g>
          </svg>
        </div>

        {/* ── MOBILE ── */}
        <div className="relative md:hidden px-5 pt-8 pb-8 flex flex-col gap-8" style={{ zIndex: 2 }}>
          <div className="flex flex-col items-center text-center gap-3">
            <Link href="/">
              <img src="/smalllogo-white.png" alt="M&F Meubles" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Maison de mobilier contemporain et d&apos;art de vivre à Kouba, Alger. Lignes pures, confort d&apos;exception.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-white/70 items-center">
            <a href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-2 font-semibold text-white">
              <Phone size={13} className="text-white/40" />{siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2">
              <Mail size={13} className="text-white/40" />{siteConfig.email}
            </a>
            <span className="flex items-center gap-2 text-center">
              <MapPin size={13} className="text-white/40 shrink-0" />{siteConfig.address}
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 h-36 w-full opacity-80">
            <iframe title="M&F Meubles Maps" src={mapSrc} className="w-full h-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
          </div>

          <div className="flex justify-center gap-3">
            {[
              { href: siteConfig.instagram_url || 'https://www.instagram.com/mfmeubles/', label: 'Instagram', icon: <Instagram size={15} /> },
              { href: siteConfig.facebook_url || 'https://www.facebook.com/profile.php?id=100063579698712&locale=fr_FR', label: 'Facebook', icon: <Facebook size={15} /> },
              { href: siteConfig.tiktok_url || 'https://www.tiktok.com/@mfmeubleskouba', label: 'TikTok', icon: <TikTokIcon className="w-3.5 h-3.5" /> },
              { href: 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA', label: 'Avis Google', icon: <Youtube size={15} /> },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all">
                {s.icon}
              </a>
            ))}
          </div>

          <p className="text-center text-[11px] text-white/30">© 2026 M&amp;F Meubles. Tous droits réservés.</p>
        </div>

        {/* ── DESKTOP ── */}
        <div className="relative hidden md:block" style={{ zIndex: 2 }}>
          <div className="max-w-[1400px] mx-auto px-8 lg:px-12 pt-10 pb-10">

            {/* Top row */}
            <div className="flex justify-between items-start mb-14">
              {/* Logo + brand name side by side */}
              <div>
                <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
                  <img src="/smalllogo-white.png" alt="M&F Meubles" className="h-12 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-serif italic text-white/85 text-sm tracking-wide">M&amp;F Meubles</span>
                    <span className="font-sans text-white/35 text-[9px] uppercase tracking-[3px]">Showroom · Kouba, Alger</span>
                  </div>
                </Link>
                <p className="text-sm text-white/45 max-w-sm leading-relaxed">
                  Maison de mobilier contemporain et d&apos;art de vivre.<br />
                  L&apos;alliance du bois noble et de l&apos;élégance intemporelle.
                </p>
              </div>
              {/* Delivery note — no pill, just thin underline */}
              <span className="text-xs text-white/45 font-medium border-b border-white/20 pb-0.5 mt-1">
                Livraison &amp; montage soigné sur Alger et les 69 wilayas
              </span>
            </div>

            {/* 4-col grid */}
            <div className="grid grid-cols-[1fr_1fr_1fr_300px] gap-10 lg:gap-14 items-start">

              {/* Col 1 — Contact + Socials */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[2.5px] text-white/35 font-semibold mb-5">Showroom</h3>
                <div className="space-y-4">
                  <a href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-all">
                      <Phone size={12} className="text-white/50" />
                    </div>
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{siteConfig.phone}</span>
                  </a>
                  <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-all">
                      <Mail size={12} className="text-white/50" />
                    </div>
                    <span className="text-sm text-white/55 group-hover:text-white/80 transition-colors truncate">{siteConfig.email}</span>
                  </a>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={12} className="text-white/50" />
                    </div>
                    <span className="text-sm text-white/55 leading-relaxed">
                      {siteConfig.address}<br />
                      <span className="text-white/35 text-xs">{siteConfig.hours}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  {[
                    { href: siteConfig.instagram_url || 'https://www.instagram.com/mfmeubles/', label: 'Instagram', icon: <Instagram size={13} /> },
                    { href: siteConfig.facebook_url || 'https://www.facebook.com/profile.php?id=100063579698712&locale=fr_FR', label: 'Facebook', icon: <Facebook size={13} /> },
                    { href: siteConfig.tiktok_url || 'https://www.tiktok.com/@mfmeubleskouba', label: 'TikTok', icon: <TikTokIcon className="w-3 h-3" /> },
                    { href: 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA', label: 'Avis Google', icon: <Youtube size={13} /> },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="w-8 h-8 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-white/50 hover:bg-white/18 hover:text-white transition-all">
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Col 2 — Collections */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[2.5px] text-white/35 font-semibold mb-5">Collections</h3>
                <ul className="space-y-3">
                  {[
                    { href: '/all-products', label: 'Tous les modèles' },
                    { href: '/all-products?category=sofas', label: 'Canapés & Salons' },
                    { href: '/all-products?category=salle-a-manger', label: 'Salles à manger' },
                    { href: '/all-products?category=chambres', label: 'Chambres à coucher' },
                    { href: '/all-products?category=armoire', label: 'Armoires & Dressings' },
                    { href: '/offers', label: 'Offres du moment' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 — Newsletter + Maison */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[2.5px] text-white/35 font-semibold mb-5">Club Privilège</h3>
                <p className="text-sm text-white/80 font-semibold mb-1">Nouveautés &amp; Séries Limitées</p>
                <p className="text-xs text-white/40 leading-relaxed mb-5">
                  Accès en avant-première à nos catalogues de saison et invitations privées.
                </p>
                {subscribed ? (
                  <div className="p-3 rounded-xl bg-white/8 border border-white/12 text-white/70 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Merci. Vous recevrez nos invitations exclusives.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                    <input
                      type="email"
                      aria-label="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Votre adresse email"
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                    <button type="submit"
                      className="w-full bg-white text-neutral-900 hover:bg-white/90 px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <span>S&apos;inscrire au club</span>
                      <ArrowRight size={12} />
                    </button>
                  </form>
                )}
                <div className="mt-8">
                  <h3 className="text-[11px] uppercase tracking-[2.5px] text-white/35 font-semibold mb-4">Maison</h3>
                  <ul className="space-y-3">
                    {[
                      { href: '/about', label: 'Notre histoire' },
                      { href: '/showroom', label: 'Showroom virtuel' },
                      { href: '/contact', label: 'Rendez-vous & devis' },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Col 4 — Map */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[2.5px] text-white/35 font-semibold mb-4">Localisation</h3>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] opacity-85 hover:opacity-100 transition-opacity duration-300" style={{ height: 190 }}>
                  <iframe title="Showroom Maps" src={mapSrc} className="w-full h-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
                </div>
                <p className="text-xs text-white/35 leading-snug mt-2">{siteConfig.address}</p>
              </div>

            </div>

            {/* Bottom legal */}
            <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[11px] text-white/25 gap-3">
              <p>© 2026 M&amp;F Meubles. Tous droits réservés.</p>
              <div className="flex gap-6">
                <Link href="/about" className="hover:text-white/60 transition-colors">Notre histoire</Link>
                <Link href="/contact" className="hover:text-white/60 transition-colors">Contactez-nous</Link>
                <Link href="/contact" className="hover:text-white/60 transition-colors">Service Client</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
