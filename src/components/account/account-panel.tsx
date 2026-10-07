'use client';
import React from 'react';

interface AccountPanelProps {
  profile: any;
  stats: { favorites: number; plays: number; minutes: number };
  favoritesSection: React.ReactNode;
  historySection: React.ReactNode;
}

export const AccountPanel = ({ profile, stats, favoritesSection, historySection }: AccountPanelProps) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.email} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mango-500 font-display text-2xl uppercase text-white">
            {profile?.email?.[0] ?? '?'}
          </div>
        )}
        <div>
          <h1 className="font-heading text-xl font-extrabold text-cream">{profile?.email}</h1>
          {profile?.bio && <p className="mt-1 text-sm text-cream-mute">{profile.bio}</p>}
        </div>
        <div className="ml-auto flex gap-6 text-center">
          {[
            { label: 'Favoris', value: stats.favorites },
            { label: 'Écoutes', value: stats.plays },
            { label: 'Minutes', value: stats.minutes },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl text-cream">{s.value}</p>
              <p className="text-[11px] uppercase tracking-widest text-cream-mute">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
          Mes favoris
        </h2>
        {favoritesSection}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
          Historique d'écoute
        </h2>
        {historySection}
      </section>
    </div>
  );
};
