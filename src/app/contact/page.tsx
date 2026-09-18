'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LuxuryReveal } from '@/components/luxury-reveal';
import { Phone, Mail, MapPin, Clock, MessageSquare, Check, ArrowRight, ArrowUpRight } from 'lucide-react';

function ContactContent() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  
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
  const [hasSpotlight, setHasSpotlight] = useState(false);

  useEffect(() => {
    const product = searchParams.get('product');
    const subject = searchParams.get('subject');
    const message = searchParams.get('message');

    if (product || subject || message) {
      if (product) {
        setPrefilledProduct(product);
      }
      setFormData((prev) => ({
        ...prev,
        subject: subject || (product ? `Commande: ${product}` : prev.subject),
        message: message || (product ? `Bonjour, je souhaite commander ce produit : ${product}. Merci de me recontacter pour les dÃ©tails et la livraison.` : prev.message),
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
        body: JSON.stringify(formData),
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

  return (
    <main className="min-h-screen bg-[#0E0F10]">
      <Header theme="dark" />
      
      {/* â”€â”€ Page Hero with Luxury Fading Backdrop Image â”€â”€ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-4 overflow-hidden bg-[#0E0F10]">
        {/* Full-width Background Image with Progressive Bottom Fade */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/contact-hero.jpg"
            alt="ChÃ¢teau d'art"
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
              Notre Ã©quipe est Ã  votre disposition pour vous orienter, prÃ©parer un devis personnalisÃ© ou planifier une visite privÃ©e de nos collections.
            </p>
          </LuxuryReveal>
        </div>
      </section>

      <section className="w-full py-8 md:py-24 px-4 md:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-2xl md:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start gap-6">
          
          {/* Contact Form â€” FIRST on mobile */}
          <div className="order-1 lg:order-2">
            <LuxuryReveal variant="right" delay={200}>
              <form ref={formRef} onSubmit={handleSubmit} className="bg-[#121316] border border-white/10 p-6 md:p-10 rounded-sm shadow-xl space-y-5">
                <div>
                  <h3 className="font-fraunces text-xl md:text-2xl text-white font-light mb-1">Envoyez-nous un Message</h3>
                  <p className="font-sora text-xs text-[#A1A1AA]">Remplissez ce formulaire et notre Ã©quipe vous recontactera dans les plus brefs dÃ©lais.</p>
                </div>
                {prefilledProduct && (
                  <div className="p-3 bg-[#b68d40]/15 border border-[#b68d40]/30 rounded-sm text-xs text-white flex items-center justify-between">
                    <span>Demande liÃ©e Ã  : <strong>{prefilledProduct}</strong></span>
                    <button type="button" onClick={() => setPrefilledProduct(null)} className="text-[#b68d40] hover:text-white font-bold ml-2">âœ•</button>
                  </div>
                )}
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#b68d40]/20 border border-[#b68d40] mx-auto flex items-center justify-center text-[#b68d40]"><Check size={24} /></div>
                    <h4 className="font-fraunces text-xl text-white">Message ReÃ§u avec SuccÃ¨s</h4>
                    <p className="font-sora text-xs text-[#A1A1AA] max-w-md mx-auto">Merci. Un conseiller ChÃ¢teau d&apos;art vous contactera trÃ¨s bientÃ´t.</p>
                    <button type="button" onClick={() => setSubmitted(false)} className="text-xs uppercase tracking-wider text-[#b68d40] hover:underline pt-2 inline-block font-semibold">Envoyer un autre message</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sora text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">Nom complet *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Votre nom et prÃ©nom" className="w-full bg-[#0E0F10] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors" />
                      </div>
                      <div>
                        <label className="block font-sora text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">TÃ©lÃ©phone *</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Ex: 0550 XX XX XX" className="w-full bg-[#0E0F10] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-sora text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">Adresse email *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="nom@exemple.com" className="w-full bg-[#0E0F10] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors" />
                    </div>
                    <div>
                      <label className="block font-sora text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">Sujet</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Objet de votre demande" className="w-full bg-[#0E0F10] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors" />
                    </div>
                    <div>
                      <label className="block font-sora text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">Votre Message *</label>
                      <div className={`product-message-wrap ${hasSpotlight ? 'product-message-spotlight' : ''}`}>
                        <span className="product-message-streak product-message-streak-left" aria-hidden="true" />
                        <textarea ref={messageRef} name="message" rows={5} required value={formData.message} onFocus={() => setHasSpotlight(false)} onChange={(e) => { setHasSpotlight(false); handleChange(e); }} placeholder="PrÃ©cisez votre projet, les modÃ¨les qui vous intÃ©ressent ou vos dimensions souhaitÃ©es..." className="contact-field w-full bg-[#0E0F10] border border-white/15 p-4 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#b68d40] transition-colors resize-none" />
                        <span className="product-message-streak product-message-streak-right" aria-hidden="true" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#b68d40] hover:bg-[#a37c35] text-white py-4 uppercase tracking-[2px] text-xs font-bold transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <span>Envoi en cours...</span> : <><span>Transmettre ma demande</span><ArrowRight size={14} /></>}
                    </button>
                  </>
                )}
              </form>
            </LuxuryReveal>
          </div>

          {/* Info cards + Map â€” SECOND on mobile */}
          <div className="order-2 lg:order-1 space-y-4">
            <LuxuryReveal variant="left">
              {/* 2x2 compact info cards */}
              <div className="grid grid-cols-2 gap-3">
                <a href="tel:0561719100" className="group bg-[#121316] border border-white/10 hover:border-[#b68d40]/50 p-3 md:p-6 flex flex-col items-start rounded-sm transition-all duration-300">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-4 group-hover:bg-[#b68d40] group-hover:text-white transition-colors"><Phone size={13} /></div>
                  <h3 className="font-fraunces text-xs md:text-lg text-white mb-0.5 leading-tight">TÃ©lÃ©phone</h3>
                  <p className="font-sora text-[10px] md:text-sm text-[#b68d40] font-bold">0561 71 91 00</p>
                  <span className="text-[9px] md:text-[11px] text-[#71717A] mt-1">Appel / WhatsApp</span>
                </a>
                <a href="mailto:chateau.art01@gmail.com" className="group bg-[#121316] border border-white/10 hover:border-[#b68d40]/50 p-3 md:p-6 flex flex-col items-start rounded-sm transition-all duration-300">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-4 group-hover:bg-[#b68d40] group-hover:text-white transition-colors"><Mail size={13} /></div>
                  <h3 className="font-fraunces text-xs md:text-lg text-white mb-0.5 leading-tight">Email</h3>
                  <p className="font-sora text-[9px] md:text-sm text-white font-medium break-all">chateau.art01@gmail.com</p>
                  <span className="text-[9px] md:text-[11px] text-[#71717A] mt-1">RÃ©ponse 24h</span>
                </a>
                <div className="bg-[#121316] border border-white/10 p-3 md:p-6 flex flex-col items-start rounded-sm">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-4"><MapPin size={13} /></div>
                  <h3 className="font-fraunces text-xs md:text-lg text-white mb-0.5 leading-tight">Livraison</h3>
                  <p className="font-sora text-[9px] md:text-xs text-[#A1A1AA]"><strong className="text-white">58 wilayas</strong> d&apos;AlgÃ©rie</p>
                </div>
                <div className="bg-[#121316] border border-white/10 p-3 md:p-6 flex flex-col items-start rounded-sm">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#b68d40] mb-2 md:mb-4"><Clock size={13} /></div>
                  <h3 className="font-fraunces text-xs md:text-lg text-white mb-0.5 leading-tight">Horaires</h3>
                  <p className="font-sora text-[9px] md:text-xs text-[#A1A1AA]">6/7j â€” <span className="text-white font-semibold">9h30â€“20h</span></p>
                </div>
              </div>
            </LuxuryReveal>

            {/* WhatsApp */}
            <LuxuryReveal variant="left" delay={150}>
              <div className="p-4 md:p-6 rounded-sm bg-[#121316] border border-[#b68d40]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] flex-shrink-0"><MessageSquare size={14} /></div>
                  <div>
                    <h4 className="font-sora text-xs font-bold text-white">RÃ©ponse rapide ?</h4>
                    <p className="text-[10px] text-[#A1A1AA]">Discutez avec un conseiller.</p>
                  </div>
                </div>
                <a href="https://wa.me/213561719100" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold rounded-sm uppercase tracking-wider flex items-center gap-1 flex-shrink-0 transition-colors">
                  <span>WhatsApp</span><ArrowRight size={11} />
                </a>
              </div>
            </LuxuryReveal>

            {/* Map */}
            <LuxuryReveal variant="left" delay={200}>
              <div className="relative rounded-sm overflow-hidden border border-white/10 hover:border-[#b68d40]/50 transition-all duration-500 shadow-2xl bg-[#121316]">
                <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-[#18191B] border-b border-white/10 text-xs font-sora">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#b68d40]" /><span className="font-semibold text-white text-[11px]">ChÃ¢teau D&apos;Art - Showroom</span></div>
                  <span className="text-[10px] text-[#A1A1AA]">Alger</span>
                </div>
                <div className="relative w-full h-[180px] md:h-[250px] overflow-hidden">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5906046037494!2d3.060058575713971!3d36.70837457287061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fad5fae229a89%3A0xa8afd38ca1b6e44f!2sCh%C3%A2teau%20D'Art%20-%20meubles!5e0!3m2!1sfr!2sdz!4v1789588881010!5m2!1sfr!2sdz" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" title="ChÃ¢teau D'Art" className="w-full h-full grayscale contrast-[1.15] brightness-[0.8] hover:grayscale-0 transition-all duration-700" />
                  <a href="https://maps.google.com/?q=Ch%C3%A2teau+D'Art+-+meubles" target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#b68d40] text-white text-xs font-semibold hover:bg-[#a37c35] transition-all shadow-lg">
                    <span>ItinÃ©raire</span><ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </LuxuryReveal>
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
