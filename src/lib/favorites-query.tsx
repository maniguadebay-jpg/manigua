import { db } from '@/db';
import { favorites, playEvents, tracks } from '@/db/schema';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

interface Owner {
  userId: string | null;
  visitorId: string | null;
}

function ownerCondition(owner: Owner) {
  if (owner.userId) return eq(favorites.userId, owner.userId);
  if (owner.visitorId) return and(isNull(favorites.userId), eq(favorites.visitorId, owner.visitorId));
  return sql`false`;
}

export async function loadFavoriteBundle(owner: Owner): Promise<{
  tracks: any[];
  artists: any[];
  albums: any[];
  videos: any[];
  articles: any[];
  total: number;
}> {
  try {
    const cond = ownerCondition(owner);
    const rows = await db.select().from(favorites).where(cond!);
    const trackIds = rows.filter((r) => r.itemType === 'track').map((r) => r.itemId);
    let trackRows: any[] = [];
    if (trackIds.length > 0) {
      trackRows = await db.select().from(tracks).where(inArray(tracks.id, trackIds));
    }
    return {
      tracks: trackRows,
      artists: [],
      albums: [],
      videos: [],
      articles: [],
      total: rows.length,
    };
  } catch {
    return { tracks: [], artists: [], albums: [], videos: [], articles: [], total: 0 };
  }
}

export async function countPlays(owner: Owner): Promise<{ events: number; seconds: number }> {
  try {
    const cond = owner.userId
      ? eq(playEvents.userId, owner.userId)
      : owner.visitorId
      ? eq(playEvents.visitorId, owner.visitorId)
      : null;
    if (!cond) return { events: 0, seconds: 0 };
    const rows = await db.select({ seconds: playEvents.seconds }).from(playEvents).where(cond);
    const events = rows.length;
    const seconds = rows.reduce((sum, r) => sum + (r.seconds ?? 0), 0);
    return { events, seconds };
  } catch {
    return { events: 0, seconds: 0 };
  }
}

export async function loadPlayHistory(owner: Owner, limit = 12): Promise<any[]> {
  try {
    const cond = owner.userId
      ? eq(playEvents.userId, owner.userId)
      : owner.visitorId
      ? eq(playEvents.visitorId, owner.visitorId)
      : null;
    if (!cond) return [];
    const rows = await db
      .select()
      .from(playEvents)
      .where(cond)
      .orderBy(desc(playEvents.playedAt))
      .limit(limit);
    const trackIds = [...new Set(rows.map((r) => r.trackId).filter(Boolean))];
    if (trackIds.length === 0) return [];
    let trackRows = await db.select().from(tracks).where(inArray(tracks.id, trackIds as string[]));
    const trackMap = Object.fromEntries(trackRows.map((t) => [t.id, t]));
    return rows
      .map((r) => ({ id: r.id, playedAt: r.playedAt, track: trackMap[r.trackId!] }))
      .filter((r) => r.track);
  } catch {
    return [];
  }
}