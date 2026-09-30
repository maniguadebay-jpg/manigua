'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  demoEmail?: string;
  demoPassword?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ demoEmail, demoPassword }) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Identifiants incorrects.');
        setStatus('error');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setErrorMsg('Impossible de se connecter. Réessayez.');
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl uppercase text-cream">Administration</h1>
          <p className="mt-2 text-sm text-cream-mute">Connexion au tableau de bord Maniguadebaby.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue={demoEmail ?? ''}
                placeholder="admin@maniguadebaby.ci"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Mot de passe
              </label>
              <input
                name="password"
                type="password"
                required
                defaultValue={demoPassword ?? ''}
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
              {status === 'loading' ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
          {demoEmail && (
            <p className="mt-4 text-center text-[11px] text-cream-mute">
              Identifiants démo pré-remplis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
