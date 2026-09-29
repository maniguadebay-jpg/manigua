import Link from "next/link";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listVideos } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { VideoIcon } from "@/components/icons";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clips vidéo & sessions live",
  description:
    "Les clips officiels, freestyles et sessions live de la scène ivoirienne et ouest-africaine, à regarder sur Maniguadebaby.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function VideosPage({ searchParams }: Props) {
  const params = await searchParams;
  await ensureSeeded().catch(() => false);
  const q = params.q ?? "";
  const videoRows = await listVideos({ search: q || undefined, limit: 60 });
  const totalViews = videoRows.reduce((sum, video) => sum + video.views, 0);
  const featured = videoRows.filter((video) => video.featured).slice(0, 2);
  const rest = videoRows.filter((video) => !featured.includes(video));

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_75%_0%,rgba(192,132,252,0.18),transparent_60%),radial-gradient(60%_100%_at_10%_20%,rgba(255,106,26,0.2),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-mango-400">
            <VideoIcon width={14} height={14} /> Clips
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Clips <span className="text-stroke">&</span> sessions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            {videoRows.length} vidéos, {formatCompactNumber(totalViews)} vues cumulées. Clips officiels tournés dans les
            maquis, freestales de rue et sessions acoustiques au bord du Bandama.
          </p>
          <form method="get" action="/videos" className="mt-7 flex max-w-md gap-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher un clip ou un artiste…"
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

      {featured.length > 0 && (
        <Section className="py-12">
          <Reveal>
            <SectionHeading eyebrow="En ce moment" title="Clips à la une" accent="#FF6A1A" />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((video, index) => (
              <Reveal key={video.id} delay={index * 80}>
                <VideoCard video={video} large />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section className="py-8 md:py-12">
        <Reveal>
          <SectionHeading eyebrow="Bibliothèque vidéo" title="Tous les clips" accent="#FFC53D" />
        </Reveal>
        {rest.length === 0 && featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-16 text-center text-sm text-cream-mute">
            Aucun clip ne correspond à « {q} ».{" "}
            <Link href="/videos" className="text-mango-400 underline">
              Réinitialiser
            </Link>
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...featured, ...rest].map((video, index) => (
              <Reveal key={video.id} delay={Math.min(index, 8) * 45}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
