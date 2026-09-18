import type { Metadata, Viewport } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp-button";

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
      <body className="font-[family-name:var(--font-body)] antialiased bg-background">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
