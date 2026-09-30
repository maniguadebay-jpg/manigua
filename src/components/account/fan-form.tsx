'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FanFormProps {
  demo?: { email?: string; password?: string } | null;
}

export const FanForm: React.FC<FanFormProps> = ({ demo }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/auth/fan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, mode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Une erreur est survenue.');
        setStatus('error');
      } else {
        router.push('/compte');
        router.refresh();
      }
    } catch {
      setErrorMsg('Impossible de se connecter. Réessayez.');
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl uppercase text-cream">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="mt-2 text-sm text-cream-mute">
            {mode === 'login' ?'Accédez à vos favoris et votre historique d\'écoute.' :'Créez votre compte fan Maniguadebaby.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:p-8">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-full border border-white/12 bg-ink-950/60 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMsg(''); setStatus('idle'); }}
                className={`flex-1 rounded-full py-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                  mode === m ? 'bg-mango-500 text-ink-950' : 'text-cream-dim hover:text-cream'
                }`}
              >
                {m === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                  Pseudo
                </label>
                <input
                  name="displayName"
                  placeholder="Votre pseudo"
                  className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue={demo?.email ?? ''}
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Mot de passe *
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                defaultValue={demo?.password ?? ''}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
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
              {status === 'loading' ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {demo && (
            <p className="mt-4 text-center text-[11px] text-cream-mute">
              Compte démo pré-rempli pour tester la plateforme.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FanForm;
