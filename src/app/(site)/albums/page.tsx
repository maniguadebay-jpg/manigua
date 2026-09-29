import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listAlbums } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { AlbumCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { DiscIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Albums, EP & projets",
  description: "Tous les albums, EP et singles du catalogue Maniguadebaby, classés par date de sortie.",
};

export default async function AlbumsPage() {
  await ensureSeeded().catch(() => false);
  const albumRows = await listAlbums({ limit: 100 });
  const totalTracks = albumRows.reduce((sum, album) => sum + (album.trackCount ?? 0), 0);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_120%_at_80%_0%,rgba(255,197,61,0.2),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-400">
            <DiscIcon width={14} height={14} /> Discographie
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Albums <span className="text-mango-500">&</span> EP
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            {albumRows.length} projets, {totalTracks} titres au total. Chaque pochette mène à la tracklist complète,
            lisible d'un clic dans le lecteur persistant.
          </p>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading eyebrow="Tri par date de sortie" title="Tous les projets" accent="#FFC53D" />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {albumRows.map((album, index) => (
            <Reveal key={album.id} delay={Math.min(index, 10) * 40}>
              <AlbumCard album={album} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
