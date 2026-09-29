'use client';
import React, { useState } from 'react';

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

export const SqlViewer = ({ sqlPath }: { sqlPath?: string }) => {
  const [open, setOpen] = useState(false);
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
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="font-mono text-xs text-cream-mute">{sqlPath ?? 'maniguadebaby-v1.sql'}</span>
            <a
              href={`/${sqlPath ?? 'sql/maniguadebaby-v1.sql'}`}
              download
              className="rounded-lg bg-baobab-500/20 px-3 py-1 text-xs font-bold text-baobab-400 hover:bg-baobab-500/30"
            >
              Télécharger
            </a>
          </div>
          <p className="px-5 py-8 text-center text-sm text-cream-mute">
            Chargement du script SQL…
          </p>
        </div>
      )}
    </div>
  );
};
