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
  '/products/salle/11.jpg',
  '/products/salle/22.jpg',
  '/products/salle/33.jpg',
  '/products/salle/44.jpg',
  '/products/salle/55.jpg',
  '/products/salle/66.jpg',
  '/products/salle/77.jpg',
  '/products/salle/88.jpg',
  '/products/salle/99.jpg',
];

export const SALON_IMAGES = [
  '/products/salon/aa.jpg',
  '/products/salon/bb.jpg',
  '/products/salon/cc.jpg',
  '/products/salon/dd.jpg',
  '/products/salon/ee.jpg',
  '/products/salon/ff.jpg',
  '/products/salon/gg.jpg',
  '/products/salon/hh.jpg',
  '/products/salon/ii.jpg',
];

export const CHAMBRE_IMAGES = [
  '/products/chambre/-1.jpg',
  '/products/chambre/-2.jpg',
  '/products/chambre/-3.jpg',
  '/products/chambre/-4.jpg',
  '/products/chambre/-5.jpg',
  '/products/chambre/-6.jpg',
  '/products/chambre/-8.jpg',
  '/products/chambre/-9.jpg',
  '/products/chambre/-99.jpg',
];

export const ARMOIRE_IMAGES = [
  '/products/armoire/ar1.jpg',
  '/products/armoire/ar2.jpg',
  '/products/armoire/ar3.jpg',
];

export const ACCESSOIRE_IMAGES = [
  '/products/accessoire/acc1.jpg',
  '/products/accessoire/acc2.jpg',
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

/* ── Static seed data with authentic Château d'art photos ── */
export const products: Product[] = [
  {
    id: 1,
    name: "Salon Modulable Royal",
    description: "Composition modulable de prestige en velours structuré avec assise généreuse et finitions artisanales.",
    price: 84990,
    originalPrice: 99990,
    discount: 15,
    image: "/products/salon/aa.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 3,
    name: "Salon d'Angle Majestueux",
    description: "Grand canapé d'angle luxueux en tissu noble avec méridienne spacieuse et coussins assortis.",
    price: 79990,
    originalPrice: 94990,
    discount: 16,
    image: "/products/salon/aa.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 4,
    name: "Salon Contemporain Élite",
    description: "Ensemble salon de prestige associant confort ergonomique et lignes épurées pour une élégance absolue.",
    price: 72990,
    originalPrice: 86990,
    discount: 16,
    image: "/products/salon/aa.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 5,
    name: "Salon Confort Prestige",
    description: "Salon chaleureux aux coussins capitonnés et finitions soignées pour sublimer vos réceptions.",
    price: 64990,
    originalPrice: 76990,
    discount: 16,
    image: "/products/salon/aa.jpg",
    images: SALON_IMAGES,
    category: "sofas",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 6,
    name: "Chambre à coucher ECLIPSE",
    description: "Ensemble complet d'exception composé d'un lit double sculpté, de deux chevets, d'une commode avec miroir et d'une armoire assortie.",
    price: 189990,
    originalPrice: 224990,
    discount: 16,
    image: "/products/chambre/-1.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 7,
    name: "Chambre à coucher LUNA",
    description: "Suite parentale d'une élégance intemporelle avec finitions artisanales et tête de lit raffinée.",
    price: 175990,
    originalPrice: 209990,
    discount: 16,
    image: "/products/chambre/-1.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 8,
    name: "Salle à manger K&B Royale",
    description: "Table en bois noble aux lignes architecturales accompagnée de 6 chaises tapissées de grand confort.",
    price: 58990,
    originalPrice: 69990,
    discount: 16,
    image: "/products/salle/11.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "Château d'art",
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
    name: "Salle à manger Prestige Impériale",
    description: "Ensemble salle à manger de réception haut de gamme avec plateau biseauté et chaises rembourrées.",
    price: 119990,
    originalPrice: 142990,
    discount: 16,
    image: "/products/salle/11.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 10,
    name: "Armoire Dressing Majestueuse",
    description: "Armoire spacieuse avec penderies doubles, tiroirs intégrés et portes coulissantes à fermeture douce.",
    price: 89990,
    originalPrice: 106990,
    discount: 16,
    image: "/products/armoire/ar1.jpg",
    images: ARMOIRE_IMAGES,
    category: "armoire",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 11,
    name: "Meuble TV & Déco Contemporain",
    description: "Meuble multimédia d'une finesse incomparable avec panneaux texturés et rangements discrètement intégrés.",
    price: 45990,
    originalPrice: 54990,
    discount: 16,
    image: "/products/accessoire/acc1.jpg",
    images: ACCESSOIRE_IMAGES,
    category: "accessories",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 12,
    name: "Fauteuil Salle à Manger Signature",
    description: "Chaise capitonnée de prestige alliant structure en bois massif et assise enveloppante.",
    price: 38990,
    originalPrice: 48000,
    discount: 18,
    image: "/products/salle/11.jpg",
    images: SALLE_IMAGES,
    category: "salle-a-manger",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 13,
    name: "Suite Lit & Dressing AURA",
    description: "Chambre à coucher complète avec tête de lit intégrée, chevets suspendus et finitions velours noyer.",
    price: 195000,
    originalPrice: 230000,
    discount: 15,
    image: "/products/chambre/-1.jpg",
    images: CHAMBRE_IMAGES,
    category: "chambres",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 14,
    name: "Armoire Dressing Atelier Chêne",
    description: "Dressing trois portes à fermeture amortie avec étagères modulables et rétroéclairage d'ambiance.",
    price: 94000,
    originalPrice: 112000,
    discount: 16,
    image: "/products/armoire/ar1.jpg",
    images: ARMOIRE_IMAGES,
    category: "armoire",
    brand: "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
  },
  {
    id: 15,
    name: "Accessoire Décoratif & Lampe Sculptée",
    description: "Ensemble de décoration raffiné apportant la touche finale d'élégance à votre intérieur.",
    price: 24500,
    originalPrice: 29000,
    discount: 15,
    image: "/products/accessoire/acc1.jpg",
    images: ACCESSOIRE_IMAGES,
    category: "accessories",
    brand: "Château d'art",
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
