import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listArtists, listTracks } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { ArtistCard, TrackCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { MicIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artistes — Annuaire de la scène ouest-africaine",
  description:
    "Fiches artistes Maniguadebaby : biographies, discographies, clips et morceaux les plus écoutés de la scène ivoirienne et ouest-africaine.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ArtistesPage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);
  const q = params.q ?? "";
  const [artistRows, trendingTracks] = await Promise.all([
    listArtists({ search: q || undefined, limit: 60 }),
    listTracks({ sort: "plays", limit: 8 }),
  ]);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_20%_0%,rgba(255,106,26,0.22),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-mango-400">
            <MicIcon width={14} height={14} /> Annuaire
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Les artistes <span className="text-stroke">du mouvement</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            Ambianceurs, griottes, rappeurs nouchi, voix gospel et groupes zouglou : {artistRows.length} profils
            documentés avec biographie, discographie, clips et statistiques d'écoute.
          </p>
          <form method="get" action="/artistes" className="mt-7 flex max-w-md gap-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher un artiste, une ville…"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-ink-950/60 px-5 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/70 focus:border-mango-500/70"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
            >
              Chercher
            </button>
          </form>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading eyebrow={`${artistRows.length} profils`} title="Tous les artistes" accent="#FF6A1A" />
        </Reveal>
        {artistRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
            Aucun artiste ne correspond à « {q} ».
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artistRows.map((artist, index) => (
              <Reveal key={artist.id} delay={Math.min(index, 8) * 45}>
                <ArtistCard artist={artist} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section className="py-8 md:py-12">
        <Reveal>
          <SectionHeading eyebrow="Le plus écouté" title="Morceaux qui font vibrer le pays" accent="#FFC53D" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingTracks.map((track, index) => (
            <Reveal key={track.id} delay={index * 45}>
              <TrackCard track={track} queue={trendingTracks} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
