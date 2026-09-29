import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { getAlbumBySlug, listAlbums, listTracks } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { AlbumCard, FavoriteButton, PlayAllButton, TrackRow } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { ClockIcon, DiscIcon, SparkIcon } from "@/components/icons";
import { formatCompactNumber, formatDate, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album introuvable" };
  return {
    title: `${album.title} — ${album.artistName}`,
    description: album.description || `${album.title}, ${album.albumType} de ${album.artistName} sorti le ${formatDate(album.releaseDate)}.`,
    openGraph: { title: `${album.title} · ${album.artistName}`, images: album.coverUrl ? [album.coverUrl] : undefined },
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const [trackRows, otherAlbums] = await Promise.all([
    listTracks({ albumSlug: slug, sort: "az", limit: 40 }).then((rows) =>
      rows.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title)),
    ),
    listAlbums({ artistSlug: album.artistSlug, limit: 12 }),
  ]);

  const totalDuration = trackRows.reduce((sum, track) => sum + track.durationSeconds, 0);
  const totalPlays = trackRows.reduce((sum, track) => sum + track.plays, 0);
  const related = otherAlbums.filter((item) => item.slug !== album.slug).slice(0, 6);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={album.coverUrl} alt="" className="h-full w-full scale-125 object-cover opacity-25 blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,10,0.8),#08060a)]" />
        </div>
        <Section className="relative py-14 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <Reveal className="shrink-0">
              <div className="group relative">
                <div className="absolute -inset-4 rounded-3xl bg-mango-600/20 blur-3xl transition-opacity duration-700 group-hover:opacity-70" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={album.coverUrl}
                  alt={`Pochette de ${album.title}`}
                  className="relative h-52 w-52 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15 transition-transform duration-700 group-hover:-translate-y-1 md:h-64 md:w-64"
                />
                <FavoriteButton
                  itemType="album"
                  itemId={album.id}
                  className="absolute right-2 top-2 bg-ink-950/70 backdrop-blur"
                />
              </div>
            </Reveal>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">
                <DiscIcon width={13} height={13} /> {album.albumType}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,5.2rem)] uppercase leading-[0.88] text-cream">
                {album.title}
              </h1>
              <p className="mt-4 text-base text-cream-dim">
                <Link href={`/artistes/${album.artistSlug}`} className="font-heading font-bold text-cream hover:text-mango-400">
                  {album.artistName}
                </Link>
                <span className="mx-2 text-cream-mute">·</span>
                {formatDate(album.releaseDate)}
                <span className="mx-2 text-cream-mute">·</span>
                {trackRows.length} titres
              </p>
              {album.description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-mute">{album.description}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
                <span className="flex items-center gap-2">
                  <ClockIcon width={13} height={13} /> {formatDuration(totalDuration)}
                </span>
                <span className="flex items-center gap-2">
                  <SparkIcon width={13} height={13} /> {formatCompactNumber(totalPlays)} écoutes
                </span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <PlayAllButton tracks={trackRows} label="Lire l'album" />
                <Link
                  href={`/artistes/${album.artistSlug}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
                >
                  Voir l'artiste
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading eyebrow="Tracklist" title={album.title} accent="#FFC53D" />
        </Reveal>
        {trackRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-14 text-center text-sm text-cream-mute">
            Aucun morceau n'est encore rattaché à ce projet. L'équipe éditoriale complète la tracklist.
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

      {related.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow={`Plus de ${album.artistName}`} title="Autres projets" accent="#FF6A1A" />
          </Reveal>
          <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 45} className="w-[200px] shrink-0 sm:w-[220px]">
                <AlbumCard album={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
