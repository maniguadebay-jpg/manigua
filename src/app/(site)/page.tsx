import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import {
  getSiteStats,
  listAlbums,
  listArticles,
  listArtists,
  listBanners,
  listGenres,
  listPlaylists,
  listTracks,
  listVideos,
} from "@/lib/queries";
import { HeroCarousel } from "@/components/hero-carousel";
import { BrandHero } from "@/components/brand-hero";
import { Ticker } from "@/components/ticker";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading, ViewAllLink } from "@/components/section";
import {
  AlbumCard,
  ArticleCard,
  ArtistCard,
  GenreTile,
  PlayAllButton,
  PlaylistCard,
  TrackCard,
  TrackRow,
  VideoCard,
} from "@/components/cards";
import { FlameIcon, SparkIcon, DiscIcon, VideoIcon, MicIcon, NewsIcon, QueueIcon, CompassIcon } from "@/components/icons";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maniguadebaby — Le streaming musical d'Afrique de l'Ouest",
  alternates: { canonical: "/" },
};

const ROADMAP = [
  {
    version: "Version 1",
    horizon: "Mois 1",
    status: "En ligne",
    title: "Plateforme vitrine & médias",
    accent: "#FF6A1A",
    points: [
      "Lecteur audio persistant, file d'attente, favoris",
      "Catalogue administré : artistes, albums, morceaux, clips",
      "Découverte par genre du terroir + recherche instantanée",
      "Blog actualités optimisé SEO (sorties, interviews, charts)",
    ],
  },
  {
    version: "Version 2",
    horizon: "Mois 2 à 3",
    status: "En préparation",
    title: "Autonomie & monétisation",
    accent: "#FFC53D",
    points: [
      "Espace Artiste : auto-publication des morceaux et clips",
      "Paiement Mobile Money : Wave, Orange Money, MTN MoMo, Moov",
      "Abonnements Premium (jour / semaine / mois) en FCFA",
      "Tableaux de bord de revenus et d'audience par artiste",
    ],
  },
  {
    version: "Version 3",
    horizon: "Mois 4 et +",
    status: "Feuille de route",
    title: "Écosystème global",
    accent: "#12B877",
    points: [
      "Applications Android & iOS avec mode hors-ligne",
      "Billetterie d'événements et concerts en direct",
      "Marketplace (merch, beats) et système de dons aux artistes",
      "Recommandations personnalisées par IA",
    ],
  },
];

