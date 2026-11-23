export interface ProductFinish {
  name: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  featured?: boolean;
  createdAt?: string;
  finishes?: ProductFinish[];
  features?: string[];
}

export const SALLE_IMAGES = [
  '/products/salle/sallesmanger.jpg',
  '/products/salle/sallesmanger-harmonie.jpg',
  '/products/salle/sallesmanger.jpg',
  '/products/salle/sallesmanger-harmonie.jpg',
];

export const SALON_IMAGES = [
  '/products/salon/couch.jpg',
  '/products/salon/couch.jpg',
  '/products/salon/couch.jpg',
  '/products/salon/couch.jpg',
];

export const CHAMBRE_IMAGES = [
  '/products/chambre/chmbr.jpg',
  '/products/chambre/chmbr.jpg',
  '/products/chambre/chmbr.jpg',
  '/products/chambre/chmbr.jpg',
];

export const ARMOIRE_IMAGES = [
  '/products/armoire/armo.jpg',
  '/products/armoire/armo.jpg',
  '/products/armoire/armo.jpg',
  '/products/armoire/armo.jpg',
];

export const ACCESSOIRE_IMAGES = [
  '/products/accessoire/other.jpg',
  '/products/accessoire/other.jpg',
  '/products/accessoire/other.jpg',
  '/products/accessoire/other.jpg',
];

export const DEFAULT_FINISHES: ProductFinish[] = [
  { name: 'Marron', color: '#5A3D28' },
  { name: 'Blanc Ivoire', color: '#EDE8DF' },
  { name: 'Ivoire / Nature', color: '#C8B293' },
  { name: 'Noir Ébène', color: '#1A1A1A' },
];

export const DEFAULT_FEATURES: string[] = [
  'Dimensions sur mesure, pensées pour un aménagement fluide au quotidien.',
  'Ensemble coordonné avec finitions nobles et assemblages de haute précision.',
  '4 finitions exclusives disponibles : marron noble, blanc pur, ivoire naturel, noir ébène.',
];

