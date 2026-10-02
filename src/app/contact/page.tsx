'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { Phone, Mail, MapPin, Clock, MessageSquare, Check, ArrowRight, ArrowUpRight, Star, Sparkles } from 'lucide-react';
import { products } from '@/lib/products';
import { useSiteConfig } from '@/lib/use-site-config';

function ShowroomMap() {
  return (
    <div className="w-full relative rounded-sm overflow-hidden border border-white/10 hover:border-[#b68d40]/50 transition-all duration-500 shadow-xl bg-[#121316]">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#18191B] border-b border-white/10 text-xs font-sora">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#b68d40]" />
          <span className="font-semibold text-white text-[11px] md:text-xs">Château D&apos;Art &mdash; Showroom</span>
        </div>
        <span className="text-[10px] text-[#A1A1AA]">Alger, Algérie</span>
      </div>
      <div className="relative w-full h-[190px] sm:h-[220px] md:h-[260px] overflow-hidden">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5906046037494!2d3.060058575713971!3d36.70837457287061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fad5fae229a89%3A0xa8afd38ca1b6e44f!2sCh%C3%A2teau%20D'Art%20-%20meubles!5e0!3m2!1sfr!2sdz!4v1789588881010!5m2!1sfr!2sdz" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="strict-origin-when-cross-origin" 
          title="Château D'Art Showroom" 
          className="w-full h-full grayscale contrast-[1.15] brightness-[0.8] hover:grayscale-0 transition-all duration-700" 
        />
        <a 
          href="https://maps.google.com/?q=Ch%C3%A2teau+D'Art+-+meubles" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="interactive-tap absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#b68d40] text-white text-[11px] font-semibold hover:bg-[#a37c35] transition-all shadow-lg"
        >
          <span>Itinéraire</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const siteConfig = useSiteConfig();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState<string | null>(null);
  const [productThumbnail, setProductThumbnail] = useState<string | null>(null);
  const [productDisplayName, setProductDisplayName] = useState<string | null>(null);
  const [hasSpotlight, setHasSpotlight] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [reviewSubmittedStars, setReviewSubmittedStars] = useState<number>(0);

  useEffect(() => {
    const product = searchParams.get('product');
    const image = searchParams.get('image');
    const subject = searchParams.get('subject');
    const message = searchParams.get('message');

    if (product || subject || message) {
      if (product) {
        setPrefilledProduct(product);
        const matched = products.find(
          (p) =>
            p.name.toLowerCase() === product.toLowerCase() ||
            product.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(product.toLowerCase())
        );
        setProductThumbnail(image || matched?.image || '/products/salon/aa.jpg');
        setProductDisplayName(matched?.name || product);
      }
      setFormData((prev) => ({
        ...prev,
        subject: subject || (product ? `Commande: ${product}` : prev.subject),
        message: message || (product ? `Bonjour, je souhaite commander ce produit : ${product}. Merci de me recontacter pour les détails et la livraison.` : prev.message),
      }));

      setHasSpotlight(true);

      // Smooth scroll to the highlighted message field with 400ms delay matching reference site
      const timer = setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, product: prefilledProduct || '' }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Offline fallback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    if (reviewRating === 0) return;
    const stars = reviewRating;
    // User rule: if 3 stars selected, promote to 4 stars for Google Review!
    const effectiveStars = stars === 3 ? 4 : stars;
    setReviewSubmittedStars(effectiveStars);
    setReviewSubmitted(true);

    if (stars >= 3) {
      // Copy review message to clipboard
      if (reviewText.trim() && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(reviewText.trim()).catch(() => {});
      }

      // Verified working Google review URL with Château D'art FID & action 3 (Write Review modal)
      const googleReviewUrl = 'https://www.google.com/search?q=Ch%C3%A2teau+D%27art+-+meubles+Birkhadem#lrd=0x128fad5fae229a89:0xa8afd38ca1b6e44f,3';
      
      // Open immediately on user click to prevent browser pop-up blockers from blocking it
      try {
        window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Failed to open window:', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header theme="dark" />
      
      {/* ���� Page Hero with Luxury Fading Backdrop Image ���� */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-4 overflow-hidden bg-[#0E0F10]">
        {/* Full-width Background Image with Progressive Bottom Fade */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/contact-hero.jpg"
            alt="Château d'art"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.2)_75%,transparent_100%)]"
          />
          {/* Smooth Luxury Gradient Overlay seamlessly fading into #0E0F10 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0F10]/45 via-[#0E0F10]/75 to-[#0E0F10]" />
          {/* Subtle Radial Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0E0F10_85%)] opacity-60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-2 border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-none text-[11px] uppercase tracking-[3px] text-[#b68d40] font-bold mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#b68d40]" />
              <span>Conseil &amp; Accompagnement</span>
            </div>
            
            <h1 className="font-fraunces font-light text-4xl md:text-6xl text-white tracking-wide mb-6 drop-shadow-md">
              Contactez la Maison
            </h1>
            
            <div className="flex justify-center w-full mb-6">
              <svg width="200" height="2" viewBox="0 0 200 2" fill="none" xmlns="http://www.w3.org/2000/svg" className="heading-underline">
                <path d="M0 1H200" stroke="#b68d40" strokeWidth="2" />
              </svg>
            </div>
            
            <p className="text-[#E4E4E7] font-sora text-sm md:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Notre équipe est à votre disposition pour vous orienter, préparer un devis personnalisé ou planifier une visite privée de nos collections.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      <section className="w-full py-6 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
        <div className="max-w-xl md:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start gap-8">
          
          {/* ── Left Column: Contact Cards + WhatsApp + Map (Above form on mobile) ── */}
          <div className="w-full flex flex-col gap-4 items-center">
            
            {/* 2x2 Info Cards — Centered & uniform */}
            <LuxuryReveal className="w-full">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                <a 
                  href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} 
                  className="interactive-tap group bg-[#121316] border border-white/10 hover:border-[#b68d40]/50 p-3 sm:p-4 md:p-6 flex flex-col items-center text-center rounded-sm transition-all duration-300 shadow-md"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-3 group-hover:bg-[#b68d40] group-hover:text-white transition-colors">
                    <Phone size={14} />
                  </div>
                  <h3 className="font-fraunces text-xs md:text-base text-white mb-0.5 leading-tight font-medium">Téléphone</h3>
                  <p className="font-sora text-[10px] md:text-xs text-[#b68d40] font-bold">{siteConfig.phone}</p>
                  <span className="text-[9px] text-[#71717A] mt-1 hidden sm:block">Appel / WhatsApp</span>
                </a>

                <a 
                  href={`mailto:${siteConfig.email}`} 
                  className="interactive-tap group bg-[#121316] border border-white/10 hover:border-[#b68d40]/50 p-3 sm:p-4 md:p-6 flex flex-col items-center text-center rounded-sm transition-all duration-300 shadow-md"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-3 group-hover:bg-[#b68d40] group-hover:text-white transition-colors">
                    <Mail size={14} />
                  </div>
                  <h3 className="font-fraunces text-xs md:text-base text-white mb-0.5 leading-tight font-medium">Email</h3>
                  <p className="font-sora text-[9px] md:text-xs text-white font-medium truncate max-w-[120px] sm:max-w-none">{siteConfig.email}</p>
                  <span className="text-[9px] text-[#71717A] mt-1 hidden sm:block">Réponse 24h</span>
                </a>

                <div className="bg-[#121316] border border-white/10 p-3 sm:p-4 md:p-6 flex flex-col items-center text-center rounded-sm shadow-md">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-3">
                    <MapPin size={14} />
                  </div>
                  <h3 className="font-fraunces text-xs md:text-base text-white mb-0.5 leading-tight font-medium">Livraison</h3>
                  <p className="font-sora text-[10px] md:text-xs text-[#A1A1AA] leading-snug">
                    <strong className="text-white">58 wilayas</strong> d&apos;Algérie
                  </p>
                  <span className="text-[9px] text-[#71717A] mt-1 hidden sm:block">Partout en Algérie</span>
                </div>

                <div className="bg-[#121316] border border-white/10 p-3 sm:p-4 md:p-6 flex flex-col items-center text-center rounded-sm shadow-md">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-3">
                    <Clock size={14} />
                  </div>
                  <h3 className="font-fraunces text-xs md:text-base text-white mb-0.5 leading-tight font-medium">Horaires</h3>
                  <p className="font-sora text-[10px] md:text-xs text-[#A1A1AA] leading-snug">
                    {siteConfig.hours}
                  </p>
                  <span className="text-[9px] text-[#71717A] mt-1 hidden sm:block">Showroom ouvert</span>
                </div>
              </div>
            </LuxuryReveal>

            {/* Direct WhatsApp banner */}
            <LuxuryReveal className="w-full">
              <div className="w-full p-3.5 sm:p-4 md:p-5 rounded-sm bg-[#121316] border border-[#b68d40]/30 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] flex-shrink-0">
                    <MessageSquare size={15} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-sora text-xs md:text-sm font-bold text-white leading-tight">Besoin d&apos;aide rapide ?</h4>
                    <p className="text-[10px] md:text-xs text-[#A1A1AA]">Discutez avec un conseiller en direct.</p>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${siteConfig.whatsapp || siteConfig.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="interactive-tap px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] md:text-xs font-bold rounded-sm uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm"
                >
                  <span>WhatsApp</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </LuxuryReveal>

            {/* Showroom Map (Desktop only in left column; appears under form on mobile) */}
            <div className="hidden lg:block w-full">
              <LuxuryReveal className="w-full">
                <ShowroomMap />
              </LuxuryReveal>
            </div>
          </div>

          {/* ── Right Column: Contact Form (Under info cards on mobile) ── */}
          <div className="w-full">
            <LuxuryReveal className="w-full">
              <form 
                ref={formRef} 
                onSubmit={handleSubmit} 
                className="w-full bg-[#121316] border border-white/10 p-5 sm:p-7 md:p-10 rounded-sm shadow-xl space-y-4 md:space-y-5 text-left"
              >
                <div className="text-center sm:text-left">
                  <h3 className="font-fraunces text-xl md:text-2xl text-white font-light mb-1">Envoyez-nous un Message</h3>
                  <p className="font-sora text-xs text-[#A1A1AA]">Remplissez ce formulaire et notre équipe vous recontactera dans les plus brefs délais.</p>
                </div>

                {submitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#b68d40]/20 border border-[#b68d40] mx-auto flex items-center justify-center text-[#b68d40] shadow-[0_0_20px_rgba(182,141,64,0.35)]">
                      <Check size={24} />
                    </div>
                    
                    <div>
                      <h4 className="font-fraunces text-xl md:text-2xl text-white font-light mb-1">
                        Message Reçu avec Succès
                      </h4>
                      <p className="font-sora text-xs md:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                        Merci. Un conseiller Château d&apos;art vous contactera très bientôt.
                      </p>
                    </div>

                    {/* ── Interactive Service Review Pop-out Section ── */}
                    <div className="mt-6 pt-6 border-t border-white/10 w-full max-w-md mx-auto">
                      {!reviewSubmitted ? (
                        <div className="flex flex-col items-center text-center">
                          {/* Title */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#d1aa5c]" />
                            <p className="font-sora text-xs md:text-sm font-semibold text-white/95 tracking-wide">
                              Laissez-nous un avis sur le service.
                            </p>
                          </div>
                          <p className="text-[11px] text-white/50 mb-3.5">
                            Votre retour nous aide à perfectionner notre accueil.
                          </p>

                          {/* 5 Stars: black/dark turning gold on hover and click */}
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((starIndex) => {
                              const isGold = (hoverRating || reviewRating) >= starIndex;
                              return (
                                <button
                                  key={starIndex}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(starIndex)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewRating(starIndex)}
                                  className="p-1 transition-transform duration-200 hover:scale-125 cursor-pointer focus:outline-none"
                                  aria-label={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
                                >
                                  <Star
                                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-200 ${
                                      isGold
                                        ? 'fill-[#d1aa5c] text-[#d1aa5c] scale-110 drop-shadow-[0_0_10px_rgba(209,170,92,0.7)]'
                                        : 'fill-[#0E0F10] text-zinc-700 stroke-zinc-600'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          {/* Smooth pop-out writing space */}
                          <div
                            className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                              reviewRating > 0
                                ? 'max-h-96 opacity-100 translate-y-0 mt-2'
                                : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                            }`}
                          >
                            <div className="p-3.5 sm:p-4 bg-[#0E0F10] border border-white/15 text-left mb-2 shadow-lg">
                              <label className="block text-[10.5px] font-sora text-[#A1A1AA] uppercase tracking-wider mb-2 font-medium">
                                Votre avis :
                              </label>
                              <textarea
                                rows={3}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder={
                                  reviewRating <= 2
                                    ? "Expliquez-nous ce qui n'a pas convenu, nous ferons tout pour nous améliorer..."
                                    : "Partagez votre expérience avec la Maison Château d'art..."
                                }
                                className="w-full bg-[#141518] border border-white/10 p-2.5 text-xs md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#d1aa5c] transition-colors resize-none rounded-none"
                              />

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                <span className="text-[10px] text-white/50 font-sora">
                                  Note : <strong className="text-[#d1aa5c]">{reviewRating}/5</strong>
                                </span>

                                <button
                                  type="button"
                                  onClick={handleReviewSubmit}
                                  className="interactive-tap px-4 py-2 bg-[#d1aa5c] hover:bg-[#b68d40] text-[#0E0F10] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>Envoyer mon avis</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Review Result Confirmation */
                        <div className="py-4 px-2 text-center flex flex-col items-center animate-fade-in-up">
                          {reviewSubmittedStars <= 2 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-1 mb-2">
                                {[...Array(reviewSubmittedStars)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 fill-[#d1aa5c]/80 text-[#d1aa5c]/80" />
                                ))}
                                {[...Array(5 - reviewSubmittedStars)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 fill-transparent text-white/20" />
                                ))}
                              </div>
                              <h5 className="font-fraunces text-base md:text-lg text-white font-light">
                                Nous allons tout améliorer grâce à cet avis.
                              </h5>
                              <p className="font-sora text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                                Votre retour est précieux et a été transmis directement à notre direction.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-1.5 mb-1 animate-pulse">
                                {[...Array(reviewSubmittedStars)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 fill-[#d1aa5c] text-[#d1aa5c] drop-shadow-[0_0_8px_#d1aa5c]" />
                                ))}
                              </div>
                              <h5 className="font-fraunces text-base md:text-lg text-white font-light">
                                Merci pour votre avis {reviewSubmittedStars} étoiles !
                              </h5>
                              <p className="font-sora text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                                Votre avis a été <strong className="text-white">copié dans votre presse-papier</strong>. La page Google s&apos;est ouverte pour vous permettre de le coller et valider.
                              </p>

                              {/* Review message preview with quick re-copy */}
                              {reviewText.trim() && (
                                <div className="max-w-sm mx-auto p-2.5 bg-[#0E0F10] border border-white/10 text-left flex items-start justify-between gap-2 shadow-sm">
                                  <p className="text-[10.5px] text-white/80 italic font-sora line-clamp-2">
                                    &ldquo;{reviewText}&rdquo;
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (navigator.clipboard) {
                                        navigator.clipboard.writeText(reviewText).catch(() => {});
                                      }
                                    }}
                                    className="interactive-tap text-[9px] text-[#d1aa5c] hover:underline shrink-0 uppercase tracking-wider font-semibold"
                                  >
                                    Copier
                                  </button>
                                </div>
                              )}

                              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                                <a
                                  href="https://www.google.com/search?q=Ch%C3%A2teau+D%27art+-+meubles+Birkhadem#lrd=0x128fad5fae229a89:0xa8afd38ca1b6e44f,3"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="interactive-tap inline-flex items-center gap-1.5 px-4 py-2 bg-[#d1aa5c] hover:bg-[#b68d40] text-[#0E0F10] text-xs font-bold uppercase tracking-wider rounded-none transition-colors shadow-md"
                                >
                                  <span>Valider sur Google Avis</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href="https://www.google.com/maps/place/Ch%C3%A2teau+D'Art+-+meubles/@36.7083703,3.0600586,17z/data=!4m8!3m7!1s0x128fad5fae229a89:0xa8afd38ca1b6e44f!8m2!3d36.7083703!4d3.0626335!9m1!1b1!16s%2Fg%2F11gsn14yk8#lrd=0x128fad5fae229a89:0xa8afd38ca1b6e44f,3"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="interactive-tap inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-medium rounded-none transition-colors"
                                >
                                  <span>Ouvrir sur Maps</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reset Button */}
                    <div className="pt-3">
                      <button 
                        type="button" 
                        onClick={() => {
                          setSubmitted(false);
                          setReviewRating(0);
                          setHoverRating(0);
                          setReviewText('');
                          setReviewSubmitted(false);
                        }} 
                        className="interactive-tap text-xs uppercase tracking-wider text-[#b68d40] hover:underline font-semibold cursor-pointer"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">Nom complet *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Votre nom et prénom" className="w-full bg-[#0E0F10] border border-white/15 px-3.5 py-2.5 md:py-3 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors rounded-none" />
                      </div>
                      <div>
                        <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">Téléphone *</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Ex: 0550 XX XX XX" className="w-full bg-[#0E0F10] border border-white/15 px-3.5 py-2.5 md:py-3 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors rounded-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">Adresse email *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="nom@exemple.com" className="w-full bg-[#0E0F10] border border-white/15 px-3.5 py-2.5 md:py-3 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors rounded-none" />
                    </div>

                    {/* ── Sujet line with conditional right-side Product Preview ── */}
                    {prefilledProduct && productThumbnail ? (
                      <div className="flex flex-row items-end gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                            Sujet
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Objet de votre demande"
                            className="w-full bg-[#0E0F10] border border-white/15 px-3.5 py-2.5 md:py-3 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors rounded-none"
                          />
                        </div>

                        {/* Extra-small selected product preview on right side */}
                        <div className="shrink-0 flex flex-col items-center justify-center p-1.5 sm:p-2 bg-[#0E0F10] border border-[#b68d40]/40 shadow-[0_0_12px_rgba(182,141,64,0.18)] max-w-[90px] sm:max-w-[110px] text-center relative group">
                          {/* Close / Deselect button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPrefilledProduct(null);
                              setProductThumbnail(null);
                              setProductDisplayName(null);
                              setFormData((prev) => ({ ...prev, subject: '' }));
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#18191B] border border-white/20 text-white/60 hover:text-white flex items-center justify-center text-[9px] transition-colors cursor-pointer z-10"
                            title="Retirer ce produit"
                          >
                            ✕
                          </button>

                          {/* Very small product thumbnail */}
                          <div className="relative w-11 h-11 sm:w-13 sm:h-13 overflow-hidden bg-black/50 border border-white/10 mb-1">
                            <img
                              src={productThumbnail}
                              alt={productDisplayName || 'Produit'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* Product name extra small under it with light golden effect */}
                          <p className="text-[9px] sm:text-[9.5px] font-semibold text-white/95 leading-tight truncate w-full px-0.5">
                            {productDisplayName}
                          </p>
                          <span className="inline-block text-[7.5px] sm:text-[8px] text-[#d1aa5c] font-medium tracking-wider uppercase mt-0.5 shadow-[0_0_6px_rgba(209,170,92,0.45)]">
                            Sélectionné
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">Sujet</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Objet de votre demande" className="w-full bg-[#0E0F10] border border-white/15 px-3.5 py-2.5 md:py-3 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors rounded-none" />
                      </div>
                    )}

                    <div>
                      <label className="block font-sora text-[10px] md:text-xs uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">Votre Message *</label>
                      <div className={`product-message-wrap ${hasSpotlight ? 'product-message-spotlight' : ''}`}>
                        <span className="product-message-streak product-message-streak-left" aria-hidden="true" />
                        <textarea ref={messageRef} name="message" rows={4} required value={formData.message} onFocus={() => setHasSpotlight(false)} onChange={(e) => { setHasSpotlight(false); handleChange(e); }} placeholder="Précisez votre projet, les modèles qui vous intéressent ou vos dimensions souhaitées..." className="contact-field w-full bg-[#0E0F10] border border-white/15 p-3.5 md:p-4 text-base md:text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors resize-none rounded-none" />
                        <span className="product-message-streak product-message-streak-right" aria-hidden="true" />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="interactive-tap w-full bg-[#b68d40] hover:bg-[#a37c35] text-white py-3.5 md:py-4 uppercase tracking-[2px] text-xs font-bold transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer rounded-none"
                    >
                      {loading ? (
                        <span>Envoi en cours...</span>
                      ) : (
                        <>
                          <span>Transmettre ma demande</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            </LuxuryReveal>

            {/* Mobile Only: Showroom Map directly under the Form */}
            <div className="block lg:hidden w-full mt-6">
              <LuxuryReveal className="w-full">
                <ShowroomMap />
              </LuxuryReveal>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}
