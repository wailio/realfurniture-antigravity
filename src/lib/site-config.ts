'use client'

import { useState, useEffect } from 'react'

export interface SiteConfig {
  // Contact
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string
  maps_embed_url: string

  // Home Hero
  hero_eyebrow: string
  hero_subheading: string
  hero_heading: string
  hero_subtitle: string
  hero_cta: string
  hero_image_1: string
  hero_image_2: string

  // Promo bar
  promo_bar: string

  // Home Reviews
  review_1_name: string
  review_1_text: string
  review_2_name: string
  review_2_text: string
  review_3_name: string
  review_3_text: string
  review_4_name: string
  review_4_text: string

  // About
  about_tagline: string
  about_philosophie: string
  about_histoire: string
  about_histoire_2: string
  about_histoire_3: string
  about_image: string

  // About values
  valeur_1_title: string
  valeur_1_text: string
  valeur_2_title: string
  valeur_2_text: string
  valeur_3_title: string
  valeur_3_text: string

  // Social
  instagram: string
  instagram_url: string
  facebook_url: string
  tiktok: string
  tiktok_url: string
  youtube_url: string

  // Footer
  footer_tagline: string
  footer_brand_desc: string
  newsletter_title: string
  newsletter_subtitle: string
  logo_url: string

  // SEO
  meta_title: string
  meta_description: string
  og_image: string

  [key: string]: string
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  phone: '0561 71 91 00',
  whatsapp: '213561719100',
  email: 'chateau.art01@gmail.com',
  address: 'Alger, Algérie',
  hours: '6j/7 · 9h30 – 20h00',
  maps_embed_url: '',

  hero_eyebrow: "CHÂTEAU D'ART · MAISON DE DESIGN",
  hero_subheading: "L'art du confort pour",
  hero_heading: "espaces d'exception",
  hero_subtitle: 'Matières nobles, proportions sculpturales et finitions artisanales pensées pour sublimer vos espaces de vie.',
  hero_cta: 'Nous contacter',
  hero_image_1: '',
  hero_image_2: '',

  promo_bar: 'Livraison + montage dans les 58 wilayas · Gratuit sur Alger – Blida – Boumerdès – Médéa – Tipaza',

  review_1_name: 'Dr. Amina K., Alger',
  review_1_text: 'La qualité des finitions et le confort du salon dépassent toutes mes attentes. Une véritable pièce maîtresse dans notre maison.',
  review_2_name: 'Yacine M., Oran',
  review_2_text: "Livraison ponctuelle et montage très professionnel. Les matériaux en bois massif et les tissus sont d'un raffinement rare.",
  review_3_name: 'Nadia & Farouk B., Constantine',
  review_3_text: "Nous avons meublé notre salle à manger et notre chambre complète. L'accompagnement de l'équipe a été exceptionnel.",
  review_4_name: 'Karim S., Sétif',
  review_4_text: "Le design contemporain s'intègre avec une élégance naturelle. Service client réactif et conseils avisés.",

  about_tagline: "L'Art du Mobilier d'Exception",
  about_philosophie: "Château d'art crée des pièces qui allient l'héritage artisanal et le design contemporain le plus pointu.",
  about_histoire: "Fondée avec la vision d'offrir un mobilier d'excellence en Algérie, Château d'art s'impose comme une référence incontournable.",
  about_histoire_2: "Chaque collection est le fruit d'un dialogue entre nos artisans et les grands courants du design international.",
  about_histoire_3: "Nous sélectionnons rigoureusement nos matériaux pour vous offrir durabilité, confort et élégance intemporelle.",
  about_image: '',

  valeur_1_title: 'Excellence',
  valeur_1_text: 'Chaque pièce est fabriquée avec les meilleurs matériaux et un savoir-faire exceptionnel.',
  valeur_2_title: 'Authenticité',
  valeur_2_text: "Des designs uniques qui racontent une histoire et reflètent votre personnalité.",
  valeur_3_title: 'Service Client',
  valeur_3_text: "Un accompagnement personnalisé du début à la fin, du choix jusqu'à l'installation.",

  instagram: 'chateau_dart_meubles',
  instagram_url: 'https://www.instagram.com/chateau_dart_meubles',
  facebook_url: 'https://www.facebook.com/chateau.dart.alger',
  tiktok: '@chateaudart_meubles',
  tiktok_url: 'https://www.tiktok.com/@chateaudart_meubles',
  youtube_url: 'https://www.youtube.com/@chateaudart',

  footer_tagline: "Mobilier d'exception pour intérieurs modernes",
  footer_brand_desc: "Maison Château d'art : votre partenaire en mobilier haut de gamme en Algérie.",
  newsletter_title: 'Nouveautés | Arrivages',
  newsletter_subtitle: 'Recevez nos nouvelles collections en avant-première',
  logo_url: '/bigtower.png',

  meta_title: "Château d'art | Mobilier & Design d'Exception",
  meta_description: "Maison Château d'art : Mobilier sculptural, boiseries d'art et créations d'exception façonnées pour sublimer vos intérieurs.",
  og_image: '',
}

export const PUBLIC_SITE_CONFIG_STORAGE_URL =
  'https://vhzgasepkcdhnpcinntb.supabase.co/storage/v1/object/public/products/site-config.json'

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)

  useEffect(() => {
    let isMounted = true
    fetch(`${PUBLIC_SITE_CONFIG_STORAGE_URL}?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setConfig({ ...DEFAULT_SITE_CONFIG, ...data })
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  return config
}