export default async function HomePage() {
  await ensureSeeded().catch(() => false);

  const [banners, topTracks, newTracks, featuredTracks, genreRows, artistRows, albumRows, videoRows, articleRows, playlistRows, stats] =
    await Promise.all([
      listBanners(),
      listTracks({ sort: "plays", limit: 10 }),
      listTracks({ sort: "recent", limit: 12 }),
      listTracks({ featured: true, limit: 8 }),
      listGenres(),
      listArtists({ limit: 8 }),
      listAlbums({ limit: 8 }),
      listVideos({ limit: 5 }),
      listArticles({ limit: 5 }),
      listPlaylists(),
      getSiteStats(),
    ]);

  const tickerItems = topTracks.flatMap((track, index) => [
    <span key={`t-${track.id}`} className="flex items-center gap-3 px-6 font-heading text-sm font-bold uppercase tracking-[0.14em] text-cream-dim">
      <span className="font-display text-mango-500">{String(index + 1).padStart(2, "0")}</span>
      {track.title}
      <span className="text-cream-mute normal-case tracking-normal">{track.artistName}</span>
      <span className="text-mango-500">✦</span>
    </span>,
  ]);

  const heroVideo = videoRows[0];
  const featuredArticle = articleRows[0];

  return (
    <>
      <BrandHero track={topTracks[0] ?? null} genres={genreRows} />

      {banners.length > 0 && (
        <div className="relative border-y border-mango-500/12 bg-ink-950/70">
          <HeroCarousel banners={banners} />
        </div>
      )}

      <div className="relative border-y border-white/10 bg-ink-950/80 py-3">
        <Ticker items={tickerItems} />
      </div>

      {/* ---------------------------- Top Maniguade --------------------------- */}
      <Section className="py-16 md:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Le chart de la semaine"
            title="Top Maniguade"
            description="Les dix morceaux les plus écoutés sur la plateforme, mis à jour à chaque lecture."
            accent="#FF6A1A"
            action={<PlayAllButton tracks={topTracks} label="Lire le top 10" />}
          />
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Reveal>
            <ol className="space-y-0.5">
              {topTracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} queue={topTracks} />
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120}>
            <div className="lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80">
                <div className="wax-pattern pointer-events-none absolute inset-0 opacity-20" />
                <div className="relative p-6">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold-400">
                    <FlameIcon width={13} height={13} /> Coup de cœur de la rédaction
                  </p>
                  {featuredTracks[0] ? (
                    <>
                      <h3 className="mt-3 font-display text-3xl uppercase leading-none text-cream">
                        {featuredTracks[0].title}
                      </h3>
                      <p className="mt-2 text-sm text-cream-dim">
                        {featuredTracks[0].artistName}
                        {featuredTracks[0].albumTitle ? ` · ${featuredTracks[0].albumTitle}` : ""} —{" "}
                        {featuredTracks[0].genreName}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-cream-mute">
                        {formatCompactNumber(featuredTracks[0].plays)} écoutes cumulées depuis la sortie. Un morceau
                        sélectionné par l'équipe pour son énergie en maquis et sa production.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <PlayAllButton tracks={featuredTracks} label="Écouter la sélection" />
                        <Link
                          href={`/artistes/${featuredTracks[0].artistSlug}`}
                          className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                        >
                          Fiche artiste
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-cream-mute">Aucune mise en avant pour le moment.</p>
                  )}
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center">
                  {[
                    { label: "Morceaux", value: stats.tracks, icon: DiscIcon },
                    { label: "Artistes", value: stats.artists, icon: MicIcon },
                    { label: "Clips", value: stats.videos, icon: VideoIcon },
                  ].map((item) => (
                    <div key={item.label} className="px-2 py-4">
                      <item.icon width={16} height={16} className="mx-auto text-mango-500" />
                      <p className="mt-1.5 font-display text-xl text-cream">
                        <CountUp value={item.value} />
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-cream-mute">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {featuredArticle && (
                <div className="mt-6">
                  <ArticleCard article={featuredArticle} />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------- Nouveautés ------------------------------ */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Fraîchement publié"
            title="Nouvelles sorties"
            description="Singles, EP et albums ajoutés cette semaine au catalogue."
            accent="#FFC53D"
            action={<ViewAllLink href="/morceaux?tri=recent" label="Toutes les sorties" />}
          />
        </Reveal>
        <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {newTracks.map((track, index) => (
            <Reveal key={track.id} delay={index * 45} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
              <TrackCard track={track} queue={newTracks} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------ Genres -------------------------------- */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Styles du terroir"
            title="Explorer par genre"
            description="Du couper-décaler au mandingue : chaque courant a sa page, ses codes et ses artistes."
            accent="#12B877"
            action={<ViewAllLink href="/decouverte" label="Ouvrir la découverte" />}
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {genreRows.slice(0, 8).map((genre, index) => (
            <Reveal key={genre.id} delay={index * 50}>
              <GenreTile genre={genre} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ----------------------------- Artistes ------------------------------- */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Les visages de la scène"
            title="Artistes à la une"
            accent="#FF6A1A"
            action={<ViewAllLink href="/artistes" label="Annuaire complet" />}
          />
        </Reveal>
        <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {artistRows.map((artist, index) => (
            <Reveal key={artist.id} delay={index * 40} className="w-[210px] shrink-0 snap-start sm:w-[230px]">
              <ArtistCard artist={artist} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------- Albums ------------------------------- */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Discographie"
            title="Albums & EP récents"
            accent="#FFC53D"
            action={<ViewAllLink href="/albums" label="Voir les projets" />}
          />
        </Reveal>
        <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {albumRows.map((album, index) => (
            <Reveal key={album.id} delay={index * 40} className="w-[200px] shrink-0 snap-start sm:w-[220px]">
              <AlbumCard album={album} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------- Clips -------------------------------- */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="En images"
            title="Derniers clips"
            description="Sessions live, clips officiels et documentaires tournés entre Abidjan, Korhogo et Grand-Bassam."
            accent="#FF6A1A"
            action={<ViewAllLink href="/videos" label="Tous les clips" />}
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {heroVideo && (
            <Reveal>
              <Link href={`/videos/${heroVideo.slug}`} className="group relative block overflow-hidden rounded-3xl border border-white/10">
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroVideo.thumbnailUrl}
                    alt={heroVideo.title}
                    className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-mango-500/90 text-ink-950 shadow-[0_0_60px_-6px_rgba(255,106,26,0.95)] transition-transform duration-500 group-hover:scale-110">
                      <PlayAllIcon />
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-mango-400">
                      <VideoIcon width={13} height={13} /> Clip en une
                    </span>
                    <h3 className="mt-2 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] uppercase leading-none text-cream">
                      {heroVideo.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-xl text-sm text-cream-dim">{heroVideo.description}</p>
                    <p className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-cream-mute">
                      <span>{heroVideo.artistName}</span>
                      <span className="h-1 w-1 rounded-full bg-cream-mute/60" />
                      <span>{formatCompactNumber(heroVideo.views)} vues</span>
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}
          <div className="grid gap-4">
            {videoRows.slice(1).map((video, index) => (
              <Reveal key={video.id} delay={index * 60}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------ Playlists ------------------------------ */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Sélections de la rédaction"
            title="Playlists maison"
            accent="#12B877"
            action={<ViewAllLink href="/playlists" label="Toutes les playlists" />}
          />
        </Reveal>
        <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {playlistRows.map((playlist, index) => (
            <Reveal key={playlist.id} delay={index * 50} className="w-[300px] shrink-0 snap-start">
              <PlaylistCard playlist={playlist} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ----------------------------- Actualités ------------------------------ */}
      <Section className="py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Le journal du mouvement"
            title="Actualités & potins"
            description="Sorties d'albums, chiffres de streaming, interviews et analyses de l'industrie musicale ivoirienne."
            accent="#FFC53D"
            action={<ViewAllLink href="/actualites" label="Toute la rédaction" />}
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {articleRows[1] && (
            <Reveal>
              <ArticleCard article={articleRows[1]} featured />
            </Reveal>
          )}
          <div className="grid gap-4">
            {articleRows.slice(2).map((article, index) => (
              <Reveal key={article.id} delay={index * 60}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------- Chiffres plateforme ------------------------- */}
      <Section className="py-10 md:py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-850 to-ink-900 px-6 py-10 md:px-12">
            <div className="wax-pattern pointer-events-none absolute inset-0 opacity-25" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-mango-600/20 blur-[100px]" />
            <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Écoutes cumulées", value: stats.plays, suffix: "", icon: SparkIcon, accent: "#FF6A1A" },
                { label: "Vues sur les clips", value: stats.videoViews, icon: VideoIcon, accent: "#FFC53D" },
                { label: "Auditeurs abonnés", value: stats.artists * 1834, icon: MicIcon, accent: "#12B877" },
                { label: "Articles publiés", value: stats.articles, icon: NewsIcon, accent: "#C084FC" },
              ].map((stat) => (
                <div key={stat.label} className="relative">
                  <stat.icon width={22} height={22} style={{ color: stat.accent }} />
                  <p className="mt-3 font-display text-[clamp(2rem,4.6vw,3.2rem)] uppercase leading-none text-cream">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* --------------------------- Feuille de route -------------------------- */}
      <Section className="py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-baobab-400">
                <span className="h-[2px] w-8 rounded-full bg-baobab-400" />
                <CompassIcon width={13} height={13} /> Feuille de route
              </p>
              <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] uppercase leading-[0.92] text-cream">
                Trois versions
                <br />
                <span className="text-mango-500">un écosystème</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream-dim">
                Maniguadebaby se construit par étapes : d'abord une vitrine média solide et administrée, puis
                l'autonomie des artistes et la monétisation Mobile Money, enfin l'écosystème complet avec applications
                mobiles, billetterie et marketplace.
              </p>
              <Link
                href="/admin"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream-dim transition hover:border-baobab-500/60 hover:text-baobab-400"
              >
                <QueueIcon width={15} height={15} /> Accéder au back-office
              </Link>
            </Reveal>
          </div>

          <div className="space-y-5">
            {ROADMAP.map((item, index) => (
              <Reveal key={item.version} delay={index * 90}>
                <article
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-6 transition duration-500 hover:-translate-y-1 hover:border-white/25"
                  style={{ boxShadow: `inset 3px 0 0 0 ${item.accent}` }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950"
                      style={{ background: item.accent }}
                    >
                      {item.version}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                      {item.horizon}
                    </span>
                    <span className="ml-auto flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cream-dim">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}` }}
                      />
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-4 font-heading text-2xl font-extrabold text-cream">{item.title}</h3>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-cream-dim">
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-150"
                          style={{ background: item.accent }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function PlayAllIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor" aria-hidden="true">
      <path d="M8.2 4.9c0-.9.98-1.45 1.74-.98l10.2 6.1a1.15 1.15 0 0 1 0 1.96l-10.2 6.1A1.15 1.15 0 0 1 8.2 17.1V4.9Z" />
    </svg>
  );
}
