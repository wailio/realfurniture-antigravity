'use client'

import React, { useState } from 'react'
import {
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
    iconImage: '/quote-icons/salon.png',
  },
  {
    id: 'salle-a-manger',
    title: 'Salles à Manger',
    iconImage: '/quote-icons/salle-a-manger.png',
  },
  {
    id: 'chambre',
    title: 'Chambres à Coucher',
    iconImage: '/quote-icons/chambre.png',
  },
  {
    id: 'armoire',
    title: 'Dressings & Armoires',
    iconImage: '/quote-icons/armoire.png',
  },
  {
    id: 'deco',
    title: 'Décoration & Art',
    iconImage: '/quote-icons/deco.png',
  },
  {
    id: 'complet',
    title: 'Aménagement Complet',
    iconImage: '/quote-icons/complet.png',
  },
]

// Budget range parameters
const MIN_PRICE = 20000
const MAX_PRICE = 180000
const PRICE_STEP = 5000

export function HeroQuoteWidget() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [budget, setBudget] = useState<number>(85000)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const sliderTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-DZ').format(val) + ' DA'
  }

  const handleSelectType = (id: string) => {
    setSelectedType(id)
    setStep(2)
  }

  const handleSliderRelease = () => {
    if (sliderTimerRef.current) clearTimeout(sliderTimerRef.current)
    sliderTimerRef.current = setTimeout(() => {
      setStep(3)
    }, 70)
  }

  const handlePresetSelect = (presetVal: number) => {
    setBudget(presetVal)
    if (sliderTimerRef.current) clearTimeout(sliderTimerRef.current)
    sliderTimerRef.current = setTimeout(() => {
      setStep(3)
    }, 60)
  }

  const handleNextFromStep2 = () => {
    if (sliderTimerRef.current) clearTimeout(sliderTimerRef.current)
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
      // 1. Post to dedicated Cold Leads API
      const coldLeadPromise = fetch('/api/admin/cold-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          furniture_type: selectedType,
          furniture_title: categoryLabel,
          budget: budget,
          formatted_budget: formatPrice(budget),
        }),
      }).catch(() => {})

      // 2. Post to sales CRM funnel as well
      const salesPromise = fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          amount: budget,
          notes: `[Cold Lead Widget] ${categoryLabel} | Budget: ${formatPrice(budget)}`,
        }),
      }).catch(() => {})

      await Promise.allSettled([coldLeadPromise, salesPromise])
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit quote request:', err)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCategoryObj = selectedType ? FURNITURE_TYPES.find((f) => f.id === selectedType) : null
  const categoryLabel = selectedCategoryObj?.title || 'Mobilier de prestige'

  // WhatsApp link for direct instant consultation
  const waMessage = encodeURIComponent(
    `Bonjour Château d'art ! Je m'appelle ${name || 'un client'} et je souhaite des conseils pour : ${categoryLabel} (Budget : ${formatPrice(budget)}).`
  )
  const whatsappUrl = `https://wa.me/213561719100?text=${waMessage}`

  return (
    <div className="relative w-full max-w-[320px] md:max-w-[480px] lg:max-w-[430px] xl:max-w-[460px] mx-auto lg:mx-0">
      {/* iOS Frosted Glass Container (compact on PC, smaller on mobile) */}
      <div
        className="relative overflow-hidden rounded-[20px] md:rounded-[32px] p-4 md:p-8 lg:p-5 xl:p-6 backdrop-blur-2xl transition-all duration-300"
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
          <div className="py-5 lg:py-4 text-center flex flex-col items-center animate-fade-in-up">
            {/* Glowing Golden Done Icon */}
            <div className="relative mb-4 lg:mb-3">
              <div
                className="w-16 h-16 lg:w-14 lg:h-14 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                  boxShadow: '0 0 30px rgba(209, 170, 92, 0.55), inset 0 1px 1px rgba(255,255,255,0.4)',
                }}
              >
                <Check className="w-8 h-8 lg:w-7 lg:h-7 text-[#0E0F10] stroke-[2.8]" />
              </div>
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                style={{ background: '#d1aa5c' }}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] lg:text-[10px] font-semibold tracking-wider text-[#d1aa5c] bg-[#d1aa5c]/10 border border-[#d1aa5c]/25 uppercase mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Demande transmise avec succès</span>
            </span>

            <h3 className="font-fraunces text-2xl lg:text-xl font-light text-white mb-1.5">
              Merci, {name} !
            </h3>
            <p className="text-white/70 text-xs lg:text-[12px] max-w-sm mb-5 lg:mb-4 leading-relaxed">
              Votre sélection <strong className="text-white">{categoryLabel}</strong> (Budget :{' '}
              <span className="text-[#d1aa5c]">{formatPrice(budget)}</span>) a été envoyée directement à nos conseillers au
              Showroom de Birkhadem.
            </p>

            {/* Direct WhatsApp Call to Action */}
            <div className="w-full flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 lg:py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs lg:text-[12.5px] font-semibold text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                  boxShadow: '0 8px 20px rgba(209, 170, 92, 0.35)',
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
                  setSelectedType(null)
                }}
                className="text-[11px] text-white/40 hover:text-white/80 py-1.5 transition-colors cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                Faire une autre demande
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* ── Top Bar: Step Counter & Progress Indicator ── */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d1aa5c] shadow-[0_0_8px_#d1aa5c]" />
                <span className="text-[11px] lg:text-[10px] font-semibold tracking-wider text-[#d1aa5c] uppercase font-sora">
                  Devis Rapide &amp; Gratuit
                </span>
              </div>
              <span className="text-xs lg:text-[11px] text-white/50 font-mono font-medium">
                {step} sur 3
              </span>
            </div>

            {/* Progress Bar (3 steps) */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 lg:mb-3.5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%',
                  background: 'linear-gradient(90deg, #b68d40 0%, #d1aa5c 50%, #f5d78e 100%)',
                  boxShadow: '0 0 10px rgba(209, 170, 92, 0.5)',
                }}
              />
            </div>

            {/* ── Sliding Track (Smooth iOS style step slide) ── */}
            <div className="w-full overflow-hidden">
              <div
                className="flex w-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateX(-${(step - 1) * 100}%)`,
                }}
              >
                {/* ── STEP 1: Select Furniture Type ── */}
                <div className="w-full shrink-0">
                  <h3 className="font-fraunces text-base md:text-[22px] lg:text-[18px] xl:text-[19px] font-normal text-white mb-1 leading-snug">
                    Quel type de mobilier recherchez-vous ?
                  </h3>
                  <p className="text-white/60 text-[10px] md:text-[13px] lg:text-[11px] mb-3 lg:mb-3">
                    Sélectionnez la catégorie qui correspond à votre projet.
                  </p>

                  {/* 2-Column Grid of Option Cards (Direct 1-click choices, no selected state shown) */}
                  <div className="grid grid-cols-2 gap-2.5 lg:gap-2">
                    {FURNITURE_TYPES.map((item) => {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectType(item.id)}
                          className="group relative flex flex-col items-center justify-between text-center p-2 lg:p-2 xl:p-2.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#d1aa5c]/45 active:scale-[0.97] transition-all duration-150 cursor-pointer overflow-hidden min-h-[76px] md:min-h-[92px] lg:min-h-[86px] xl:min-h-[90px]"
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Big 3D Gold Category Icon */}
                          <div className="w-full flex-1 flex items-center justify-center py-1">
                            <img
                              src={item.iconImage}
                              alt={item.title}
                              className="w-auto h-11 sm:h-12 md:h-13 lg:h-10 xl:h-11 object-contain transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>

                          {/* Extra Small Text under Icon */}
                          <div className="w-full pb-0.5">
                            <p className="text-[10.5px] sm:text-[11px] lg:text-[9.5px] xl:text-[10px] font-semibold text-white/90 group-hover:text-white leading-tight tracking-tight transition-colors">
                              {item.title}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── STEP 2: Price Range Swipe Slider ── */}
                <div className="w-full shrink-0">
                  <h3 className="font-fraunces text-xl md:text-[22px] lg:text-[18px] xl:text-[19px] font-normal text-white mb-1 leading-snug">
                    Quel est votre budget estimé ?
                  </h3>
                  <p className="text-white/60 text-xs md:text-[13px] lg:text-[11px] mb-4 lg:mb-3">
                    Glissez le curseur pour ajuster votre fourchette de prix idéale.
                  </p>

                  {/* Big Formatted Price Display */}
                  <div
                    className="p-4 lg:p-3 rounded-2xl mb-4 lg:mb-3 text-center border relative overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'rgba(209, 170, 92, 0.25)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5 font-sora">
                      Budget sélectionné
                    </p>
                    <p className="font-fraunces text-2xl md:text-3xl lg:text-[25px] xl:text-[27px] font-light text-[#d1aa5c] tracking-tight">
                      {formatPrice(budget)}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Pour : <span className="text-white/80">{categoryLabel}</span>
                    </p>
                  </div>

                  {/* Thick Swipe Slider (20 000 DA to 180 000 DA) */}
                  <div className="px-1 mb-4 lg:mb-3">
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={PRICE_STEP}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        onPointerUp={handleSliderRelease}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        onKeyUp={handleSliderRelease}
                        className="w-full h-3 lg:h-2.5 appearance-none rounded-full cursor-pointer focus:outline-none"
                        style={{
                          cursor: 'pointer',
                          background: `linear-gradient(to right, #d1aa5c 0%, #b68d40 ${
                            ((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                          }%, rgba(255, 255, 255, 0.12) ${
                            ((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                          }%, rgba(255, 255, 255, 0.12) 100%)`,
                        }}
                      />
                    </div>

                    {/* Range Boundaries & Auto-advance notice */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mt-2">
                      <span>{formatPrice(MIN_PRICE)}</span>
                      <span className="text-[#d1aa5c]/90 text-[9.5px] uppercase font-sans font-semibold tracking-wider flex items-center gap-1">
                        <span>Glissez &amp; relâchez pour valider</span>
                      </span>
                      <span>{formatPrice(MAX_PRICE)}</span>
                    </div>
                  </div>

                  {/* Quick Preset DA Chips */}
                  <div className="grid grid-cols-5 gap-1.5 mb-5 lg:mb-3.5">
                    {[20000, 50000, 85000, 120000, 180000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`py-1.5 lg:py-1 px-1.5 rounded-xl text-[10px] font-medium transition-all active:scale-95 cursor-pointer ${
                          budget === preset
                            ? 'bg-[#d1aa5c] text-[#0E0F10] font-bold shadow-md'
                            : 'bg-white/[0.05] text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {preset >= 1000 ? `${preset / 1000}k DA` : `${preset} DA`}
                      </button>
                    ))}
                  </div>

                  {/* Navigation Buttons (Back + Next) */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2.5 lg:py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 text-xs lg:text-[11px] text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Retour</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="flex-1 py-3 lg:py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 text-xs lg:text-[12px] font-bold tracking-wide uppercase text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                        boxShadow: '0 6px 20px rgba(209, 170, 92, 0.35)',
                      }}
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── STEP 3: Contact Info (Name + Phone) ── */}
                <div className="w-full shrink-0">
                  <form onSubmit={handleSubmit}>
                    <h3 className="font-fraunces text-xl md:text-[22px] lg:text-[18px] xl:text-[19px] font-normal text-white mb-1 leading-snug">
                      Nous pouvons commencer par ceux-ci.
                    </h3>
                    <p className="text-white/60 text-xs md:text-[13px] lg:text-[11px] mb-4 lg:mb-3">
                      Renseignez vos coordonnées pour recevoir notre sélection et notre offre.
                    </p>

                    {error && (
                      <div className="mb-3 p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                        {error}
                      </div>
                    )}

                    {/* Summary Pill of previous choices */}
                    <div className="flex items-center justify-between p-2.5 lg:p-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/70 mb-3 lg:mb-2.5">
                      <div>
                        <span className="text-white/40 block text-[9.5px] uppercase">Votre projet</span>
                        <strong className="text-white font-medium text-[11px] lg:text-[10.5px]">{categoryLabel}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-white/40 block text-[9.5px] uppercase">Budget estimé</span>
                        <span className="text-[#d1aa5c] font-semibold text-[11px] lg:text-[10.5px]">{formatPrice(budget)}</span>
                      </div>
                    </div>

                    {/* Input 1: Name */}
                    <div className="mb-2.5 lg:mb-2">
                      <label className="block text-[11px] text-white/70 mb-1 font-medium">
                        Nom complet
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/35">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex : Amina Benali"
                          className="w-full pl-9 pr-3 py-2.5 lg:py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs lg:text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] focus:bg-white/[0.08] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Input 2: Phone */}
                    <div className="mb-4 lg:mb-3">
                      <label className="block text-[11px] text-white/70 mb-1 font-medium">
                        Numéro de téléphone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/35">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ex : 0550 12 34 56 (WhatsApp)"
                          className="w-full pl-9 pr-3 py-2.5 lg:py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs lg:text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#d1aa5c] focus:bg-white/[0.08] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Navigation Buttons (Back + Submit) */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={submitting}
                        className="py-2.5 lg:py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 text-xs lg:text-[11px] text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 lg:py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 text-xs lg:text-[12px] font-bold tracking-wide uppercase text-[#0E0F10] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                        style={{
                          cursor: submitting ? 'wait' : 'pointer',
                          background: 'linear-gradient(135deg, #d1aa5c 0%, #b68d40 100%)',
                          boxShadow: '0 6px 20px rgba(209, 170, 92, 0.35)',
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E0F10]" />
                            <span>Transmission...</span>
                          </>
                        ) : (
                          <>
                            <span>Recevoir mon offre</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
