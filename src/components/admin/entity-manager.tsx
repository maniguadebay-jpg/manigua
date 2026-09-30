'use client';
import React, { useState } from 'react';
import type { EntityConfig } from '@/lib/admin-config';

export type Row = Record<string, any>;
export type OptionsMap = Record<string, Array<{ value: string; label: string }>>;

interface EntityManagerProps {
  config: EntityConfig;
  initialItems: Row[];
  options: OptionsMap;
}

export const EntityManager: React.FC<EntityManagerProps> = ({ config, initialItems, options }) => {
  const [items, setItems] = useState<Row[]>(initialItems);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const entityKey = config.labelPlural.toLowerCase();

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      await fetch(`/api/admin/${entityKey}/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const isEdit = Boolean(editing?.id);
      const url = isEdit ? `/api/admin/${entityKey}/${editing!.id}` : `/api/admin/${entityKey}`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Erreur.');
        setStatus('error');
        return;
      }
      if (isEdit) {
        setItems((prev) => prev.map((item) => (item.id === editing!.id ? { ...item, ...json.item } : item)));
      } else {
        setItems((prev) => [json.item, ...prev]);
      }
      setEditing(null);
      setCreating(false);
      setStatus('idle');
    } catch {
      setErrorMsg('Impossible de sauvegarder.');
      setStatus('error');
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase text-cream">{config.labelPlural}</h1>
          <p className="mt-1 text-sm text-cream-mute">{config.description}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.02]"
          >
            + Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-3xl border border-white/10 bg-ink-900/70 p-6">
          <h2 className="mb-5 font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
            {editing ? `Modifier ${config.labelSingular}` : `Nouveau ${config.labelSingular}`}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                  {field.label}{field.required ? ' *' : ''}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    defaultValue={editing?.[field.name] ?? ''}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
                  />
                ) : field.type === 'select' && field.selectKey ? (
                  <select
                    name={field.name}
                    required={field.required}
                    defaultValue={editing?.[field.name] ?? ''}
                    className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
                  >
                    <option value="">Sélectionner…</option>
                    {(options[field.selectKey] ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-ink-900">{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <select
                    name={field.name}
                    defaultValue={editing?.[field.name] ? 'true' : 'false'}
                    className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
                  >
                    <option value="false" className="bg-ink-900">Non</option>
                    <option value="true" className="bg-ink-900">Oui</option>
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type === 'slug' ? 'text' : field.type}
                    required={field.required}
                    defaultValue={editing?.[field.name] ?? ''}
                    className="w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/60"
                  />
                )}
              </div>
            ))}
            {status === 'error' && (
              <div className="sm:col-span-2">
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{errorMsg}</p>
              </div>
            )}
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.02] disabled:opacity-60"
              >
                {status === 'loading' ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setCreating(false); setStatus('idle'); }}
                className="rounded-full border border-white/15 px-6 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:text-cream"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
          Aucun élément. Cliquez sur « Ajouter » pour créer le premier.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-ink-900/80">
              <tr>
                {config.fields.slice(0, 3).map((f) => (
                  <th key={f.name} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-ink-900/40">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-white/3">
                  {config.fields.slice(0, 3).map((f) => (
                    <td key={f.name} className="max-w-[200px] truncate px-4 py-3 text-cream-dim">
                      {String(item[f.name] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(item); setCreating(false); }}
                        className="rounded-lg border border-white/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cream-dim transition hover:border-mango-500/50 hover:text-mango-400"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-500/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400/70 transition hover:border-red-500/50 hover:text-red-400"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};