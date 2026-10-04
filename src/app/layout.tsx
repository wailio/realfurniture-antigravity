import type { Metadata, Viewport } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { VisitorTracker } from "@/components/visitor-tracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Château d'art | Mobilier & Design d'Exception",
  description:
    "Maison Château d'art : Mobilier sculptural, boiseries d'art et créations d'exception façonnées pour sublimer vos intérieurs.",
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
    <html lang="fr" className={`${fraunces.variable} ${sora.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link href="https://fonts.cdnfonts.com/css/circular-std" rel="stylesheet" />
      </head>
      <body className="font-[family-name:var(--font-body)] antialiased bg-background">
        {/* WCAG 2.1 AA Bypass Blocks: Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-[#b68d40] focus:text-white focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:shadow-2xl focus:outline-none"
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
