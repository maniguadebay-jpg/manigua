'use client';
import React from 'react';

export const LogoCalabash: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
    <path d="M24 8 C16 14 12 20 16 28 C20 36 28 36 32 28 C36 20 32 14 24 8Z" fill="currentColor" opacity="0.6" />
  </svg>
);

interface BrandHeroProps {
  track?: any;
  genres?: any[];
  className?: string;
}

export const BrandHero: React.FC<BrandHeroProps> = ({ track, genres, className }) => {
  return (
    <div className={`relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-20 text-center ${className ?? ''}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,106,26,0.12),transparent_70%)]" />
      <LogoCalabash className="mx-auto mb-6 h-16 w-16 text-mango-500" />
      <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-none text-cream">
        Maniguadebaby
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-mute">
        Le streaming musical d&apos;Afrique de l&apos;Ouest — couper-décaler, afrobeats, mandingue et bien plus.
      </p>
      {track && (
        <div className="mt-8 flex items-center gap-3 rounded-full border border-white/15 bg-ink-900/80 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-widest text-mango-500">En tête</span>
          <span className="font-heading text-sm font-bold text-cream">{track.title}</span>
          <span className="text-xs text-cream-mute">{track.artistName}</span>
        </div>
      )}
    </div>
  );
};