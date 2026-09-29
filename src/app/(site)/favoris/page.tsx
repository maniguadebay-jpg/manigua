import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { PROFILE_COOKIE, VISITOR_COOKIE, getProfile } from "@/lib/auth";
import { loadFavoriteBundle } from "@/lib/favorites-query";
import { Section, SectionHeading } from "@/components/section";
import { AlbumCard, ArticleCard, ArtistCard, PlayAllButton, TrackRow, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { HeartIcon, UserIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouvez tous les morceaux, artistes, albums, clips et articles enregistrés dans vos favoris.",
};

export default async function FavorisPage() {
  await ensureSeeded().catch(() => false);
  const store = await cookies();
  const profile = await getProfile();
  const visitorId = store.get(VISITOR_COOKIE)?.value ?? null;

  const bundle = await loadFavoriteBundle({ userId: profile?.id ?? null, visitorId });

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,106,26,0.24),transparent_60%)]" />
        <Section className="relative py-14 md:py-18">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-mango-400">
            <HeartIcon width={14} height={14} filled /> Bibliothèque
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.2rem)] uppercase leading-[0.88] text-cream">
            {profile ? `Favoris de ${profile.displayName}` : "Mes favoris"}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            {bundle.total === 0
              ? "Aucun favori pour l'instant. Cliquez sur le cœur d'un morceau, d'un artiste, d'un clip ou d'un article pour le retrouver ici."
              : `${bundle.total} élément${bundle.total > 1 ? "s" : ""} enregistré${bundle.total > 1 ? "s" : ""} — morceaux, artistes, albums, clips et articles.`}
          </p>

          {!profile && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-ink-900/70 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mango-500/15 text-mango-400">
                <UserIcon width={17} height={17} />
              </span>
              <p className="max-w-xl text-sm text-cream-dim">
                Vos favoris sont liés à ce navigateur. Créez un compte fan gratuit pour les retrouver sur tous vos
                appareils et suivre votre historique d'écoute.
              </p>
              <Link
                href="/connexion"
                className="ml-auto rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.03]"
              >
                Créer mon compte
              </Link>
            </div>
          )}

          {bundle.tracks.length > 0 && (
            <div className="mt-7">
              <PlayAllButton tracks={bundle.tracks} label={`Lire mes ${bundle.tracks.length} morceaux`} />
            </div>
          )}
        </Section>
      </div>

      {bundle.total === 0 && (
        <Section className="py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/morceaux", label: "Parcourir les morceaux", emoji: "🎧" },
              { href: "/artistes", label: "Découvrir les artistes", emoji: "🎤" },
              { href: "/videos", label: "Regarder les clips", emoji: "🎬" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-dashed border-white/14 bg-ink-900/50 p-6 transition hover:-translate-y-1 hover:border-mango-500/50"
              >
                <span className="block text-3xl transition-transform duration-500 group-hover:scale-110">{item.emoji}</span>
                <span className="mt-3 block font-heading text-base font-extrabold text-cream">{item.label}</span>
                <span className="mt-1 block text-[12px] uppercase tracking-[0.16em] text-mango-400">Commencer →</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {bundle.tracks.length > 0 && (
        <Section className="py-12">
          <Reveal>
            <SectionHeading eyebrow={`${bundle.tracks.length} titres`} title="Morceaux aimés" accent="#FF6A1A" />
          </Reveal>
          <Reveal>
            <ol className="space-y-0.5">
              {bundle.tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} queue={bundle.tracks} />
              ))}
            </ol>
          </Reveal>
        </Section>
      )}

      {bundle.artists.length > 0 && (
        <Section className="py-8">
          <Reveal>
            <SectionHeading eyebrow="Suivis" title="Artistes" accent="#12B877" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bundle.artists.map((artist, index) => (
              <Reveal key={artist.id} delay={index * 45}>
                <ArtistCard artist={artist} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {bundle.albums.length > 0 && (
        <Section className="py-8">
          <Reveal>
            <SectionHeading eyebrow="Projets" title="Albums" accent="#FFC53D" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bundle.albums.map((album, index) => (
              <Reveal key={album.id} delay={index * 45}>
                <AlbumCard album={album} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {bundle.videos.length > 0 && (
        <Section className="py-8">
          <Reveal>
            <SectionHeading eyebrow="À revoir" title="Clips" accent="#C084FC" />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.videos.map((video, index) => (
              <Reveal key={video.id} delay={index * 50}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {bundle.articles.length > 0 && (
        <Section className="py-8">
          <Reveal>
            <SectionHeading eyebrow="Lecture" title="Articles" accent="#FFC53D" />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {bundle.articles.map((article, index) => (
              <Reveal key={article.id} delay={index * 50}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
