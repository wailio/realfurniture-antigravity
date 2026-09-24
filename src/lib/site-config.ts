'use client'

import { useState, useEffect } from 'react'

export interface SiteConfig {
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string
  hero_tagline: string
  hero_subtitle: string
  hero_cta: string
  promo_bar: string
  about_tagline: string
  about_philosophie: string
  about_histoire: string
  instagram: string
  instagram_url: string
  facebook_url: string
  tiktok: string
  tiktok_url: string
  youtube_url: string
  meta_title: string
  meta_description: string
  [key: string]: string
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  phone: '0561 71 91 00',
  whatsapp: '213561719100',
  email: 'chateau.art01@gmail.com',
  address: 'Alger, Algérie',
  hours: '6j/7 · 9h30 – 20h00',
  hero_tagline: 'Meubles uniques pour espaces modernes',
  hero_subtitle: 'Des meubles conçus pour transformer votre espace',
  hero_cta: 'Rendez-vous',
  promo_bar: 'Livraison + montage dans les 58 wilayas · Gratuit sur Alger – Blida – Boumerdès – Médéa – Tipaza',
  about_tagline: "L'Art du Mobilier d'Exception",
  about_philosophie: "Château d'art crée des pièces qui allient l'héritage artisanal et le design contemporain le plus pointu.",
  about_histoire: "Fondée avec la vision d'offrir un mobilier d'excellence en Algérie, Château d'art s'impose comme une référence incontournable.",
  instagram: 'chateau_dart_meubles',
  instagram_url: 'https://www.instagram.com/chateau_dart_meubles',
  facebook_url: 'https://www.facebook.com/chateau.dart.alger',
  tiktok: '@chateaudart_meubles',
  tiktok_url: 'https://www.tiktok.com/@chateaudart_meubles',
  youtube_url: 'https://www.youtube.com/@chateaudart',
  meta_title: "Château d'art | Mobilier & Design d'Exception",
  meta_description: "Maison Château d'art : Mobilier sculptural, salons de luxe, salles à manger et chambres haut de gamme à Alger.",
}

export const PUBLIC_SITE_CONFIG_STORAGE_URL =
  'https://vhzgasepkcdhnpcinntb.supabase.co/storage/v1/object/public/products/site-config.json'

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)

  useEffect(() => {
    let isMounted = true
    fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`)
      .then(res => {
        if (res.ok) return res.json()
        return null
      })
      .then(data => {
        if (data && isMounted) {
          setConfig(prev => ({ ...prev, ...data }))
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  return config
}
