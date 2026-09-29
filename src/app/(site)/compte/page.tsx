import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getProfile } from "@/lib/auth";
import { countPlays, loadFavoriteBundle, loadPlayHistory } from "@/lib/favorites-query";
import { AccountPanel } from "@/components/account/account-panel";
import { PlayAllButton, TrackRow } from "@/components/cards";
import { ClockIcon, SparkIcon } from "@/components/icons";
import { formatDuration, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Favoris synchronisés, historique d'écoute et paramètres du compte fan Maniguadebaby.",
};

export default async function ComptePage() {
  await ensureSeeded().catch(() => false);
  const profile = await getProfile();
  if (!profile) redirect("/connexion");

  const owner = { userId: profile.id, visitorId: null };
  const [bundle, history, playStats] = await Promise.all([
    loadFavoriteBundle(owner),
    loadPlayHistory(owner, 12),
    countPlays(owner),
  ]);

  const [fullRow] = await db.select().from(profiles).where(eq(profiles.id, profile.id)).limit(1);
  const fullProfile = {
    ...profile,
    avatarUrl: fullRow?.avatarUrl ?? "",
    bio: fullRow?.bio ?? "",
  };

  const favoritesSection =
    bundle.tracks.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-14 text-center text-sm text-cream-mute">
        Aucun morceau en favori. Ajoutez un cœur sur un titre pour le retrouver ici.{" "}
        <Link href="/morceaux" className="text-mango-400 underline">
          Parcourir le catalogue
        </Link>
      </p>
    ) : (
      <div>
        <div className="mb-4">
          <PlayAllButton tracks={bundle.tracks} label={`Lire mes ${bundle.tracks.length} favoris`} />
        </div>
        <ol className="space-y-0.5">
          {bundle.tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={bundle.tracks} />
          ))}
        </ol>
      </div>
    );

  const historySection =
    history.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-14 text-center text-sm text-cream-mute">
        Aucune écoute enregistrée pour le moment. Lancez un morceau : l'historique se construit tout seul.
      </p>
    ) : (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ol className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
          {history.map((entry, index) => (
            <li key={entry.id} className="group flex items-center gap-4 px-4 py-3 transition hover:bg-white/5">
              <span className="w-6 font-display text-sm text-cream-mute">{String(index + 1).padStart(2, "0")}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.track.coverUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-sm font-bold text-cream">{entry.track.title}</span>
                <span className="block truncate text-[12px] text-cream-mute">
                  {entry.track.artistName} · écouté {timeAgo(entry.playedAt)}
                </span>
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-cream-mute sm:flex">
                <ClockIcon width={12} height={12} /> {formatDuration(entry.track.durationSeconds)}
              </span>
              <PlayAllButton
                tracks={[entry.track, ...history.filter((item) => item.id !== entry.id).map((item) => item.track)]}
                label=""
                variant="outline"
                className="px-3 py-2"
              />
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
          <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
            Mon activité
          </h2>
          <dl className="mt-5 space-y-4">
            {[
              { label: "Lectures enregistrées", value: String(playStats.events) },
              { label: "Temps d'écoute", value: formatDuration(playStats.seconds) },
              { label: "Favoris tous types", value: String(bundle.total) },
              { label: "Titres différents", value: String(new Set(history.map((entry) => entry.track.id)).size) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-white/8 pb-3">
                <dt className="text-[12px] uppercase tracking-[0.16em] text-cream-mute">{item.label}</dt>
                <dd className="font-display text-lg text-cream">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-mango-500/25 bg-mango-500/8 px-4 py-3 text-[12px] leading-relaxed text-cream-dim">
            <SparkIcon width={14} height={14} className="mt-0.5 shrink-0 text-mango-400" />
            Ces données alimentent les statistiques globales de la plateforme et serviront, en Version 2, au calcul des
            royalties reversées aux artistes.
          </p>
        </div>
      </div>
    );

  return (
    <AccountPanel
      profile={fullProfile}
      stats={{
        favorites: bundle.total,
        plays: playStats.events,
        minutes: Math.round(playStats.seconds / 60),
      }}
      favoritesSection={favoritesSection}
      historySection={historySection}
    />
  );
}