/* ── Static seed data with authentic M&F Meubles photos ── */
export const products: Product[] = [
  {
    id: 1,
    name: "Salon Panoramique Crème & Or",
    description: "Composition modulable de prestige en velours structuré avec assise généreuse et finitions artisanales.",
    price: 89000,
    originalPrice: 105000,
    discount: 15,
    image: "/products/salon/couch.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 3,
    name: "Canapé d'Angle Royal Prestige",
    description: "Grand canapé d'angle luxueux en tissu noble avec méridienne spacieuse et coussins assortis.",
    price: 96000,
    originalPrice: 115000,
    discount: 16,
    image: "/products/salon/couch.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 4,
    name: "Salon Modulable Velours Crème",
    description: "Ensemble salon de prestige associant confort ergonomique et lignes épurées pour une élégance absolue.",
    price: 82000,
    originalPrice: 98000,
    discount: 16,
    image: "/products/salon/couch.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 5,
    name: "Salon d'Angle Contemporain Élite",
    description: "Salon chaleureux aux coussins capitonnés et finitions soignées pour sublimer vos réceptions.",
    price: 74000,
    originalPrice: 88000,
    discount: 16,
    image: "/products/salon/couch.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 6,
    name: "Suite Parentale Majestueuse & Banquette",
    description: "Ensemble complet d'exception composé d'un lit double sculpté, de deux chevets, d'une commode avec miroir et d'une armoire assortie.",
    price: 185000,
    originalPrice: 220000,
    discount: 16,
    image: "/products/chambre/chmbr.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 7,
    name: "Chambre à Coucher Royale AURA",
    description: "Suite parentale d'une élégance intemporelle avec finitions artisanales et tête de lit raffinée.",
    price: 172000,
    originalPrice: 205000,
    discount: 16,
    image: "/products/chambre/chmbr.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 8,
    name: "Salle à Manger Marbre & Chaises Cuir",
    description: "Table en bois noble aux lignes architecturales accompagnée de 6 chaises tapissées de grand confort.",
    price: 108000,
    originalPrice: 128000,
    discount: 16,
    image: "/products/salle/sallesmanger.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: [
      '1m60, pensée pour un aménagement et un confort quotidien optimal.',
      'Ensemble coordonné avec lit, chevets, commode et miroir assortis.',
      '4 finitions disponibles : marron, blanc, ivoire / nature, black.',
    ],
  },
  {
    id: 9,
    name: "Ensemble Table Céramique & 6 Chaises",
    description: "Ensemble salle à manger de réception haut de gamme avec plateau biseauté et chaises rembourrées.",
    price: 119000,
    originalPrice: 142000,
    discount: 16,
    image: "/products/salle/sallesmanger.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 10,
    name: "Armoire Dressing Coulissante Atelier",
    description: "Armoire spacieuse avec penderies doubles, tiroirs intégrés et portes coulissantes à fermeture douce.",
    price: 89000,
    originalPrice: 106000,
    discount: 16,
    image: "/products/armoire/armo.jpg",
    images: ARMOIRE_IMAGES,
    category: "armoire",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 11,
    name: "Buffet & Miroir Sculpté Cannelé",
    description: "Meuble multimédia d'une finesse incomparable avec panneaux texturés et rangements discrètement intégrés.",
    price: 48000,
    originalPrice: 58000,
    discount: 17,
    image: "/products/accessoire/other.jpg",
    images: ACCESSOIRE_IMAGES,
    category: "accessories",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 12,
    name: "Salle à Manger Signature Impériale",
    description: "Chaise capitonnée de prestige alliant structure en bois massif et assise enveloppante.",
    price: 95000,
    originalPrice: 112000,
    discount: 15,
    image: "/products/salle/sallesmanger.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 13,
    name: "Lit Capitonnée & Chevets ÉLITE",
    description: "Chambre à coucher complète avec tête de lit intégrée, chevets suspendus et finitions velours noyer.",
    price: 198000,
    originalPrice: 235000,
    discount: 16,
    image: "/products/chambre/chmbr.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 14,
    name: "Dressing Miroir Bronze & Finition Noyer",
    description: "Dressing trois portes à fermeture amortie avec étagères modulables et rétroéclairage d'ambiance.",
    price: 94000,
    originalPrice: 112000,
    discount: 16,
    image: "/products/armoire/armo.jpg",
    images: ARMOIRE_IMAGES,
    category: "armoire",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 15,
    name: "Console Murale & Miroir Demi-Lune",
    description: "Ensemble de décoration raffiné apportant la touche finale d'élégance à votre intérieur.",
    price: 36000,
    originalPrice: 43000,
    discount: 16,
    image: "/products/accessoire/other.jpg",
    images: ACCESSOIRE_IMAGES,
    category: "accessories",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 16,
    name: "Meuble D'Appoint Prestige Doré",
    description: "Table basse sculpturale combinant plateau en marbre veiné et piètement noyer massif séché au four.",
    price: 42000,
    originalPrice: 50000,
    discount: 16,
    image: "/products/accessoire/other.jpg",
    images: ACCESSOIRE_IMAGES,
    category: "accessories",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 17,
    name: "Méridienne Grand Confort Sublime",
    description: "Assise de relaxation d'architecte confectionnée en tissu bouclé italien de haute densité.",
    price: 68000,
    originalPrice: 80000,
    discount: 15,
    image: "/products/salon/couch.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 18,
    name: "Suite Complète Noyer & Tissu Bouclé",
    description: "Meuble de rangement 4 tiroirs à coulisses invisibles avec finitions bois laqué et poignées dorées.",
    price: 159000,
    originalPrice: 189000,
    discount: 16,
    image: "/products/chambre/chmbr.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "M&F Meubles",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
];

export function getProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DZD";
}
