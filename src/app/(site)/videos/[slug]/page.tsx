import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { getTrackBySlug, getVideoBySlug, listVideos } from "@/lib/queries";
import { Section, SectionHeading } from "@/components/section";
import { FavoriteButton, PlayAllButton, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { ClockIcon, EyeIcon, MapPinIcon } from "@/components/icons";
import { formatCompactNumber, formatDate, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) return { title: "Clip introuvable" };
  return {
    title: `${video.title} — ${video.artistName}`,
    description: video.description || `Clip de ${video.artistName} à regarder sur Maniguadebaby.`,
    openGraph: { title: video.title, images: video.thumbnailUrl ? [video.thumbnailUrl] : undefined },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const [related, linkedTrack] = await Promise.all([
    listVideos({ limit: 12 }),
    video.trackSlug ? getTrackBySlug(video.trackSlug) : Promise.resolve(null),
  ]);
  const others = related.filter((item) => item.slug !== video.slug).slice(0, 6);
  const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(video.videoUrl);

  return (
    <>
      <Section className="py-10 md:py-14">
        <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream-mute">
          <Link href="/videos" className="transition hover:text-mango-400">
            Clips
          </Link>
          <span>/</span>
          <Link href={`/artistes/${video.artistSlug}`} className="transition hover:text-mango-400">
            {video.artistName}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-[0_40px_120px_-40px_rgba(0,0,0,1)]">
              <div className="relative aspect-video bg-ink-950">
                {isEmbed ? (
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    poster={video.thumbnailUrl}
                    className="absolute inset-0 h-full w-full bg-ink-950"
                    playsInline
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Votre navigateur ne prend pas en charge la lecture vidéo.
                  </video>
                )}
              </div>
              <div className="p-6">
                <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.95] text-cream">
                  {video.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
                  <Link href={`/artistes/${video.artistSlug}`} className="font-heading text-base font-bold normal-case tracking-normal text-cream transition hover:text-mango-400">
                    {video.artistName}
                  </Link>
                  <span className="flex items-center gap-2">
                    <EyeIcon width={13} height={13} /> {formatCompactNumber(video.views)} vues
                  </span>
                  <span className="flex items-center gap-2">
                    <ClockIcon width={13} height={13} /> {formatDuration(video.durationSeconds)}
                  </span>
                  <span>Sortie : {formatDate(video.releaseDate)}</span>
                  <span className="flex items-center gap-2">
                    <MapPinIcon width={13} height={13} /> Côte d'Ivoire
                  </span>
                </div>
                {video.description && (
                  <p className="mt-5 max-w-3xl text-sm leading-relaxed text-cream-dim">{video.description}</p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                  {linkedTrack && <PlayAllButton tracks={[linkedTrack]} label="Écouter le morceau" />}
                  <FavoriteButton
                    itemType="video"
                    itemId={video.id}
                    size={20}
                    className="border border-white/15 text-cream-dim hover:text-mango-400"
                  />
                  {linkedTrack && (
                    <Link
                      href={`/morceaux/${linkedTrack.slug}`}
                      className="rounded-full border border-white/20 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
                    >
                      Fiche du morceau
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-6">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.artistCover} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cream-mute">Artiste</p>
                  <Link href={`/artistes/${video.artistSlug}`} className="block truncate font-heading text-lg font-extrabold text-cream hover:text-mango-400">
                    {video.artistName}
                  </Link>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cream-dim">
                Retrouvez tous les clips, sessions live et documentaires de {video.artistName} sur Maniguadebaby, ainsi
                que sa discographie complète en streaming.
              </p>
              <Link
                href={`/artistes/${video.artistSlug}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
              >
                Voir la fiche artiste
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {others.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow="À suivre" title="Autres clips" accent="#FF6A1A" />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item, index) => (
              <Reveal key={item.id} delay={index * 50}>
                <VideoCard video={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
