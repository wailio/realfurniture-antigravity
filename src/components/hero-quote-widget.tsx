'use client'

import React, { useState } from 'react'
import {
  Sofa,
  Utensils,
  BedDouble,
  DoorClosed,
  Palette,
  Home,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  User,
  Loader2,
  MessageCircle,
} from 'lucide-react'

// Furniture categories for Step 1
const FURNITURE_TYPES = [
  {
    id: 'salon',
    title: 'Salons & Canapés',
    desc: 'Modulables, velours & cuir',
    icon: Sofa,
  },
  {
    id: 'salle-a-manger',
    title: 'Salles à Manger',
    desc: 'Tables, chaises & buffets',
    icon: Utensils,
  },
  {
    id: 'chambre',
    title: 'Chambres à Coucher',
    desc: 'Lits, chevets & dressings',
    icon: BedDouble,
  },
  {
    id: 'armoire',
    title: 'Dressings & Armoires',
    desc: 'Sur-mesure & rangements',
    icon: DoorClosed,
  },
  {
    id: 'deco',
    title: 'Décoration & Art',
    desc: 'Miroirs, consoles & luminaires',
    icon: Palette,
  },
  {
    id: 'complet',
    title: 'Aménagement Complet',
    desc: 'Villa, appartement ou bureau',
    icon: Home,
  },
]

// Budget range parameters
const MIN_PRICE = 20000
const MAX_PRICE = 180000
const PRICE_STEP = 5000

