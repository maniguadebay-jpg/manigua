import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { searchAll } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { ArticleCard, TrackCard, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { CompassIcon, SearchIcon } from "@/components/icons";
import { formatCompactNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recherche globale",
  description: "Recherchez un artiste, un morceau, un album, un clip ou un article sur Maniguadebaby.",
};

type Props = { searchParams: Promise<{ q?: string }> };

const SUGGESTIONS = ["Couper-décaler", "Zouglou", "Aya Koffi", "Kora", "Abidjan", "Allo Coco", "Rap Ivoire"];

export default async function RecherchePage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);
  const q = (params.q ?? "").trim();
  const results = q ? await searchAll(q, 12) : null;
  const total = results
    ? results.tracks.length + results.artists.length + results.albums.length + results.videos.length + results.articles.length
    : 0;

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(255,106,26,0.2),transparent_60%)]" />
        <Section className="relative py-14 md:py-18">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-mango-400">
            <SearchIcon width={14} height={14} /> Recherche
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6.4vw,4.6rem)] uppercase leading-[0.9] text-cream">
            {q ? `Résultats pour « ${q} »` : "Que cherchez-vous ?"}
          </h1>

          <form method="get" action="/recherche" className="mt-7 flex max-w-2xl gap-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Artiste, titre, album, clip, article…"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-ink-950/70 px-5 py-3.5 text-sm text-cream outline-none placeholder:text-cream-mute/70 focus:border-mango-500/70"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-cream-mute">Suggestions :</span>
            {SUGGESTIONS.map((suggestion) => (
              <Link
                key={suggestion}
                href={`/recherche?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full border border-white/12 px-3 py-1.5 text-[12px] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
              >
                {suggestion}
              </Link>
            ))}
          </div>

          {results && (
            <p className="mt-6 text-sm text-cream-mute">
              {total} résultat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""} dans le catalogue et la rédaction.
            </p>
          )}
        </Section>
      </div>

      {results && (
        <>
          {results.artists.length > 0 && (
            <Section className="py-10">
              <Reveal>
                <SectionHeading eyebrow="Profils" title="Artistes" accent="#FF6A1A" />
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.artists.map((artist, index) => (
                  <Reveal key={artist.id} delay={index * 45}>
                    <Link
                      href={`/artistes/${artist.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4 transition hover:-translate-y-1 hover:border-mango-500/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artist.coverUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate font-heading text-base font-extrabold text-cream">{artist.name}</span>
                        <span className="mt-0.5 block text-[12px] text-cream-mute">{artist.city}</span>
                        <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-mango-400">
                          {formatCompactNumber(artist.followers)} abonnés
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Section>
          )}

          {results.tracks.length > 0 && (
            <Section className="py-10">
              <Reveal>
                <SectionHeading eyebrow="Catalogue audio" title="Morceaux" accent="#FFC53D" />
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.tracks.map((track, index) => (
                  <Reveal key={track.id} delay={index * 45}>
                    <TrackCard track={track} queue={results.tracks} />
                  </Reveal>
                ))}
              </div>
            </Section>
          )}

          {results.albums.length > 0 && (
            <Section className="py-10">
              <Reveal>
                <SectionHeading eyebrow="Discographie" title="Albums" accent="#12B877" />
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.albums.map((album, index) => (
                  <Reveal key={album.id} delay={index * 45}>
                    <Link
                      href={`/albums/${album.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4 transition hover:-translate-y-1 hover:border-gold-400/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={album.coverUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate font-heading text-base font-extrabold text-cream">{album.title}</span>
                        <span className="mt-0.5 block truncate text-[12px] text-cream-mute">{album.artistName}</span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Section>
          )}

          {results.videos.length > 0 && (
            <Section className="py-10">
              <Reveal>
                <SectionHeading eyebrow="En images" title="Clips" accent="#C084FC" />
              </Reveal>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.videos.map((video, index) => (
                  <Reveal key={video.id} delay={index * 50}>
                    <VideoCard video={video} />
                  </Reveal>
                ))}
              </div>
            </Section>
          )}

          {results.articles.length > 0 && (
            <Section className="py-10">
              <Reveal>
                <SectionHeading eyebrow="Rédaction" title="Actualités" accent="#FFC53D" />
              </Reveal>
              <div className="grid gap-5 md:grid-cols-2">
                {results.articles.map((article, index) => (
                  <Reveal key={article.id} delay={index * 50}>
                    <ArticleCard article={article} />
                  </Reveal>
                ))}
              </div>
            </Section>
          )}

          {total === 0 && (
            <Section className="py-16">
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center">
                <CompassIcon width={30} height={30} className="text-mango-500" />
                <h2 className="font-display text-3xl uppercase text-cream">Rien ne correspond</h2>
                <p className="max-w-md text-sm text-cream-mute">
                  Essayez un nom d'artiste (Aya Koffi, DJ Kalou Star), un genre (zouglou, mandingue) ou un mot-clé de la
                  rédaction (mobile money, maquis).
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/recherche?q=${encodeURIComponent(suggestion)}`}
                      className="rounded-full border border-white/12 px-4 py-2 text-[12px] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </>
      )}

      {!results && (
        <Section className="py-14">
          <p className="max-w-xl text-sm leading-relaxed text-cream-mute">
            Astuce : la recherche instantanée est aussi accessible depuis la barre de menu avec le raccourci{" "}
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-cream">⌘K</kbd>. Elle interroge
            les titres, artistes, albums, clips et articles en même temps. Dernière mise à jour du catalogue :{" "}
            {formatDate(new Date())}.
          </p>
        </Section>
      )}
    </>
  );
}
