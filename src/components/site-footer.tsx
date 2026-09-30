'use client';
import React from 'react';
import Link from 'next/link';
import { InstagramIcon, TiktokIcon, YoutubeIcon } from './icons';

const FOOTER_LINKS = [
  {
    heading: 'Catalogue',
    links: [
      { href: '/morceaux', label: 'Morceaux' },
      { href: '/albums', label: 'Albums & EP' },
      { href: '/artistes', label: 'Artistes' },
      { href: '/videos', label: 'Clips' },
      { href: '/playlists', label: 'Playlists' },
    ],
  },
  {
    heading: 'Découvrir',
    links: [
      { href: '/decouverte', label: 'Par genre' },
      { href: '/actualites', label: 'Actualités' },
      { href: '/magazine', label: 'Magazine' },
      { href: '/recherche', label: 'Recherche' },
    ],
  },
  {
    heading: 'Artistes',
    links: [
      { href: '/espace-artiste', label: 'Espace artiste' },
      { href: '/contact', label: 'Booking' },
      { href: '/projet', label: 'Le projet' },
    ],
  },
  {
    heading: 'Compte',
    links: [
      { href: '/connexion', label: 'Connexion' },
      { href: '/compte', label: 'Mon compte' },
      { href: '/favoris', label: 'Mes favoris' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-white/8 bg-ink-950/80 pb-8 pt-12">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-2xl uppercase text-cream hover:text-mango-400 transition">
              Maniguadebaby
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-cream-mute">
              Le streaming musical d&apos;Afrique de l&apos;Ouest — couper-décaler, afrobeats, mandingue et bien plus.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Instagram" className="text-cream-mute transition hover:text-mango-400">
                <InstagramIcon width={18} height={18} />
              </a>
              <a href="#" aria-label="TikTok" className="text-cream-mute transition hover:text-mango-400">
                <TiktokIcon width={18} height={18} />
              </a>
              <a href="#" aria-label="YouTube" className="text-cream-mute transition hover:text-mango-400">
                <YoutubeIcon width={18} height={18} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-mango-500">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-cream-mute transition hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-[11px] text-cream-mute">
            © {new Date().getFullYear()} Maniguadebaby. Tous droits réservés.
          </p>
          <p className="text-[11px] text-cream-mute">
            Streaming musical d&apos;Afrique de l&apos;Ouest
          </p>
        </div>
      </div>
    </footer>
  );
};
