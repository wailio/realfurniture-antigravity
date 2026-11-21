'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Phone,
  User,
  Loader2,
  ChevronDown,
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

// ── Before / After split-divider slider ───────────────────────────────────
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const [isAnimating, setIsAnimating] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const hintedRef = useRef(false)

  useEffect(() => {
    if (hintedRef.current) return
    hintedRef.current = true
    const t1 = setTimeout(() => setPos(25), 500)
    const t2 = setTimeout(() => setPos(75), 1100)
    const t3 = setTimeout(() => setPos(50), 1700)
    const t4 = setTimeout(() => setIsAnimating(false), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const clamp = (x: number) => Math.max(2, Math.min(98, x))

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPos(clamp(((clientX - rect.left) / rect.width) * 100))
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (draggingRef.current) updatePos(e.clientX) }
    const onUp = () => { draggingRef.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [updatePos])

  const easing = '0.55s cubic-bezier(0.32,0.72,0,1)'
  const clipT = isAnimating ? `clip-path ${easing}` : 'none'

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[180px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-lg"
      onMouseDown={(e) => { draggingRef.current = true; updatePos(e.clientX) }}
      onTouchMove={(e) => updatePos(e.touches[0].clientX)}
    >
      {/* ── AFTER: Right side (Salon Meublé) ── */}
      <img
        src="/showroom-apres.jpg"
        alt="Mobilier M&F Meubles"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute top-2.5 right-2.5 z-10 bg-black/80 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-0.5 text-[9.5px] font-bold text-white tracking-wider shadow-xs">
        APRÈS
      </div>

      {/* ── BEFORE: Left side (Pièce Brute) ── */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          transition: clipT,
        }}
      >
        <img
          src="/showroom-avant.jpg"
          alt="Espace avant aménagement"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-2.5 left-2.5 z-10 bg-black/90 backdrop-blur-md border border-white/15 text-white rounded-full px-2.5 py-0.5 text-[9.5px] font-bold tracking-wider shadow-xs">
          AVANT
        </div>
      </div>

      {/* ── DIVIDER LINE ── */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{
          left: `${pos}%`,
          transform: 'translateX(-50%)',
          transition: isAnimating ? `left ${easing}` : 'none',
        }}
      >
        <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-neutral-300 pointer-events-auto">
          <div className="flex items-center gap-0.5 text-neutral-800">
            <span className="text-[10px] font-bold">&lsaquo;</span>
            <span className="text-[10px] font-bold">&rsaquo;</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Success Screen Component ───────────────────────────────────────────────
function SuccessScreen({
  name,
  categoryLabel,
  budget,
  formatPrice,
  onReset,
}: {
  name: string
  categoryLabel: string
  budget: number
  formatPrice: (v: number) => string
  onReset: () => void
}) {
  const scrollToFaq = () => {
    const el = document.getElementById('faq')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col items-center gap-0 animate-in fade-in py-2">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30 shadow-lg">
        <Check className="w-6 h-6 stroke-[2.5]" />
      </div>

      <h3 className="font-bold text-lg text-white text-center mb-1">
        Demande confirmée avec succès !
      </h3>

      <p className="text-white/70 text-xs leading-relaxed text-center mb-5 px-1 max-w-sm">
        Votre sélection <strong className="text-white">{categoryLabel}</strong> (Budget :{' '}
        <span className="font-semibold text-[#d1aa5c]">{formatPrice(budget)}</span>) a été transmise directement à nos conseillers du showroom de Kouba.
      </p>

      {/* Step 1 call status */}
      <div className="w-full rounded-2xl flex items-center gap-3 px-4 py-3 mb-3 bg-gradient-to-b from-white/[0.16] to-white/[0.08] border border-white/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_20px_-4px_rgba(0,0,0,0.2)]">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#d1aa5c] text-black font-bold text-xs shadow-md">
          1
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold leading-tight">
            Un membre de notre équipe vous contactera
          </p>
          <p className="text-white/75 text-[11px] mt-0.5">
            dans moins de 15 minutes
          </p>
        </div>
        <Phone className="w-4 h-4 text-white/70 shrink-0" />
      </div>

      {/* Before/After Showcase */}
      <div className="w-full mb-3">
        <BeforeAfterSlider />
      </div>

      {/* FAQ shortcut */}
      <div
        className="w-full rounded-2xl flex items-center gap-3 px-4 py-3 mb-4 group cursor-pointer bg-gradient-to-b from-white/[0.12] to-white/[0.06] border border-white/20 hover:from-white/[0.20] hover:to-white/[0.10] hover:border-white/35 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all"
        onClick={scrollToFaq}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/15 text-white font-bold text-xs border border-white/25">
          2
        </div>
        <p className="flex-1 text-white/90 text-xs font-medium group-hover:text-white">
          Découvrir les questions fréquentes
        </p>
        <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-white/50 hover:text-white py-1 transition-colors cursor-pointer"
      >
        ← Faire une autre demande
      </button>
    </div>
  )
}

// ── Main Widget ────────────────────────────────────────────────────────────
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
    }, 90)
  }

  const handlePresetSelect = (presetVal: number) => {
    setBudget(presetVal)
    if (sliderTimerRef.current) clearTimeout(sliderTimerRef.current)
    sliderTimerRef.current = setTimeout(() => {
      setStep(3)
    }, 80)
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

      // 2. Post to sales CRM funnel
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

  return (
    <div className="relative w-full max-w-[320px] md:max-w-[460px] lg:max-w-[420px] xl:max-w-[440px] mx-auto lg:mx-0 select-none">
      {/* ── Thin frosted film — lets background breathe through naturally ── */}
      <div
        className="relative overflow-hidden rounded-[26px] md:rounded-[30px] p-4 sm:p-5 lg:p-4.5 xl:p-5 transition-all duration-300"
        style={{
          background: 'rgba(10, 12, 18, 0.38)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.13)',
          boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        }}
      >
        {/* Hairline top edge */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* SUCCESS STATE */}
        {submitted ? (
          <SuccessScreen
            name={name}
            categoryLabel={categoryLabel}
            budget={budget}
            formatPrice={formatPrice}
            onReset={() => { setSubmitted(false); setStep(1); setName(''); setPhone(''); setSelectedType(null) }}
          />
        ) : (
          <div>
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d1aa5c] shadow-[0_0_6px_#d1aa5c]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
                  Devis Rapide &amp; Gratuit
                </span>
              </div>
              <span className="text-[11px] text-white/50 font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/14">
                {step} sur 3
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-0.5 bg-white/[0.12] rounded-full overflow-hidden mb-3.5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%',
                  background: 'linear-gradient(90deg, #c49a3c 0%, #d1aa5c 100%)',
                }}
              />
            </div>

            {/* ── Sliding Track ── */}
            <div className="w-full overflow-hidden">
              <div
                className="flex w-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateX(-${(step - 1) * 100}%)`,
                }}
              >
                {/* ── STEP 1: Select Furniture Type (Luminous Crystal Glass Cards) ── */}
                <div className="w-full shrink-0">
                  <h3 className="text-base md:text-[19px] lg:text-[17.5px] xl:text-[18.5px] font-medium text-white mb-1 leading-snug drop-shadow-xs">
                    Quel type de mobilier recherchez-vous ?
                  </h3>
                  <p className="text-white/80 text-[11px] md:text-[12px] lg:text-[11px] mb-3 leading-relaxed">
                    Sélectionnez la catégorie qui correspond à votre projet.
                  </p>

                  {/* 2-Column Grid — subtle ghost cards */}
                  <div className="grid grid-cols-2 gap-2.5 lg:gap-2">
                    {FURNITURE_TYPES.map((item) => {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectType(item.id)}
                          className="group relative flex flex-col items-center justify-between text-center p-2.5 lg:p-2 xl:p-2.5 rounded-[16px] border border-white/[0.14] hover:border-white/30 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.97] transition-all duration-200 cursor-pointer overflow-hidden min-h-[84px] md:min-h-[96px] lg:min-h-[88px] xl:min-h-[92px]"
                        >
                          <div className="w-full flex-1 flex items-center justify-center py-1">
                            <img
                              src={item.iconImage}
                              alt={item.title}
                              className="w-auto h-11 sm:h-12 md:h-13 lg:h-10 xl:h-11 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] select-none"
                            />
                          </div>
                          <div className="w-full pb-0.5">
                            <p className="text-[10.5px] sm:text-[11px] lg:text-[10px] xl:text-[10.5px] font-semibold text-white/85 group-hover:text-white leading-tight tracking-tight transition-colors">
                              {item.title}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── STEP 2: Budget Slider ── */}
                <div className="w-full shrink-0">
                  <h3 className="text-base md:text-[19px] lg:text-[17.5px] font-medium text-white mb-1 leading-snug drop-shadow-xs">
                    Quel est votre budget estimé ?
                  </h3>
                  <p className="text-white/80 text-xs md:text-[12px] lg:text-[11px] mb-3.5 leading-relaxed">
                    Glissez le curseur pour ajuster votre fourchette de prix idéale.
                  </p>

                  {/* Budget Card — thin glass panel */}
                  <div
                    className="p-4 lg:p-3.5 rounded-2xl mb-3.5 text-center border relative overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      borderColor: 'rgba(255, 255, 255, 0.16)',
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5 font-medium">
                      Budget sélectionné
                    </p>
                    <p className="text-2xl md:text-3xl lg:text-[25px] xl:text-[27px] font-semibold text-amber-300 tracking-tight">
                      {formatPrice(budget)}
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      Pour : <span className="text-white/80 font-medium">{categoryLabel}</span>
                    </p>
                  </div>

                  {/* Range Slider */}
                  <div className="px-1 mb-3.5">
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
                        className="w-full h-3 lg:h-2.5 appearance-none rounded-full cursor-pointer focus:outline-none"
                        style={{
                          background: `linear-gradient(to right, #d1aa5c 0%, #b68d40 ${((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%, rgba(255, 255, 255, 0.14) ${((budget - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%, rgba(255, 255, 255, 0.14) 100%)`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-white/35 mt-2">
                      <span>{formatPrice(MIN_PRICE)}</span>
                      <span className="text-amber-400/70 text-[9px] uppercase font-medium tracking-wider">Glissez &amp; relâchez</span>
                      <span>{formatPrice(MAX_PRICE)}</span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-5 gap-1.5 mb-4 lg:mb-3.5">
                    {[20000, 50000, 85000, 120000, 180000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`py-1.5 lg:py-1 px-1.5 rounded-xl text-[10.5px] font-medium transition-all active:scale-95 cursor-pointer ${
                          budget === preset
                            ? 'bg-[#d1aa5c] text-black font-bold shadow-sm border border-amber-400/30'
                            : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.15] hover:text-white border border-white/14'
                        }`}
                      >
                        {preset >= 1000 ? `${preset / 1000}k DA` : preset}
                      </button>
                    ))}
                  </div>

                  {/* Nav */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2.5 lg:py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 text-xs lg:text-[11px] text-white/70 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/14 hover:border-white/25 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Retour</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="flex-1 py-2.5 lg:py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs lg:text-[11px] font-bold text-neutral-950 bg-[#d1aa5c] hover:bg-amber-300 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── STEP 3: Contact Details ── */}
                <div className="w-full shrink-0">
                  <form onSubmit={handleSubmit}>
                    <h3 className="text-base md:text-[19px] lg:text-[17.5px] font-normal text-white mb-1 leading-snug">
                      Vos coordonnées de contact
                    </h3>
                    <p className="text-white/80 text-xs md:text-[12px] lg:text-[11px] mb-3 leading-relaxed">
                      Recevez votre devis détaillé directement sur WhatsApp ou par téléphone.
                    </p>

                    {error && (
                      <div className="mb-2 p-2 rounded-xl bg-red-500/30 border border-red-500/50 text-red-100 text-xs backdrop-blur-md">
                        {error}
                      </div>
                    )}

                    {/* Summary */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.08] border border-white/14 text-xs mb-2.5 text-white">
                      <div>
                        <span className="text-white/50 block text-[9px] uppercase font-semibold">Projet</span>
                        <strong className="text-white/85 font-semibold text-xs">{categoryLabel}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-white/50 block text-[9px] uppercase font-semibold">Budget</span>
                        <span className="text-amber-300 font-bold">{formatPrice(budget)}</span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mb-2">
                      <label className="block text-[11px] text-white/80 mb-1 font-medium">
                        Nom complet *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex : Amina Benali"
                          className="w-full pl-9 pr-3 py-2.5 lg:py-2 rounded-xl bg-white/[0.08] border border-white/16 text-xs text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                      <label className="block text-[11px] text-white/80 mb-1 font-medium">
                        Numéro de téléphone (WhatsApp) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ex : 0550 12 34 56 (WhatsApp)"
                          className="w-full pl-9 pr-3 py-2.5 lg:py-2 rounded-xl bg-white/[0.08] border border-white/16 text-xs text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-all"
                        />
                      </div>
                      <p className="text-[9.5px] text-white/45 mt-1 leading-tight">
                        En validant, vous consentez à être contacté par nos conseillers. Données protégées.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={submitting}
                        className="py-2.5 lg:py-2 px-3.5 rounded-xl flex items-center justify-center gap-1 text-xs lg:text-[11px] text-white/70 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/14 hover:border-white/25 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Retour</span>
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 lg:py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs lg:text-[11px] font-bold text-neutral-950 bg-[#d1aa5c] hover:bg-amber-300 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Recevoir mon devis gratuit</span>
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