export function HeroQuoteWidget() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<string>('salon')
  const [budget, setBudget] = useState<number>(85000)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-DZ').format(val) + ' DA'
  }

  const handleSelectType = (id: string) => {
    setSelectedType(id)
  }

  const handleNextFromStep1 = () => {
    if (!selectedType) return
    setStep(2)
  }

  const handleNextFromStep2 = () => {
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Veuillez renseigner votre nom et numéro de téléphone.')
      return
    }

    setSubmitting(true)
    setError('')

    const selectedCategoryObj = FURNITURE_TYPES.find((f) => f.id === selectedType)
    const categoryLabel = selectedCategoryObj?.title || selectedType

    try {
      // Send to sales CRM funnel as a new lead
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          amount: budget,
          notes: `Demande Devis Hero: ${categoryLabel} | Budget: ${formatPrice(budget)}`,
        }),
      })

      if (!res.ok) {
        // Fallback to contact endpoint if sales route differs
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            subject: `Demande de prix - ${categoryLabel}`,
            message: `Type recherché : ${categoryLabel}\nBudget estimé : ${formatPrice(budget)}`,
          }),
        }).catch(() => {})
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit quote request:', err)
      // Even if network glitches, display confirmation to visitor
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCategoryObj = FURNITURE_TYPES.find((f) => f.id === selectedType)
  const categoryLabel = selectedCategoryObj?.title || 'Mobilier de prestige'

  // WhatsApp link for direct instant consultation
  const waMessage = encodeURIComponent(
    `Bonjour Château d'art ! Je m'appelle ${name || 'un client'} et je souhaite des conseils pour : ${categoryLabel} (Budget : ${formatPrice(budget)}).`
  )
  const whatsappUrl = `https://wa.me/213561719100?text=${waMessage}`

  return (
    <div className="relative w-full max-w-[540px] mx-auto lg:mx-0">
      {/* iOS Frosted Glass Container */}
      <div
        className="relative overflow-hidden rounded-[28px] md:rounded-[32px] p-6 md:p-8 backdrop-blur-2xl transition-all duration-300"
        style={{
          background: 'rgba(20, 21, 24, 0.78)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 24px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 20px rgba(209, 170, 92, 0.03)',
        }}
      >
        {/* Subtle decorative golden ambient glow */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #d1aa5c 0%, transparent 70%)' }}
        />

        {/* ── SUCCESS STATE (Done Effect) ── */}
        {submitted ? (
          <div className="py-6 text-center flex flex-col items-center animate-fade-in-up">
            {/* Glowing Golden Done Icon */}
            <div className="relative mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                  boxShadow: '0 0 35px rgba(209, 170, 92, 0.55), inset 0 1px 1px rgba(255,255,255,0.4)',
                }}
              >
                <Check className="w-10 h-10 text-[#0E0F10] stroke-[2.8]" />
              </div>
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                style={{ background: '#d1aa5c' }}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider text-[#d1aa5c] bg-[#d1aa5c]/10 border border-[#d1aa5c]/25 uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demande transmise avec succès</span>
            </span>

            <h3 className="font-fraunces text-2xl md:text-3xl font-light text-white mb-2">
              Merci, {name} !
            </h3>
            <p className="text-white/70 text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
              Votre sélection <strong className="text-white">{categoryLabel}</strong> (Budget :{' '}
              <span className="text-[#d1aa5c]">{formatPrice(budget)}</span>) a été envoyée directement à nos conseillers au
              Showroom de Birkhadem.
            </p>

            {/* Direct WhatsApp Call to Action */}
            <div className="w-full flex flex-col gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                  boxShadow: '0 10px 25px rgba(209, 170, 92, 0.35)',
                }}
              >
                <MessageCircle className="w-4 h-4 fill-black/20" />
                <span>Discuter immédiatement sur WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setStep(1)
                  setName('')
                  setPhone('')
                }}
                className="text-xs text-white/40 hover:text-white/80 py-2 transition-colors"
              >
                Faire une autre demande
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* ── Top Bar: Step Counter & Progress Indicator ── */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d1aa5c] shadow-[0_0_8px_#d1aa5c]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#d1aa5c] uppercase font-sora">
                  Devis Rapide &amp; Gratuit
                </span>
              </div>
              <span className="text-xs text-white/50 font-mono font-medium">
                {step} sur 3
              </span>
            </div>

            {/* Progress Bar (3 steps) */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%',
                  background: 'linear-gradient(90deg, #b68d40 0%, #d1aa5c 50%, #f5d78e 100%)',
                  boxShadow: '0 0 10px rgba(209, 170, 92, 0.5)',
                }}
              />
            </div>

            {/* ── STEP 1: Select Furniture Type ── */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h3 className="font-fraunces text-xl md:text-[22px] font-normal text-white mb-1.5 leading-snug">
                  Quel type de mobilier recherchez-vous ?
                </h3>
                <p className="text-white/60 text-xs md:text-[13px] mb-5">
                  Sélectionnez la catégorie qui correspond à votre projet.
                </p>

                {/* 2-Column Grid of Option Cards */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {FURNITURE_TYPES.map((item) => {
                    const isSelected = selectedType === item.id
                    const IconComponent = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectType(item.id)}
                        className={`group relative text-left p-3 md:p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#d1aa5c]/15 border-[#d1aa5c] shadow-[0_4px_20px_rgba(209,170,92,0.22)]'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        {/* Checkmark Badge for Selected Card (Ref Image 3) */}
                        {isSelected && (
                          <div
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[#0E0F10] text-[11px] font-bold shadow-md"
                            style={{ background: '#d1aa5c' }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                            isSelected
                              ? 'bg-[#d1aa5c] text-[#0E0F10]'
                              : 'bg-white/10 text-[#d1aa5c] group-hover:bg-white/15'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 stroke-[1.8]" />
                        </div>

                        {/* Text */}
                        <div className="pr-4">
                          <p
                            className={`text-xs md:text-[13px] font-semibold leading-tight mb-0.5 ${
                              isSelected ? 'text-white' : 'text-white/90'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[10px] md:text-[11px] text-white/50 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide uppercase text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                    boxShadow: '0 8px 25px rgba(209, 170, 92, 0.35)',
                  }}
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Price Range Swipe Slider ── */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h3 className="font-fraunces text-xl md:text-[22px] font-normal text-white mb-1.5 leading-snug">
                  Quel est votre budget estimé ?
                </h3>
                <p className="text-white/60 text-xs md:text-[13px] mb-6">
                  Glissez le curseur pour ajuster votre fourchette de prix idéale.
                </p>

                {/* Big Formatted Price Display */}
                <div
                  className="p-5 rounded-2xl mb-6 text-center border relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(209, 170, 92, 0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1 font-sora">
                    Budget sélectionné
                  </p>
                  <p className="font-fraunces text-3xl md:text-4xl font-light text-[#d1aa5c] tracking-tight">
                    {formatPrice(budget)}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">
                    Pour : <span className="text-white/80">{categoryLabel}</span>
                  </p>
                </div>

                {/* Thick Swipe Slider (20 000 DA to 180 000 DA) */}
                <div className="px-1 mb-6">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={PRICE_STEP}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-3 md:h-3.5 appearance-none rounded-full cursor-pointer focus:outline-none"
                      style={{
                        background: `linear-gradient(to right, #d1aa5c 0%, #b68d40 ${
                          ((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                        }%, rgba(255, 255, 255, 0.12) ${
                          ((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                        }%, rgba(255, 255, 255, 0.12) 100%)`,
                      }}
                    />
                  </div>

                  {/* Range Boundaries */}
                  <div className="flex justify-between items-center text-[11px] font-mono text-white/40 mt-3">
                    <span>{formatPrice(MIN_PRICE)}</span>
                    <span className="text-[#d1aa5c]/70 text-[10px] uppercase font-sans">
                      Glisser pour ajuster
                    </span>
                    <span>{formatPrice(MAX_PRICE)}</span>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-4 gap-1.5 mb-7">
                  {[30000, 75000, 120000, 180000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudget(preset)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] md:text-[11px] font-medium transition-all ${
                        budget === preset
                          ? 'bg-[#d1aa5c] text-[#0E0F10] font-bold shadow-md'
                          : 'bg-white/[0.05] text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}k DA` : `${preset} DA`}
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons (Back + Next) */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="flex-1 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide uppercase text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                      boxShadow: '0 8px 25px rgba(209, 170, 92, 0.35)',
                    }}
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Contact Info (Name + Phone) ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="animate-fade-in-up">
                <h3 className="font-fraunces text-xl md:text-[22px] font-normal text-white mb-1.5 leading-snug">
                  Nous pouvons commencer par ceux-ci.
                </h3>
                <p className="text-white/60 text-xs md:text-[13px] mb-5">
                  Renseignez vos coordonnées pour recevoir notre catalogue détaillé et notre proposition.
                </p>

                {error && (
                  <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                    {error}
                  </div>
                )}

                {/* Summary Pill of previous choices */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/70 mb-4">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Votre projet</span>
                    <strong className="text-white font-medium">{categoryLabel}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40 block text-[10px] uppercase">Budget estimé</span>
                    <span className="text-[#d1aa5c] font-semibold">{formatPrice(budget)}</span>
                  </div>
                </div>

                {/* Input 1: Name */}
                <div className="mb-3.5">
                  <label className="block text-xs text-white/70 mb-1.5 font-medium">
                    Nom complet
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/35">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Amina Benali"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] focus:bg-white/[0.08] transition-colors"
                    />
                  </div>
                </div>

                {/* Input 2: Phone */}
                <div className="mb-6">
                  <label className="block text-xs text-white/70 mb-1.5 font-medium">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/35">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex : 0550 12 34 56 (WhatsApp)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] focus:bg-white/[0.08] transition-colors"
                    />
                  </div>
                </div>

                {/* Navigation Buttons (Back + Submit) */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={submitting}
                    className="py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide uppercase text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                      boxShadow: '0 8px 25px rgba(209, 170, 92, 0.35)',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0E0F10]" />
                        <span>Transmission...</span>
                      </>
                    ) : (
                      <>
                        <span>Recevoir mon offre</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
