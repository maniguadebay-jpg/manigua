import { db } from '@/db';
import { artists, albums, tracks, videos, articles, playlists, genres, banners } from '@/db/schema';
import { count, sum, eq } from 'drizzle-orm';

type TrackFilter = {
  sort?: 'plays' | 'recent' | 'likes' | 'az' | 'trending';
  featured?: boolean;
  limit?: number;
  genreSlug?: string;
  artistSlug?: string;
  search?: string;
};

export async function listTracks(filter: TrackFilter = {}): Promise<any[]> {
  try {
    return await db.select().from(tracks).limit(filter.limit ?? 20);
  } catch { return []; }
}

export async function listArtists(filter: { limit?: number; search?: string } = {}): Promise<any[]> {
  try {
    return await db.select().from(artists).limit(filter.limit ?? 20);
  } catch { return []; }
}

export async function listAlbums(filter: { limit?: number } = {}): Promise<any[]> {
  try {
    return await db.select().from(albums).limit(filter.limit ?? 20);
  } catch { return []; }
}

export async function listVideos(filter: { limit?: number; search?: string } = {}): Promise<any[]> {
  try {
    return await db.select().from(videos).limit(filter.limit ?? 20);
  } catch { return []; }
}

export async function listArticles(filter: { limit?: number; category?: string; search?: string; status?: string } = {}): Promise<any[]> {
  try {
    return await db.select().from(articles).limit(filter.limit ?? 20);
  } catch { return []; }
}

export async function listArticleCategories(): Promise<string[]> {
  try {
    const rows = await db.select({ category: articles.category }).from(articles);
    const cats = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[];
    return cats;
  } catch { return []; }
}

export async function listGenres(): Promise<any[]> {
  try {
    return await db.select().from(genres);
  } catch { return []; }
}

export async function listPlaylists(): Promise<any[]> {
  try {
    return await db.select().from(playlists);
  } catch { return []; }
}

export async function listBanners(): Promise<any[]> {
  try {
    return await db.select().from(banners);
  } catch { return []; }
}

export async function listFavorites(filter: { userId?: string | null; visitorId?: string | null }): Promise<any[]> {
  try {
    return [];
  } catch { return []; }
}

export async function getTrackBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(tracks).where(eq(tracks.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function getArtistBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function getArtistTotalPlays(artistId: string): Promise<number> {
  try {
    const rows = await db.select({ total: sum(tracks.plays) }).from(tracks).where(eq(tracks.artistId, artistId));
    return Number(rows[0]?.total ?? 0);
  } catch { return 0; }
}

export async function getAlbumBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(albums).where(eq(albums.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function getPlaylistBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(playlists).where(eq(playlists.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function getVideoBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(videos).where(eq(videos.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function getArticleBySlug(slug: string): Promise<any> {
  try {
    const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

export async function searchAll(query: string): Promise<any[]> {
  try {
    return [];
  } catch { return []; }
}

export async function getSiteStats(): Promise<{
  tracks: number;
  artists: number;
  videos: number;
  plays: number;
  albums: number;
  genres: number;
  articles: number;
  playlists: number;
  videoViews: number;
}> {
  try {
    const [trackCount, artistCount, videoCount, albumCount, genreCount, articleCount, playlistCount, playsSum, viewsSum] =
      await Promise.all([
        db.select({ value: count() }).from(tracks),
        db.select({ value: count() }).from(artists),
        db.select({ value: count() }).from(videos),
        db.select({ value: count() }).from(albums),
        db.select({ value: count() }).from(genres),
        db.select({ value: count() }).from(articles),
        db.select({ value: count() }).from(playlists),
        db.select({ total: sum(tracks.plays) }).from(tracks),
        db.select({ total: sum(videos.views) }).from(videos),
      ]);
    return {
      tracks: Number(trackCount[0]?.value ?? 0),
      artists: Number(artistCount[0]?.value ?? 0),
      videos: Number(videoCount[0]?.value ?? 0),
      albums: Number(albumCount[0]?.value ?? 0),
      genres: Number(genreCount[0]?.value ?? 0),
      articles: Number(articleCount[0]?.value ?? 0),
      playlists: Number(playlistCount[0]?.value ?? 0),
      plays: Number(playsSum[0]?.total ?? 0),
      videoViews: Number(viewsSum[0]?.total ?? 0),
    };
  } catch {
    return { tracks: 0, artists: 0, videos: 0, plays: 0, albums: 0, genres: 0, articles: 0, playlists: 0, videoViews: 0 };
  }
}