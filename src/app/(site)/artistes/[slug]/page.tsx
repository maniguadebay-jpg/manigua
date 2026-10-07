import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import {
  getArtistBySlug,
  getArtistTotalPlays,
  listAlbums,
  listArtists,
  listTracks,
  listVideos,
} from "@/lib/queries";
import { Section, SectionHeading, ViewAllLink } from "@/components/section";
import { AlbumCard, ArtistCard, FavoriteButton, PlayAllButton, TrackRow, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { InstagramIcon, MapPinIcon, SparkIcon, TiktokIcon, VerifiedIcon, YoutubeIcon } from "@/components/icons";
import { formatCompactNumber, formatFullNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artiste introuvable" };
  return {
    title: `${artist.name} — artiste`,
    description: artist.bio.slice(0, 180) || `${artist.name}, artiste ${artist.city} : morceaux, albums et clips sur Maniguadebaby.`,
    openGraph: {
      title: `${artist.name} · Maniguadebaby`,
      description: artist.bio.slice(0, 160),
      images: artist.bannerUrl || artist.coverUrl ? [artist.bannerUrl || artist.coverUrl] : undefined,
    },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  await ensureSeeded().catch(() => false);
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const [trackRows, albumRows, videoRows, allArtists, totalPlays] = await Promise.all([
    listTracks({ artistSlug: slug, sort: "plays", limit: 30 }),
    listAlbums({ artistSlug: slug }),
    listVideos({ artistSlug: slug, limit: 6 }),
    listArtists({ limit: 40 }),
    getArtistTotalPlays(artist.id),
  ]);

  const similar = allArtists.filter((item) => item.slug !== artist.slug).slice(0, 6);
  const socials = [
    { label: artist.instagram, Icon: InstagramIcon, href: "https://instagram.com" },
    { label: artist.youtube, Icon: YoutubeIcon, href: "https://youtube.com" },
    { label: artist.tiktok, Icon: TiktokIcon, href: "https://tiktok.com" },
  ].filter((item) => Boolean(item.label));

  return (
    <>
      {/* Bannière */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artist.bannerUrl || artist.coverUrl} alt="" className="h-full w-full animate-kenburns object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,10,0.72)_0%,rgba(8,6,10,0.86)_55%,#08060a_100%)]" />
          <div className="absolute inset-0 grain opacity-50" />
        </div>

        <Section className="relative pb-10 pt-16 md:pt-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <div className="relative shrink-0">
              <div
                className="absolute -inset-3 rounded-full blur-2xl"
                style={{ background: `radial-gradient(circle, ${artist.accent}66, transparent 70%)` }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.coverUrl}
                alt={artist.name}
                className="relative h-40 w-40 rounded-2xl object-cover ring-2 ring-white/15 md:h-52 md:w-52"
              />
              <FavoriteButton
                itemType="artist"
                itemId={artist.id}
                className="absolute right-2 top-2 bg-ink-950/70 backdrop-blur"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-cream-mute">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon width={13} height={13} /> {artist.city}, {artist.country}
                </span>
                {artist.verified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-baobab-500/15 px-2.5 py-1 text-baobab-400">
                    <VerifiedIcon width={13} height={13} /> Artiste vérifié
                  </span>
                )}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.8rem,9vw,6.6rem)] uppercase leading-[0.85] text-cream">
                {artist.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
                {[
                  { label: "Auditeurs / mois", value: formatCompactNumber(artist.monthlyListeners) },
                  { label: "Abonnés", value: formatCompactNumber(artist.followers) },
                  { label: "Écoutes cumulées", value: formatCompactNumber(totalPlays) },
                  { label: "Titres", value: String(trackRows.length) },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl leading-none text-cream">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream-mute">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <PlayAllButton tracks={trackRows} label="Lire les titres populaires" />
                <Link
                  href={`/morceaux?artiste=${artist.slug}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
                >
                  Tout le catalogue
                </Link>
                {socials.map(({ label, Icon: SocialIcon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream-dim transition hover:-translate-y-0.5 hover:border-mango-500/60 hover:text-mango-400"
                    aria-label={label}
                    title={label}
                  >
                    <SocialIcon width={16} height={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Titres populaires */}
      <Section className="py-12 md:py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Titres populaires"
            title="Ce que le public écoute"
            accent={artist.accent}
            action={
              <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
                <SparkIcon width={13} height={13} /> {formatFullNumber(totalPlays)} écoutes
              </span>
            }
          />
        </Reveal>
        <Reveal>
          <ol className="space-y-0.5">
            {trackRows.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} queue={trackRows} />
            ))}
          </ol>
        </Reveal>
      </Section>

      {albumRows.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading eyebrow="Discographie" title="Albums, EP & singles" accent="#FFC53D" />
          </Reveal>
          <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {albumRows.map((album, index) => (
              <Reveal key={album.id} delay={index * 50} className="w-[200px] shrink-0 sm:w-[220px]">
                <AlbumCard album={album} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {videoRows.length > 0 && (
        <Section className="py-8 md:py-12">
          <Reveal>
            <SectionHeading
              eyebrow="En images"
              title="Clips & sessions"
              accent="#FF6A1A"
              action={<ViewAllLink href="/videos" label="Tous les clips" />}
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {videoRows.map((video, index) => (
              <Reveal key={video.id} delay={index * 60}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section className="py-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Reveal>
            <SectionHeading eyebrow="Parcours" title="Biographie" accent="#12B877" />
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-cream-dim">{artist.bio}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-[12px]">
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream-mute">Base</dt>
                  <dd className="mt-1 text-cream">{artist.city}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream-mute">Pays</dt>
                  <dd className="mt-1 text-cream">{artist.country}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream-mute">Sur la plateforme depuis</dt>
                  <dd className="mt-1 text-cream">Version 1 — 2026</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream-mute">Statut</dt>
                  <dd className="mt-1 text-cream">{artist.verified ? "Artiste vérifié" : "Artiste émergent"}</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <SectionHeading eyebrow="Dans le même esprit" title="Artistes similaires" accent="#FF6A1A" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((item) => (
                <ArtistCard key={item.id} artist={item} />
              ))}
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
