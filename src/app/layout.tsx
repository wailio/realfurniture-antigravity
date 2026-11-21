import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Instrument_Sans, Sora } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { VisitorTracker } from "@/components/visitor-tracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ── Typography: Apple-grade editorial serif + modern grotesque sans ──────────
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M&F Meubles | Mobilier & Design d'Exception · Kouba, Alger",
  description:
    "M&F Meubles : Salons contemporains haut de gamme, tables en marbre sculpté et mobilier d'exception confectionnés pour sublimer vos intérieurs à Alger.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${sora.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link href="https://fonts.cdnfonts.com/css/circular-std" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-[#FFFFFF] text-[#111827] selection:bg-[#111827] selection:text-white">
        {/* WCAG 2.1 AA Bypass Blocks: Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-[#111827] focus:text-white focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:shadow-2xl focus:outline-none focus:rounded-md"
        >
          Aller au contenu principal
        </a>
        <VisitorTracker />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
