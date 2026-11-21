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
  email: 'contact@mfmeubles.com',
  address: 'Kouba, Alger, Algérie',
  hours: '7j/7 · 9h30 – 20h00',
  maps_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.9859247874274!2d3.07651347583487!3d36.72289927226924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fadd15a1404d7%3A0xe033d167d05c196f!2sM%26F%20Meubles!5e0!3m2!1sfr!2sdz!4v1795257542578!5m2!1sfr!2sdz',

  hero_eyebrow: "M&F MEUBLES · MOBILIER & DESIGN D'EXCEPTION",
  hero_subheading: "L'art du confort pour",
  hero_heading: "espaces d'exception",
  hero_subtitle: 'Matières nobles, proportions sculpturales et finitions artisanales pensées pour sublimer vos espaces de vie.',
  hero_cta: 'Nous contacter',
  hero_image_1: '/hero/hero-1.jpg',
  hero_image_2: '/hero/hero-2.jpg',

  promo_bar: 'Livraison + montage dans les 58 wilayas · Showroom d\'exception à Kouba (Alger)',

  review_1_name: 'Dr. Amina K., Alger',
  review_1_text: 'La qualité des finitions et le confort du salon dépassent toutes mes attentes. Une véritable pièce maîtresse dans notre maison.',
  review_2_name: 'Yacine M., Oran',
  review_2_text: "Livraison ponctuelle et montage très professionnel. Les matériaux et les tissus sont d'un raffinement rare.",
  review_3_name: 'Nadia & Farouk B., Constantine',
  review_3_text: "Nous avons meublé notre salle à manger et notre salon complet chez M&F Meubles. L'accompagnement de l'équipe a été exceptionnel.",
  review_4_name: 'Karim S., Sétif',
  review_4_text: "Le design contemporain s'intègre avec une élégance naturelle. Service client réactif et conseils avisés au showroom de Kouba.",

  about_tagline: "L'Art du Mobilier d'Exception",
  about_philosophie: "M&F Meubles conçoit et façonne des pièces qui allient l'héritage artisanal et le design contemporain le plus pointu.",
  about_histoire: "Fondée avec la vision d'offrir un mobilier d'excellence en Algérie, M&F Meubles s'impose comme une référence incontournable du mobilier haut de gamme.",
  about_histoire_2: "Chaque collection est le fruit d'un dialogue entre nos artisans et les grands courants du design international.",
  about_histoire_3: "Nous sélectionnons rigoureusement nos matériaux pour vous offrir durabilité, confort et élégance intemporelle.",
  about_image: '',

  valeur_1_title: 'Excellence',
  valeur_1_text: 'Chaque pièce est fabriquée avec les meilleurs matériaux et un savoir-faire artisanal exceptionnel.',
  valeur_2_title: 'Authenticité',
  valeur_2_text: "Des designs raffinés et uniques qui racontent une histoire et subliment votre intérieur.",
  valeur_3_title: 'Service Client',
  valeur_3_text: "Un accompagnement personnalisé du début à la fin, du conseil showroom jusqu'à l'installation chez vous.",

  instagram: 'mfmeubles',
  instagram_url: 'https://www.instagram.com/mfmeubles/',
  facebook_url: 'https://www.facebook.com/profile.php?id=100063579698712&locale=fr_FR',
  tiktok: '@mfmeubleskouba',
  tiktok_url: 'https://www.tiktok.com/@mfmeubleskouba',
  youtube_url: 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA',

  footer_tagline: "Mobilier d'exception pour intérieurs modernes",
  footer_brand_desc: "M&F Meubles : votre partenaire d'excellence en mobilier haut de gamme et design à Kouba, Alger.",
  newsletter_title: 'Nouveautés | Arrivages',
  newsletter_subtitle: 'Recevez nos nouvelles collections en avant-première',
  logo_url: '/taskbarlogo.png',

  meta_title: "M&F Meubles | Mobilier & Design d'Exception · Kouba, Alger",
  meta_description: "M&F Meubles à Kouba, Alger : Salons d'exception, salles à manger sculptées et mobilier haut de gamme façonnés pour sublimer vos intérieurs.",
  og_image: '/hero/hero-1.jpg',
}

export const PUBLIC_SITE_CONFIG_STORAGE_URL =
  'https://vhzgasepkcdhnpcinntb.supabase.co/storage/v1/object/public/products/site-config.json'
