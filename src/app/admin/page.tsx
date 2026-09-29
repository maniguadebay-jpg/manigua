import Link from "next/link";
import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { newsletterSignups, playEvents, profiles } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getSessionUser } from "@/lib/auth";
import { getSiteStats, listArticles, listPlaylists, listTracks, listVideos } from "@/lib/queries";
import { ENTITY_CONFIGS, ENTITY_KEYS } from "@/lib/admin-config";
import { AdminNav } from "@/components/admin/admin-nav";
import { CountUp } from "@/components/count-up";
import {
  ArrowUpRightIcon,
  DiscIcon,
  MicIcon,
  NewsIcon,
  SparkIcon,
  VideoIcon,
  QueueIcon,
  UserIcon,
  WaveIcon,
} from "@/components/icons";
import { formatCompactNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  await ensureSeeded().catch(() => false);

  const [stats, recentTracks, topTracks, recentArticles, latestVideos, playlistRows, signups, signupCount, fanCount, playCount] =
    await Promise.all([
      getSiteStats(),
      listTracks({ sort: "recent", limit: 6 }),
      listTracks({ sort: "plays", limit: 6 }),
      listArticles({ limit: 4, status: "published" }),
      listVideos({ limit: 4 }),
      listPlaylists(),
      db.select().from(newsletterSignups).orderBy(desc(newsletterSignups.createdAt)).limit(6),
      db.select({ value: count() }).from(newsletterSignups),
      db.select({ value: count() }).from(profiles).where(eq(profiles.role, "fan")),
      db.select({ value: count() }).from(playEvents),
    ]);

  const counts: Record<string, number> = {
    artists: stats.artists,
    genres: stats.genres,
    albums: stats.albums,
    tracks: stats.tracks,
    videos: stats.videos,
    articles: stats.articles,
    playlists: stats.playlists,
    banners: 0,
  };

  const kpis = [
    { label: "Écoutes cumulées", value: stats.plays, Icon: SparkIcon, accent: "#FF6A1A" },
    { label: "Morceaux en ligne", value: stats.tracks, Icon: DiscIcon, accent: "#FFC53D" },
    { label: "Artistes référencés", value: stats.artists, Icon: MicIcon, accent: "#12B877" },
    { label: "Vues sur les clips", value: stats.videoViews, Icon: VideoIcon, accent: "#C084FC" },
    { label: "Articles publiés", value: stats.articles, Icon: NewsIcon, accent: "#60A5FA" },
    { label: "Inscrits newsletter", value: Number(signupCount[0]?.value ?? 0), Icon: QueueIcon, accent: "#F472B6" },
    { label: "Comptes fans", value: Number(fanCount[0]?.value ?? 0), Icon: UserIcon, accent: "#34D399" },
    { label: "Événements d'écoute", value: Number(playCount[0]?.value ?? 0), Icon: WaveIcon, accent: "#FB923C" },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav userName={user.name} />

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-400">
              {formatDate(new Date())} · Version 1 en production
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4.6vw,3.4rem)] uppercase leading-none text-cream">
              Bonjour, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-dim">
              Pilotez le catalogue, les clips, les playlists et la rédaction depuis un tableau de bord unique. Chaque
              modification est publiée immédiatement sur le site public.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
            >
              Voir le site <ArrowUpRightIcon width={14} height={14} />
            </a>
            <Link
              href="/admin/publier"
              className="flex items-center gap-2 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.03]"
            >
              Ajouter un morceau
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-5 transition hover:-translate-y-1 hover:border-white/25"
            >
              <span
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: kpi.accent }}
              />
              <kpi.Icon width={20} height={20} style={{ color: kpi.accent }} />
              <p className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] uppercase leading-none text-cream">
                <CountUp value={kpi.value} />
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">{kpi.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-[0.12em] text-cream">
            Gestion des contenus
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ENTITY_KEYS.map((key) => {
              const config = ENTITY_CONFIGS[key];
              return (
                <Link
                  key={key}
                  href={`/admin/${key}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-5 py-4 transition hover:-translate-y-0.5 hover:border-mango-500/50 hover:bg-ink-850"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-sm font-extrabold text-cream">
                      {config.labelPlural}
                    </span>
                    <span className="mt-0.5 block text-[11px] uppercase tracking-[0.16em] text-cream-mute">
                      {key === "banners" ? "carrousel d'accueil" : config.description.split(" :")[0].slice(0, 46)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-xl text-mango-500">
                      {counts[key] ? formatCompactNumber(counts[key]) : "—"}
                    </span>
                    <ArrowUpRightIcon
                      width={15}
                      height={15}
                      className="text-cream-mute transition group-hover:translate-x-0.5 group-hover:text-mango-400"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
                Dernières sorties
              </h2>
              <Link href="/admin/tracks" className="text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 hover:underline">
                Gérer
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-white/5">
              {recentTracks.map((track) => (
                <li key={track.id} className="flex items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={track.coverUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-sm font-bold text-cream">{track.title}</span>
                    <span className="block truncate text-[12px] text-cream-mute">
                      {track.artistName} · {formatDate(track.releaseDate)}
                    </span>
                  </span>
                  <span className="text-[12px] tabular-nums text-cream-dim">{formatCompactNumber(track.plays)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
                Top écoutes
              </h2>
              <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 hover:underline">
                Voir le chart
              </Link>
            </div>
            <ol className="mt-4 space-y-2">
              {topTracks.map((track, index) => (
                <li key={track.id} className="flex items-center gap-3">
                  <span className="w-7 font-display text-lg text-cream-mute">{String(index + 1).padStart(2, "0")}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-mango-500 to-gold-400 transition-all duration-1000"
                      style={{ width: `${Math.max(6, (track.plays / (topTracks[0]?.plays || 1)) * 100)}%` }}
                    />
                  </span>
                  <span className="w-40 truncate text-[13px] text-cream-dim">{track.title}</span>
                  <span className="w-16 text-right text-[12px] tabular-nums text-cream-mute">
                    {formatCompactNumber(track.plays)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
                Rédaction
              </h2>
              <Link href="/admin/articles" className="text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 hover:underline">
                Gérer
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {recentArticles.map((article) => (
                <li key={article.id}>
                  <Link href={`/actualites/${article.slug}`} className="group block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-400">
                      {article.category}
                    </span>
                    <span className="mt-1 block font-heading text-sm font-bold leading-snug text-cream transition group-hover:text-mango-400">
                      {article.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-cream-mute">
                      {formatDate(article.publishedAt)} · {formatCompactNumber(article.views)} lectures
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">Clips</h2>
              <Link href="/admin/videos" className="text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 hover:underline">
                Gérer
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {latestVideos.map((video) => (
                <li key={video.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.thumbnailUrl} alt="" className="h-12 w-20 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-sm font-bold text-cream">{video.title}</span>
                    <span className="block truncate text-[12px] text-cream-mute">
                      {video.artistName} · {formatCompactNumber(video.views)} vues
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/10 pt-4 text-[12px] text-cream-mute">
              {playlistRows.length} playlists éditoriales actives ·{" "}
              <Link href="/admin/playlists" className="text-mango-400 hover:underline">
                composer les tracklists
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-cream">
              Newsletter
            </h2>
            <p className="mt-2 text-[13px] text-cream-dim">
              {Number(signupCount[0]?.value ?? 0)} adresse{Number(signupCount[0]?.value ?? 0) > 1 ? "s" : ""} collectée
              {Number(signupCount[0]?.value ?? 0) > 1 ? "s" : ""} depuis le pied de page.
            </p>
            <ul className="mt-4 space-y-2">
              {signups.map((signup) => (
                <li
                  key={signup.id}
                  className="flex items-center justify-between rounded-lg border border-white/8 bg-ink-950/50 px-3 py-2 text-[12px]"
                >
                  <span className="truncate text-cream-dim">{signup.email}</span>
                  <span className="ml-2 shrink-0 text-cream-mute">{formatDate(signup.createdAt)}</span>
                </li>
              ))}
              {signups.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[12px] text-cream-mute">
                  Aucune inscription pour le moment.
                </li>
              )}
            </ul>
            <div className="mt-5 rounded-xl border border-baobab-500/30 bg-baobab-500/8 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-baobab-400">Prochaine étape (V2)</p>
              <p className="mt-1 text-[12px] leading-relaxed text-cream-dim">
                Espace Artiste en auto-publication + abonnements Premium payés en Mobile Money (Wave, Orange, MTN, Moov).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
