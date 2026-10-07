'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SearchIcon, UserIcon, HeartIcon } from './icons';

const NAV_LINKS = [
  { href: '/morceaux', label: 'Morceaux' },
  { href: '/artistes', label: 'Artistes' },
  { href: '/albums', label: 'Albums' },
  { href: '/videos', label: 'Clips' },
  { href: '/actualites', label: 'Actus' },
  { href: '/decouverte', label: 'Découverte' },
];

export const SiteHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-ink-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 font-display text-xl uppercase tracking-tight text-cream hover:text-mango-400 transition">
          Maniguadebaby
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:bg-white/8 hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/recherche"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream-mute transition hover:bg-white/8 hover:text-cream"
            aria-label="Rechercher"
          >
            <SearchIcon width={18} height={18} />
          </Link>
          <Link
            href="/favoris"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream-mute transition hover:bg-white/8 hover:text-cream"
            aria-label="Favoris"
          >
            <HeartIcon width={18} height={18} />
          </Link>
          <Link
            href="/connexion"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream-mute transition hover:bg-white/8 hover:text-cream"
            aria-label="Mon compte"
          >
            <UserIcon width={18} height={18} />
          </Link>
          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream-mute transition hover:bg-white/8 hover:text-cream lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-white/8 bg-ink-950/95 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-heading text-sm font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:bg-white/8 hover:text-cream"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
