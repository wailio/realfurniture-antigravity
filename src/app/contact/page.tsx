'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { Phone, Mail, MapPin, Clock, MessageSquare, Check, ArrowRight, ArrowUpRight, Star, Sparkles, Copy } from 'lucide-react';
import { products } from '@/lib/products';
import { useSiteConfig } from '@/lib/use-site-config';

function ShowroomMap() {
  const siteConfig = useSiteConfig();
  const mapSrc =
    siteConfig.maps_embed_url ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.9859247874274!2d3.07651347583487!3d36.72289927226924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fadd15a1404d7%3A0xe033d167d05c196f!2sM%26F%20Meubles!5e0!3m2!1sfr!2sdz!4v1795266510762!5m2!1sfr!2sdz';

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm bg-neutral-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200/80 text-xs font-sans">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-semibold text-neutral-900 text-[12px]">M&amp;F Meubles — Showroom Kouba</span>
        </div>
        <span className="text-[11px] text-neutral-400">Kouba, Algiers, Algeria, 16311</span>
      </div>
      <div className="relative w-full h-[200px] sm:h-[230px] overflow-hidden">
        <iframe 
          src={mapSrc} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="strict-origin-when-cross-origin" 
          title="M&F Meubles Showroom Kouba" 
          className="w-full h-full" 
        />
        <a 
          href="https://maps.app.goo.gl/PgX4a88fpg7dPQkFA" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-semibold hover:bg-neutral-800 transition-all shadow-sm"
        >
          <span>Itinéraire Google Maps</span>
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

  const [reviewRating, setReviewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [reviewSubmittedStars, setReviewSubmittedStars] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyReviewText = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }).catch(() => {});
    }
  };

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
      if (res.ok) setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    if (reviewRating === 0) return;
    const stars = reviewRating;
    const effectiveStars = stars === 3 ? 4 : stars;
    setReviewSubmittedStars(effectiveStars);
    setReviewSubmitted(true);

    if (stars >= 3) {
      if (reviewText.trim()) copyReviewText(reviewText.trim());
      const googleReviewUrl = 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA';
      try {
        window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
      } catch {}
    }
  };

  const inputClass = "w-full bg-[#F8F9FA] border border-neutral-200/90 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors";
  const labelClass = "block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold";

  return (
    <main id="main-content" className="min-h-screen bg-white font-sans">
      <Header theme="light" />
      
      {/* Page Hero — image fades smoothly into white background */}
      <section className="relative min-h-[58vh] pt-24 pb-10 md:pt-36 md:pb-14 text-center px-4 overflow-hidden bg-white">

        {/* Image layer — clearly visible, long smooth fade to white at bottom */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/contact-hero-new.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            style={{
              opacity: 0.62,
              maskImage: 'linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.5) 72%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.5) 72%, transparent 100%)',
            }}
          />
          {/* Smooth long white fade from bottom only */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" style={{ top: '40%' }} />
        </div>

        {/* Content — exact same fonts & design as our site */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 shadow-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span>Conseil &amp; Accompagnement</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
              Parlons de votre <br className="hidden sm:inline" />
              <span className="font-serif italic font-light text-neutral-600">projet d&apos;intérieur.</span>
            </h1>

            <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Notre équipe est disponible pour vous orienter, préparer un devis sur mesure ou planifier une visite privée de nos collections.
            </p>
          </LuxuryReveal>
        </div>
      </section>


      <section className="w-full pt-0 pb-10 md:pb-16 px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 lg:gap-14 gap-8">
          
          {/* Left Column: Info Cards + Map */}
          <div className="w-full flex flex-col gap-4">
            
            {/* 2x2 Info Cards */}
            <LuxuryReveal className="w-full">
              <div className="grid grid-cols-2 gap-3 w-full">
                <a 
                  href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} 
                  className="group bg-white border border-neutral-200/80 hover:border-neutral-900 hover:shadow-md p-4 sm:p-5 flex flex-col items-center text-center rounded-3xl transition-all duration-200 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center text-neutral-700 mb-3 transition-all">
                    <Phone size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Téléphone</h3>
                  <p className="text-xs text-neutral-600 font-semibold">{siteConfig.phone}</p>
                  <span className="text-[10px] text-neutral-400 mt-1">Appel / WhatsApp</span>
                </a>

                <a 
                  href={`mailto:${siteConfig.email}`} 
                  className="group bg-white border border-neutral-200/80 hover:border-neutral-900 hover:shadow-md p-4 sm:p-5 flex flex-col items-center text-center rounded-3xl transition-all duration-200 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center text-neutral-700 mb-3 transition-all">
                    <Mail size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Email</h3>
                  <p className="text-[11px] text-neutral-600 truncate max-w-[130px]">{siteConfig.email}</p>
                  <span className="text-[10px] text-neutral-400 mt-1">Réponse en 24h</span>
                </a>

                <div className="bg-white border border-neutral-200/80 p-4 sm:p-5 flex flex-col items-center text-center rounded-3xl shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-3">
                    <MapPin size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Livraison</h3>
                  <p className="text-xs text-neutral-600 leading-snug">
                    <strong className="text-neutral-900">58 wilayas</strong> couvertes
                  </p>
                  <span className="text-[10px] text-neutral-400 mt-1">Partout en Algérie</span>
                </div>

                <div className="bg-white border border-neutral-200/80 p-4 sm:p-5 flex flex-col items-center text-center rounded-3xl shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-3">
                    <Clock size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Horaires</h3>
                  <p className="text-xs text-neutral-600 leading-snug">{siteConfig.hours}</p>
                  <span className="text-[10px] text-neutral-400 mt-1">Showroom ouvert</span>
                </div>
              </div>
            </LuxuryReveal>

            {/* WhatsApp Banner */}
            <LuxuryReveal className="w-full">
              <div className="w-full p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/80 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <MessageSquare size={17} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-neutral-900 leading-tight">Besoin d&apos;une réponse rapide ?</h4>
                    <p className="text-xs text-neutral-500">Discutez avec un conseiller en direct.</p>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${siteConfig.whatsapp || siteConfig.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  <span>WhatsApp</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </LuxuryReveal>

            {/* Desktop Map */}
            <div className="hidden lg:block w-full">
              <LuxuryReveal className="w-full">
                <ShowroomMap />
              </LuxuryReveal>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="w-full">
            <LuxuryReveal className="w-full">
              <form 
                ref={formRef} 
                onSubmit={handleSubmit} 
                className="w-full bg-white border border-neutral-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 text-left"
              >
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">Envoyez-nous un message</h3>
                  <p className="text-xs text-neutral-500">Notre équipe vous recontactera dans les plus brefs délais.</p>
                </div>

                {submitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-600">
                      <Check size={26} />
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold text-neutral-900 mb-1">Message envoyé avec succès !</h4>
                      <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                        Merci. Un conseiller M&amp;F Meubles vous contactera très bientôt.
                      </p>
                    </div>

                    {/* Review Section */}
                    <div className="mt-6 pt-6 border-t border-neutral-200/80 w-full max-w-sm mx-auto">
                      {!reviewSubmitted ? (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <p className="text-sm font-semibold text-neutral-900">
                              Laissez-nous un avis sur le service.
                            </p>
                          </div>
                          <p className="text-xs text-neutral-400 mb-4">
                            Votre retour nous aide à perfectionner notre accueil.
                          </p>

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
                                  className="p-1 transition-transform duration-150 hover:scale-125 cursor-pointer focus:outline-none"
                                  aria-label={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
                                >
                                  <Star
                                    className={`w-7 h-7 transition-all duration-150 ${
                                      isGold
                                        ? 'fill-amber-400 text-amber-400 scale-110'
                                        : 'fill-transparent text-neutral-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          <div
                            className={`w-full transition-all duration-400 overflow-hidden ${
                              reviewRating > 0
                                ? 'max-h-96 opacity-100 mt-2'
                                : 'max-h-0 opacity-0 pointer-events-none'
                            }`}
                          >
                            <div className="p-4 bg-[#F8F9FA] border border-neutral-200/80 rounded-2xl text-left mb-2">
                              <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-2 font-semibold">
                                Votre avis :
                              </label>
                              <textarea
                                rows={3}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder={
                                  reviewRating <= 2
                                    ? "Expliquez-nous ce qui n'a pas convenu..."
                                    : "Partagez votre expérience avec M&F Meubles..."
                                }
                                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                              />

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200/60">
                                <span className="text-xs text-neutral-500">
                                  Note : <strong className="text-neutral-900">{reviewRating}/5</strong>
                                </span>

                                <button
                                  type="button"
                                  onClick={handleReviewSubmit}
                                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>Envoyer mon avis</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 px-2 text-center flex flex-col items-center">
                          {reviewSubmittedStars <= 2 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-1 mb-2">
                                {[...Array(reviewSubmittedStars)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <h5 className="text-base font-bold text-neutral-900">Merci pour votre retour.</h5>
                              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                                Nous allons tout faire pour améliorer votre expérience.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                {[...Array(reviewSubmittedStars)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <h5 className="text-base font-bold text-neutral-900">
                                Merci pour votre avis {reviewSubmittedStars} étoiles !
                              </h5>
                              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                                La page Google s&apos;est ouverte. Deux étapes simples :
                              </p>

                              <div className="max-w-sm mx-auto p-4 bg-[#F8F9FA] border border-neutral-200/80 rounded-2xl text-left space-y-2.5">
                                <div className="flex items-start gap-2.5">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                  <p className="text-xs text-neutral-700">Sélectionnez les <strong>{reviewSubmittedStars} étoiles</strong> sur Google.</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                  <p className="text-xs text-neutral-700">Collez votre message (<strong>Ctrl+V</strong>).</p>
                                </div>

                                {reviewText.trim() && (
                                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-2">
                                    <p className="text-[10px] text-neutral-500 italic line-clamp-2 flex-1">
                                      &ldquo;{reviewText}&rdquo;
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => copyReviewText(reviewText)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-700 transition-all shrink-0 cursor-pointer"
                                    >
                                      {isCopied ? (
                                        <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copié !</span></>
                                      ) : (
                                        <><Copy className="w-3 h-3" /><span>Copier</span></>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                                <a
                                  href="https://maps.app.goo.gl/PgX4a88fpg7dPQkFA"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-all shadow-sm"
                                >
                                  <span>Valider sur Google Avis</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3">
                      <button 
                        type="button" 
                        onClick={() => { setSubmitted(false); setReviewRating(0); setHoverRating(0); setReviewText(''); setReviewSubmitted(false); }} 
                        className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer transition-colors"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className={labelClass}>Nom complet *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Votre nom et prénom" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Téléphone *</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Ex: 0550 XX XX XX" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Adresse email *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="nom@exemple.com" className={inputClass} />
                    </div>

                    {prefilledProduct && productThumbnail ? (
                      <div className="flex flex-row items-end gap-3">
                        <div className="flex-1 min-w-0">
                          <label className={labelClass}>Sujet</label>
                          <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Objet de votre demande" className={inputClass} />
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center p-2.5 bg-neutral-100 border border-neutral-200/80 rounded-2xl max-w-[90px] text-center relative group shadow-sm">
                          <button
                            type="button"
                            onClick={() => { setPrefilledProduct(null); setProductThumbnail(null); setProductDisplayName(null); setFormData((prev) => ({ ...prev, subject: '' })); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer z-10"
                          >
                            ✕
                          </button>
                          <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white border border-neutral-200 mb-1.5">
                            <img src={productThumbnail} alt={productDisplayName || 'Produit'} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[9.5px] font-semibold text-neutral-900 leading-tight truncate w-full">{productDisplayName}</p>
                          <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">Sélectionné</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={labelClass}>Sujet</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Objet de votre demande" className={inputClass} />
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Votre Message *</label>
                      <textarea
                        ref={messageRef}
                        name="message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Précisez votre projet, les modèles qui vous intéressent ou vos dimensions souhaitées..."
                        className="w-full bg-[#F8F9FA] border border-neutral-200/90 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 rounded-full text-sm font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <span>Envoi en cours...</span>
                      ) : (
                        <>
                          <span>Transmettre ma demande</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                      En transmettant ce formulaire, vous consentez à être contacté par nos conseillers. Données confidentielles &amp; sécurisées.
                    </p>
                  </>
                )}
              </form>
            </LuxuryReveal>

            {/* Mobile Map */}
            <div className="block lg:hidden w-full mt-6">
              <LuxuryReveal className="w-full">
                <ShowroomMap />
              </LuxuryReveal>
            </div>
          </div>

        </div>
      </section>

      <div className="h-16 md:h-24" />
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
