import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listArtists, listGenres, listTracks } from "@/lib/queries";
import { Section, SectionHeading, ViewAllLink } from "@/components/section";
import { ArtistCard, GenreTile, PlayAllButton, TrackCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { CompassIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Découverte & genres musicaux",
  description:
    "Explorez le catalogue Maniguadebaby par genre : couper-décaler, zouglou, mandingue, rap ivoire, afro-pop, gospel, reggae, mapouka et afro-drill.",
};

const SORTS = [
  { value: "trending", label: "Tendances" },
  { value: "plays", label: "Les plus écoutés" },
  { value: "recent", label: "Sorties récentes" },
  { value: "likes", label: "Les plus aimés" },
  { value: "az", label: "Ordre alphabétique" },
];

type Props = { searchParams: Promise<{ genre?: string; tri?: string; q?: string }> };

export default async function DecouvertePage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);

  const genreSlug = params.genre ?? "";
  const sort = (SORTS.find((s) => s.value === params.tri)?.value ?? "trending") as
    | "trending" |"plays" |"recent" |"likes" |"az";
  const q = params.q ?? "";

  const [genreRows, tracks, genreArtists] = await Promise.all([
    listGenres(),
    listTracks({ genreSlug: genreSlug || undefined, search: q || undefined, sort, limit: 60 }),
    genreSlug
      ? listTracks({ genreSlug, sort: "plays", limit: 8 }).then(async (rows) => {
          const slugs = Array.from(new Set(rows.map((r) => r.artistSlug)));
          const all = await listArtists({ limit: 100 });
          return all.filter((artist) => slugs.includes(artist.slug));
        })
      : Promise.resolve([]),
  ]);

  const activeGenre = genreRows.find((genre) => genre.slug === genreSlug);

  const buildHref = (next: { genre?: string; tri?: string; q?: string }) => {
    const search = new URLSearchParams();
    const genre = next.genre !== undefined ? next.genre : genreSlug;
    const tri = next.tri !== undefined ? next.tri : sort;
    const query = next.q !== undefined ? next.q : q;
    if (genre) search.set("genre", genre);
    if (tri && tri !== "trending") search.set("tri", tri);
    if (query) search.set("q", query);
    const value = search.toString();
    return `/decouverte${value ? `?${value}` : ""}`;
  };

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_15%_0%,rgba(18,184,119,0.22),transparent_60%),radial-gradient(70%_100%_at_90%_10%,rgba(255,106,26,0.2),transparent_60%)]" />
        <div className="wax-pattern pointer-events-none absolute inset-0 opacity-[0.12]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-baobab-400">
            <CompassIcon width={14} height={14} /> Découverte
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Tous les sons <span className="text-mango-500">du terroir</span>, au même endroit
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            Filtrez par style musical, triez selon vos envies et lancez la lecture : le lecteur reste actif pendant toute
            votre navigation. {tracks.length} morceaux correspondent à votre recherche.
          </p>

          <form method="get" action="/decouverte" className="mt-8 flex flex-wrap items-center gap-3">
            {activeGenre && <input type="hidden" name="genre" value={activeGenre.slug} />}
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-white/15 bg-ink-950/60 px-4 py-3 focus-within:border-mango-500/70">
              <SearchIcon width={16} height={16} className="text-cream-mute" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Filtrer par titre, artiste ou album…"
                className="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-cream-mute/70"
              />
            </div>
            <select
              name="tri"
              defaultValue={sort}
              className="rounded-full border border-white/15 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/70"
              aria-label="Trier les résultats"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink-900">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03] active:scale-95"
            >
              Filtrer
            </button>
          </form>

          <div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildHref({ genre: "" })}
              className={`shrink-0 rounded-full border px-4 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                !activeGenre
                  ? "border-mango-500 bg-mango-500/15 text-mango-400" :"border-white/12 text-cream-dim hover:border-white/30 hover:text-cream"
              }`}
            >
              Tous les genres
            </Link>
            {genreRows.map((genre) => (
              <Link
                key={genre.id}
                href={buildHref({ genre: genre.slug })}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                  activeGenre?.slug === genre.slug
                    ? "border-mango-500 bg-mango-500/15 text-mango-400" :"border-white/12 text-cream-dim hover:border-white/30 hover:text-cream"
                }`}
              >
                <span>{genre.emoji}</span>
                {genre.name}
                <span className="text-[10px] text-cream-mute">{genre.trackCount}</span>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading
            eyebrow={activeGenre ? `${activeGenre.emoji} ${activeGenre.name}` : "Catalogue complet"}
            title={activeGenre ? activeGenre.name : "Tous les morceaux"}
            description={activeGenre ? activeGenre.description : undefined}
            accent={activeGenre ? activeGenre.colorFrom : "#FF6A1A"}
            action={<PlayAllButton tracks={tracks} label={`Lire ${tracks.length} titres`} />}
          />
        </Reveal>

        {tracks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
            Aucun morceau ne correspond à ces filtres. Essayez un autre genre ou réinitialisez la recherche.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((track, index) => (
              <Reveal key={track.id} delay={Math.min(index, 8) * 45}>
                <TrackCard track={track} queue={tracks} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {genreArtists.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading
              eyebrow="Ils portent le genre"
              title={`Artistes ${activeGenre?.name ?? ""}`}
              accent={activeGenre?.colorFrom ?? "#12B877"}
              action={<ViewAllLink href="/artistes" label="Tous les artistes" />}
            />
          </Reveal>
          <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {genreArtists.map((artist, index) => (
              <Reveal key={artist.id} delay={index * 40} className="w-[210px] shrink-0 sm:w-[230px]">
                <ArtistCard artist={artist} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section className="py-8 md:py-16">
        <Reveal>
          <SectionHeading eyebrow="Neuf courants" title="Parcourir par genre" accent="#12B877" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {genreRows.map((genre, index) => (
            <Reveal key={genre.id} delay={index * 45}>
              <GenreTile genre={genre} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
