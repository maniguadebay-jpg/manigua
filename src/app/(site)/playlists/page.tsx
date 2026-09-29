import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { listPlaylists, listTracks } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { PlayAllButton, PlaylistCard, TrackCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { QueueIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playlists de la rédaction",
  description:
    "Les sélections Maniguadebaby : maquis, kora & néon, nouchi, gospel et plus encore. Des playlists mises à jour chaque semaine.",
};

export default async function PlaylistsPage() {
  await ensureSeeded().catch(() => false);
  const [playlistRows, trending] = await Promise.all([listPlaylists(), listTracks({ sort: "plays", limit: 8 })]);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_70%_0%,rgba(18,184,119,0.22),transparent_60%)]" />
        <Section className="relative py-14 md:py-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-baobab-400">
            <QueueIcon width={14} height={14} /> Sélections
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] uppercase leading-[0.88] text-cream">
            Playlists <span className="text-mango-500">maison</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-dim">
            {playlistRows.length} sélections préparées par la rédaction et par les artistes eux-mêmes. Chaque playlist se
            lance d'un clic et s'enchaîne dans le lecteur persistant.
          </p>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playlistRows.map((playlist, index) => (
            <Reveal key={playlist.id} delay={index * 55}>
              <PlaylistCard playlist={playlist} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-8 md:py-12">
        <Reveal>
          <SectionHeading
            eyebrow="Pour compléter"
            title="Les plus écoutés du moment"
            accent="#FF6A1A"
            action={<PlayAllButton tracks={trending} label="Lire la sélection" variant="outline" />}
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((track, index) => (
            <Reveal key={track.id} delay={index * 45}>
              <TrackCard track={track} queue={trending} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
