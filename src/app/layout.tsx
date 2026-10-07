import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://maniguadebaby.com"),
  title: {
    default: "Maniguadebaby — Le streaming musical d'Afrique de l'Ouest",
    template: "%s · Maniguadebaby",
  },
  description:
    "Plateforme de streaming et écosystème musical ouest-africain : couper-décaler, zouglou, mandingue, rap ivoire, afro-pop, gospel et reggae. Lecteur audio persistant, clips, fiches artistes et actualités.",
  keywords: [
    "streaming musique ivoirienne",
    "couper-décaler",
    "zouglou",
    "rap ivoire",
    "musique Afrique de l'Ouest",
    "clips Abidjan",
    "Maniguadebaby",
    "pronostics football",
  ],
  applicationName: "Maniguadebaby",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    siteName: "Maniguadebaby",
    title: "Maniguadebaby — Le streaming musical d'Afrique de l'Ouest",
    description:
      "Catalogue administré, lecteur audio persistant, clips et actualités de la scène ivoirienne et ouest-africaine.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maniguadebaby",
    description: "La musique d'Afrique de l'Ouest, en continu.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0906",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Chargement des polices par <link> plutôt que next/font : le build reste
          ainsi possible sans accès réseau à fonts.googleapis.com (CI, environnements isolés).
          Important : ce layout est le layout racine, donc les polices sont bien chargées
          pour toutes les routes.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink-950 font-body text-cream antialiased">{children}</body>
    </html>
  );
}
