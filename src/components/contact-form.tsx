'use client';
import React, { useState } from 'react';


interface ContactFormProps {
  kind?: 'booking' | 'contact';
  title?: string;
  description?: string;
  cta?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  kind = 'contact',
  title = 'Nous écrire',
  description = '',
  cta = 'Envoyer',
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, kind }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Une erreur est survenue.');
        setStatus('error');
      } else {
        setStatus('success');
        form.reset();
      }
    } catch {
      setErrorMsg('Impossible d\'envoyer le message. Réessayez.');
      setStatus('error');
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:p-8">
      <h2 className="font-display text-2xl uppercase text-cream">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-cream-mute">{description}</p>}

      {status === 'success' ? (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-6 text-center">
          <p className="font-heading text-base font-bold text-green-400">Message envoyé ✓</p>
          <p className="mt-1 text-sm text-cream-mute">Nous vous répondrons sous 48 heures ouvrées.</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 rounded-full border border-white/15 px-5 py-2 text-[12px] font-bold uppercase tracking-widest text-cream-dim transition hover:text-cream"
          >
            Nouveau message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Nom *
              </label>
              <input
                name="name"
                required
                minLength={2}
                placeholder="Votre nom"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
              />
            </div>
          </div>

          {kind === 'booking' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                    Artiste souhaité
                  </label>
                  <input
                    name="artist"
                    placeholder="Nom de l'artiste"
                    className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                    Date de l'événement
                  </label>
                  <input
                    name="eventDate"
                    type="date"
                    className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                  Budget estimé
                </label>
                <input
                  name="budget"
                  placeholder="Ex : 500 000 FCFA"
                  className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
              Message *
            </label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Décrivez votre demande…"
              className="w-full resize-none rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/60 focus:border-mango-500/60"
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
            {status === 'loading' ? 'Envoi…' : cta}
          </button>
        </form>
      )}
    </div>
  );
};
