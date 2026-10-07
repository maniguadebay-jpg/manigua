'use client';
import React from 'react';
import Link from 'next/link';
import { HeartIcon } from './icons';

interface ArticleCardProps {
  article: any;
  className?: string;
  /** Mise en avant : visuel plus haut et titre plus grand. */
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, className, featured = false }) => {
  if (!article) return null;
  return (
    <Link href={`/actualites/${article.slug}`} className={`group block overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {article.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.coverUrl} alt={article.title} className={`w-full object-cover opacity-80 transition group-hover:opacity-100 ${featured ? 'h-56 sm:h-72' : 'h-40'}`} />
      )}
      <div className="p-4">
        {article.category && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-mango-500">{article.category}</p>
        )}
        <h3 className={`font-display uppercase leading-tight text-cream line-clamp-2 ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>{article.title}</h3>
        {article.excerpt && <p className="mt-1.5 text-xs leading-relaxed text-cream-mute line-clamp-2">{article.excerpt}</p>}
      </div>
    </Link>
  );
};

interface FavoriteButtonProps {
  itemType: string;
  itemId: any;
  size?: number;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemType, itemId, size = 16, className }) => {
  return (
    <button
      aria-label="Ajouter aux favoris"
      className={`flex items-center justify-center rounded-full text-cream-mute transition hover:text-mango-400 ${className ?? ''}`}
    >
      <HeartIcon width={size} height={size} />
    </button>
  );
};

interface AlbumCardProps {
  album: any;
  className?: string;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, className }) => {
  if (!album) return null;
  return (
    <Link href={`/albums/${album.slug}`} className={`group block overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {album.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={album.coverUrl} alt={album.title} className="aspect-square w-full object-cover opacity-80 transition group-hover:opacity-100" />
      )}
      <div className="p-3">
        <h3 className="font-display text-base uppercase leading-tight text-cream line-clamp-1">{album.title}</h3>
        {album.artistName && <p className="mt-0.5 text-xs text-cream-mute">{album.artistName}</p>}
      </div>
    </Link>
  );
};

interface PlayAllButtonProps {
  tracks: any[];
  label?: string;
  className?: string;
  /** Variante visuelle : 'solid' (défaut), 'outline' ou 'ghost'. */
  variant?: 'solid' | 'outline' | 'ghost';
}

export const PlayAllButton: React.FC<PlayAllButtonProps> = ({ tracks, label = 'Tout lire', className, variant = 'solid' }) => {
  const variantClass =
    variant === 'outline'
      ? 'border border-mango-500/60 bg-transparent text-mango-300 hover:bg-mango-500/10'
      : variant === 'ghost'
        ? 'bg-white/8 text-cream hover:bg-white/12'
        : 'bg-mango-500 text-ink-950 hover:bg-mango-400';
  return (
    <button
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] transition ${variantClass} ${className ?? ''}`}
      onClick={() => {}}
    >
      ▶ {label}
    </button>
  );
};

interface TrackRowProps {
  track: any;
  index: number;
  queue?: any[];
  className?: string;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, queue, className }) => {
  if (!track) return null;
  return (
    <div className={`group flex items-center gap-4 rounded-xl px-3 py-2.5 transition hover:bg-white/5 ${className ?? ''}`}>
      <span className="w-6 shrink-0 text-center font-display text-sm text-mango-500">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-bold text-cream">{track.title}</p>
        <p className="truncate text-xs text-cream-mute">{track.artistName}</p>
      </div>
      {track.genreName && <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-cream-mute sm:block">{track.genreName}</span>}
    </div>
  );
};

interface ArtistCardProps {
  artist: any;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, className }) => {
  if (!artist) return null;
  return (
    <Link href={`/artistes/${artist.slug}`} className={`group block overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {artist.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.photoUrl} alt={artist.name} className="aspect-square w-full object-cover opacity-80 transition group-hover:opacity-100" />
      )}
      <div className="p-3">
        <h3 className="font-display text-base uppercase leading-tight text-cream line-clamp-1">{artist.name}</h3>
        {artist.genreName && <p className="mt-0.5 text-xs text-cream-mute">{artist.genreName}</p>}
      </div>
    </Link>
  );
};

interface VideoCardProps {
  video: any;
  className?: string;
  /** Format large : titre plus grand, utilisé en tête de rubrique. */
  large?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, className, large = false }) => {
  if (!video) return null;
  return (
    <Link href={`/videos/${video.slug}`} className={`group block overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {video.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.thumbnailUrl} alt={video.title} className="aspect-video w-full object-cover opacity-80 transition group-hover:opacity-100" />
      )}
      <div className="p-3">
        <h3 className={`font-display uppercase leading-tight text-cream line-clamp-1 ${large ? 'text-xl sm:text-2xl' : 'text-base'}`}>{video.title}</h3>
        {video.artistName && <p className="mt-0.5 text-xs text-cream-mute">{video.artistName}</p>}
      </div>
    </Link>
  );
};

interface TrackCardProps {
  track: any;
  queue?: any[];
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, queue, className }) => {
  if (!track) return null;
  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {track.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.coverUrl} alt={track.title} className="aspect-square w-full object-cover opacity-80 transition group-hover:opacity-100" />
      )}
      <div className="p-3">
        <h3 className="font-display text-sm uppercase leading-tight text-cream line-clamp-1">{track.title}</h3>
        {track.artistName && <p className="mt-0.5 text-xs text-cream-mute">{track.artistName}</p>}
      </div>
    </div>
  );
};

interface GenreTileProps {
  genre: any;
  className?: string;
}

export const GenreTile: React.FC<GenreTileProps> = ({ genre, className }) => {
  if (!genre) return null;
  return (
    <Link
      href={`/decouverte?genre=${encodeURIComponent(genre.slug ?? genre.name)}`}
      className={`group flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/80 px-5 py-4 transition hover:border-mango-500/40 hover:bg-ink-800/80 ${className ?? ''}`}
    >
      <span className="font-display text-lg uppercase text-cream">{genre.name}</span>
      {genre.trackCount != null && (
        <span className="text-xs text-cream-mute">{genre.trackCount} morceaux</span>
      )}
    </Link>
  );
};

interface PlaylistCardProps {
  playlist: any;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, className }) => {
  if (!playlist) return null;
  return (
    <Link href={`/playlists/${playlist.slug}`} className={`group block overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 transition hover:border-mango-500/40 ${className ?? ''}`}>
      {playlist.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={playlist.coverUrl} alt={playlist.title} className="aspect-square w-full object-cover opacity-80 transition group-hover:opacity-100" />
      )}
      <div className="p-3">
        <h3 className="font-display text-base uppercase leading-tight text-cream line-clamp-1">{playlist.title}</h3>
        {playlist.trackCount != null && <p className="mt-0.5 text-xs text-cream-mute">{playlist.trackCount} morceaux</p>}
      </div>
    </Link>
  );
};