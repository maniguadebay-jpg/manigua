import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { getTrackBySlug, listTracks, listVideos } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { FavoriteButton, PlayAllButton, TrackCard, TrackRow, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { ClockIcon, DiscIcon, MapPinIcon, SparkIcon } from "@/components/icons";
import { formatCompactNumber, formatDate, formatDuration, formatFullNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrackBySlug(slug);
  if (!track) return { title: "Morceau introuvable" };
  return {
    title: `${track.title} — ${track.artistName}`,
    description: `Écoutez « ${track.title} » de ${track.artistName}${
      track.albumTitle ? `, extrait de ${track.albumTitle}` : ""
    } sur Maniguadebaby. ${track.genreName ?? "Musique ouest-africaine"} · ${formatCompactNumber(track.plays)} écoutes.`,
    openGraph: { title: `${track.title} · ${track.artistName}`, images: track.coverUrl ? [track.coverUrl] : undefined },
  };
}

export default async function TrackPage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const track = await getTrackBySlug(slug);
  if (!track) notFound();

  const [albumTracks, sameArtist, sameGenre, videoRows] = await Promise.all([
    track.albumSlug ? listTracks({ albumSlug: track.albumSlug, limit: 30 }) : Promise.resolve([]),
    listTracks({ artistSlug: track.artistSlug, sort: "plays", limit: 8 }),
    track.genreSlug ? listTracks({ genreSlug: track.genreSlug, sort: "plays", limit: 8 }) : Promise.resolve([]),
    listVideos({ artistSlug: track.artistSlug, limit: 4 }),
  ]);

  const queue = albumTracks.length > 0 ? albumTracks : sameArtist;
  const clip = videoRows.find((video) => video.trackSlug === track.slug) ?? videoRows[0];
  const suggestions = sameGenre.filter((item) => item.id !== track.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.title,
    url: `https://maniguadebaby.ci/morceaux/${track.slug}`,
    duration: `PT${Math.round(track.durationSeconds / 60)}M${track.durationSeconds % 60}S`,
    inAlbum: track.albumTitle ? { "@type": "MusicAlbum", name: track.albumTitle } : undefined,
    byArtist: { "@type": "MusicGroup", name: track.artistName, url: `https://maniguadebaby.ci/artistes/${track.artistSlug}` },
    genre: track.genreName ?? undefined,
    datePublished: track.releaseDate,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ListenAction",
      userInteractionCount: track.plays,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.coverUrl} alt="" className="h-full w-full scale-125 object-cover opacity-30 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,10,0.78),#08060a)]" />
          <div className="absolute inset-0 grain opacity-40" />
        </div>

        <Section className="relative py-14 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <Reveal className="shrink-0">
              <div className="group relative">
                <div
                  className="absolute -inset-5 rounded-[28px] blur-3xl transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle, ${track.artistAccent}55, transparent 70%)` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.coverUrl}
                  alt={`Pochette de ${track.title}`}
                  className="relative h-56 w-56 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15 transition-transform duration-700 group-hover:scale-[1.02] md:h-64 md:w-64"
                />
              </div>
            </Reveal>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-mango-400">
                <DiscIcon width={13} height={13} />
                {track.genreName ?? "Single"}
                {track.trending && <span className="rounded-full bg-mango-500/20 px-2 py-0.5 text-mango-400">Hot</span>}
                {track.explicit && <span className="rounded-full bg-white/12 px-2 py-0.5 text-cream-dim">Explicite</span>}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,5rem)] uppercase leading-[0.9] text-cream">
                {track.title}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-base">
                <Link href={`/artistes/${track.artistSlug}`} className="font-heading text-lg font-bold text-cream hover:text-mango-400">
                  {track.artistName}
                </Link>
                {track.albumTitle && track.albumSlug && (
                  <>
                    <span className="text-cream-mute">·</span>
                    <Link href={`/albums/${track.albumSlug}`} className="text-cream-dim hover:text-mango-400">
                      {track.albumTitle}
                    </Link>
                  </>
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
                <span className="flex items-center gap-2">
                  <SparkIcon width={13} height={13} /> {formatFullNumber(track.plays)} écoutes
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon width={13} height={13} /> {formatDuration(track.durationSeconds)}
                </span>
                <span>Sortie : {formatDate(track.releaseDate)}</span>
                <span className="flex items-center gap-2">
                  <MapPinIcon width={13} height={13} /> Côte d'Ivoire
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PlayAllButton tracks={[track, ...queue.filter((item) => item.id !== track.id)]} label="Écouter maintenant" />
                <FavoriteButton
                  itemType="track"
                  itemId={track.id}
                  size={20}
                  className="border border-white/15 text-cream-dim hover:text-mango-400"
                />
                {track.albumSlug && (
                  <Link
                    href={`/albums/${track.albumSlug}`}
                    className="rounded-full border border-white/20 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
                  >
                    Voir l'album
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {clip && (
        <Section className="py-12">
          <Reveal>
            <SectionHeading eyebrow="Le clip" title={`${track.title} en images`} accent="#FF6A1A" />
          </Reveal>
          <Reveal>
            <VideoCard video={clip} large />
          </Reveal>
        </Section>
      )}

      {queue.length > 1 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading
              eyebrow={track.albumTitle ? "Tracklist de l'album" : `Plus de ${track.artistName}`}
              title="À écouter à la suite"
              accent="#FFC53D"
              action={<PlayAllButton tracks={queue} label="Lire la suite" variant="outline" />}
            />
          </Reveal>
          <Reveal>
            <ol className="space-y-0.5">
              {queue
                .filter((item) => item.id !== track.id)
                .map((item, index) => (
                  <TrackRow key={item.id} track={item} index={index} queue={queue} />
                ))}
            </ol>
          </Reveal>
        </Section>
      )}

      {suggestions.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow={`Dans le même esprit`} title={`Autres titres ${track.genreName ?? ""}`} accent="#12B877" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((item, index) => (
              <Reveal key={item.id} delay={index * 50}>
                <TrackCard track={item} queue={sameGenre} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
