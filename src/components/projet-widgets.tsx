'use client';
import React, { useEffect, useState } from 'react';

export const AmbianceSwitch = () => {
  const [mode, setMode] = useState<'day' | 'night'>('night');
  return (
    <button
      onClick={() => setMode(mode === 'night' ? 'day' : 'night')}
      className="flex items-center gap-2 rounded-full border border-white/20 bg-ink-900/60 px-4 py-2 text-sm text-cream transition hover:border-mango-500/50"
    >
      {mode === 'night' ? '🌙 Ambiance nuit' : '☀️ Ambiance jour'}
    </button>
  );
};

export type SqlViewerProps = {
  /** Chemin public du script SQL (ex. /sql/maniguadebaby-v1.sql). */
  src?: string;
  /** Nom affiché et proposé au téléchargement. */
  filename?: string;
  /** Ancien nom de la prop, conservé pour compatibilité. */
  sqlPath?: string;
};

export const SqlViewer = ({ src, filename, sqlPath }: SqlViewerProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const path = src ?? (sqlPath ? `/${sqlPath}` : '/sql/maniguadebaby-v1.sql');
  const name = filename ?? sqlPath?.split('/').pop() ?? 'maniguadebaby-v1.sql';

  useEffect(() => {
    if (!open || content || error) return;
    let cancelled = false;
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'erreur inconnue');
      });
    return () => {
      cancelled = true;
    };
  }, [open, content, error, path]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-baobab-500/40 bg-baobab-500/10 px-5 py-2.5 text-sm font-bold text-baobab-400 transition hover:bg-baobab-500/20"
      >
        {open ? '▲ Masquer le SQL' : '▼ Voir le script SQL complet'}
      </button>
      {open && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <span className="font-mono text-xs text-cream-mute">
              {name}
              {content ? ` · ${Math.round(content.length / 1024)} Ko` : ''}
            </span>
            <a
              href={path}
              download={name}
              className="rounded-lg bg-baobab-500/20 px-3 py-1 text-xs font-bold text-baobab-400 hover:bg-baobab-500/30"
            >
              Télécharger
            </a>
          </div>
          {error ? (
            <p className="px-5 py-8 text-center text-sm text-cream-mute">
              Script indisponible ({error}). Récupérez-le depuis <span className="font-mono">public/sql/</span>.
            </p>
          ) : content ? (
            <pre className="max-h-[420px] overflow-auto px-5 py-4 text-left font-mono text-[11px] leading-relaxed text-cream-dim">
              {content}
            </pre>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-cream-mute">Chargement du script SQL…</p>
          )}
        </div>
      )}
    </div>
  );
};
