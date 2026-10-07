'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Option {
  value: string;
  label: string;
}

interface QuickTrackFormProps {
  artists?: Option[];
  genres?: Option[];
}

export const QuickTrackForm: React.FC<QuickTrackFormProps> = ({ artists = [], genres = [] }) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Erreur lors de la publication.');
        setStatus('error');
      } else {
        setStatus('success');
        router.push('/admin/tracks');
        router.refresh();
      }
    } catch {
      setErrorMsg('Impossible de publier le morceau. Réessayez.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl uppercase text-cream">Publier un morceau</h1>
      <p className="mt-2 text-sm text-cream-mute">
        Remplissez les informations essentielles pour ajouter un titre au catalogue.
      </p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
              Titre *
            </label>
            <input
              name="title"
              required
              placeholder="Nom du morceau"
              className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Artiste *
              </label>
              <select
                name="artistId"
                required
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
              >
                <option value="">Sélectionner…</option>
                {artists.map((a) => (
                  <option key={a.value} value={a.value} className="bg-ink-900">{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Genre
              </label>
              <select
                name="genreId"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
              >
                <option value="">Aucun</option>
                {genres.map((g) => (
                  <option key={g.value} value={g.value} className="bg-ink-900">{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
              URL audio (MP3) *
            </label>
            <input
              name="audioUrl"
              type="url"
              required
              placeholder="https://…/morceau.mp3"
              className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                URL pochette
              </label>
              <input
                name="coverUrl"
                type="url"
                placeholder="https://…/cover.jpg"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Durée (secondes)
              </label>
              <input
                name="durationSeconds"
                type="number"
                min={0}
                placeholder="240"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
          </div>

          {status === 'error' && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-full bg-gradient-to-br from-mango-400 to-mango-600 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {status === 'loading' ? 'Publication…' : 'Publier le morceau'}
          </button>
        </form>
      </div>
    </div>
  );
};
