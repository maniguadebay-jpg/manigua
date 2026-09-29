import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { getPlaylistBySlug, listPlaylists, listTracks } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { PlayAllButton, PlaylistCard, TrackRow } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { ClockIcon, QueueIcon } from "@/components/icons";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) return { title: "Playlist introuvable" };
  return { title: `${playlist.title} — Playlist`, description: playlist.description };
}

export default async function PlaylistPage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) notFound();

  const [trackRows, allPlaylists] = await Promise.all([
    listTracks({ playlistSlug: slug, limit: 60 }),
    listPlaylists(),
  ]);
  const others = allPlaylists.filter((item) => item.slug !== playlist.slug);
  const totalDuration = trackRows.reduce((sum, track) => sum + track.durationSeconds, 0);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playlist.coverUrl} alt="" className="h-full w-full scale-125 object-cover opacity-25 blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,10,0.8),#08060a)]" />
        </div>
        <Section className="relative py-14 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <Reveal className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                className="h-48 w-48 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15 md:h-60 md:w-60"
              />
            </Reveal>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-baobab-400">
                <QueueIcon width={13} height={13} /> Playlist · {playlist.curator}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,5rem)] uppercase leading-[0.88] text-cream">
                {playlist.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream-dim">{playlist.description}</p>
              <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
                <span>{trackRows.length} titres</span>
                <span className="flex items-center gap-2">
                  <ClockIcon width={13} height={13} /> {formatDuration(totalDuration)}
                </span>
                <Link href="/playlists" className="transition hover:text-baobab-400">
                  Toutes les playlists
                </Link>
              </p>
              <div className="mt-7">
                <PlayAllButton tracks={trackRows} label="Lancer la playlist" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading eyebrow="Tracklist" title={playlist.title} accent="#12B877" />
        </Reveal>
        {trackRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-14 text-center text-sm text-cream-mute">
            Cette playlist est en cours de préparation par la rédaction.
          </p>
        ) : (
          <Reveal>
            <ol className="space-y-0.5">
              {trackRows.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} queue={trackRows} />
              ))}
            </ol>
          </Reveal>
        )}
      </Section>

      {others.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow="Enchaîner" title="Autres playlists" accent="#FF6A1A" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item, index) => (
              <Reveal key={item.id} delay={index * 50}>
                <PlaylistCard playlist={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
