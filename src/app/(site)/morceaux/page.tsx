import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listGenres, listTracks } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { PlayAllButton, TrackRow } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { DiscIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tous les morceaux",
  description: "Catalogue complet des morceaux disponibles en streaming sur Maniguadebaby : tops, nouveautés et pépites.",
};

const SORTS = [
  { value: "plays", label: "Les plus écoutés" },
  { value: "recent", label: "Sorties récentes" },
  { value: "likes", label: "Les plus aimés" },
  { value: "az", label: "Ordre alphabétique" },
  { value: "trending", label: "Tendances" },
];

const PAGE_SIZE = 24;

type Props = {
  searchParams: Promise<{ tri?: string; genre?: string; artiste?: string; q?: string; page?: string }>;
};

export default async function MorceauxPage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);

  const sort = (SORTS.find((s) => s.value === params.tri)?.value ?? "plays") as
    | "plays" |"recent" |"likes" |"az" |"trending";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const genre = params.genre ?? "";
  const artiste = params.artiste ?? "";
  const q = params.q ?? "";

  const [genreRows, allMatching] = await Promise.all([
    listGenres(),
    listTracks({
      sort,
      genreSlug: genre || undefined,
      artistSlug: artiste || undefined,
      search: q || undefined,
      limit: 400,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(allMatching.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTracks = allMatching.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const buildHref = (overrides: Record<string, string | number>) => {
    const search = new URLSearchParams({ tri: sort });
    if (genre) search.set("genre", genre);
    if (artiste) search.set("artiste", artiste);
    if (q) search.set("q", q);
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) search.delete(key);
      else search.set(key, String(value));
    });
    return `/morceaux?${search.toString()}`;
  };

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_10%_0%,rgba(255,106,26,0.22),transparent_60%)]" />
        <Section className="relative py-14 md:py-18">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-mango-400">
            <DiscIcon width={14} height={14} /> Catalogue
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Tous les morceaux
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            {allMatching.length} titres disponibles{genre ? ` dans le genre sélectionné` : ""}
            {artiste ? ` pour cet artiste` : ""}. Cliquez sur une ligne pour lancer la lecture : le lecteur vous suit
            partout sur le site.
          </p>

          <form method="get" action="/morceaux" className="mt-8 flex flex-wrap items-center gap-3">
            <input type="hidden" name="tri" value={sort} />
            {genre && <input type="hidden" name="genre" value={genre} />}
            {artiste && <input type="hidden" name="artiste" value={artiste} />}
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-white/15 bg-ink-950/60 px-4 py-3 focus-within:border-mango-500/70">
              <SearchIcon width={16} height={16} className="text-cream-mute" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Titre, artiste ou album…"
                className="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-cream-mute/70"
              />
            </div>
            <select
              name="tri"
              defaultValue={sort}
              className="rounded-full border border-white/15 bg-ink-950/60 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/70"
              aria-label="Trier"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink-900">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
            >
              Appliquer
            </button>
          </form>

          <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildHref({ genre: "" })}
              className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                !genre ? "border-mango-500 bg-mango-500/15 text-mango-400" : "border-white/12 text-cream-dim hover:text-cream"
              }`}
            >
              Tous
            </Link>
            {genreRows.map((item) => (
              <Link
                key={item.id}
                href={buildHref({ genre: item.slug, page: "" })}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                  genre === item.slug
                    ? "border-mango-500 bg-mango-500/15 text-mango-400" :"border-white/12 text-cream-dim hover:text-cream"
                }`}
              >
                {item.emoji} {item.name}
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading
            eyebrow={`Page ${currentPage} / ${totalPages}`}
            title={artiste ? `Morceaux de ${artiste}` : "La liste de lecture"}
            accent="#FF6A1A"
            action={<PlayAllButton tracks={pageTracks} label="Lire la page" />}
          />
        </Reveal>

        {pageTracks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
            Aucun morceau trouvé. Modifiez les filtres ou revenez au catalogue complet.
          </p>
        ) : (
          <Reveal>
            <ol className="space-y-0.5">
              {pageTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={(currentPage - 1) * PAGE_SIZE + index}
                  queue={allMatching}
                />
              ))}
            </ol>
          </Reveal>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
            {currentPage > 1 && (
              <Link
                href={buildHref({ page: currentPage - 1 })}
                className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
              >
                ← Précédent
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((value) => Math.abs(value - currentPage) < 3)
              .map((value) => (
                <Link
                  key={value}
                  href={buildHref({ page: value })}
                  className={`h-10 w-10 rounded-full border text-center font-display text-sm leading-[2.4rem] transition ${
                    value === currentPage
                      ? "border-mango-500 bg-mango-500/15 text-mango-400" :"border-white/12 text-cream-dim hover:border-white/30 hover:text-cream"
                  }`}
                >
                  {value}
                </Link>
              ))}
            {currentPage < totalPages && (
              <Link
                href={buildHref({ page: currentPage + 1 })}
                className="rounded-full border border-white/12 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
              >
                Suivant →
              </Link>
            )}
          </nav>
        )}
      </Section>
    </>
  );
}
