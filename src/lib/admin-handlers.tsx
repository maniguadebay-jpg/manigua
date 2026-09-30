import { db } from '@/db';
import { artists, albums, tracks, videos, articles, playlists, genres, banners } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getSelectOptions() {
  try {
    const [artistRows, albumRows, genreRows] = await Promise.all([
      db.select({ id: artists.id, name: artists.name }).from(artists).orderBy(artists.name),
      db.select({ id: albums.id, title: albums.title }).from(albums).orderBy(albums.title),
      db.select({ id: genres.id, name: genres.name }).from(genres).orderBy(genres.name),
    ]);
    return {
      artists: artistRows.map((a: any) => ({ value: a.id, label: a.name })),
      albums: albumRows.map((a: any) => ({ value: a.id, label: a.title })),
      genres: genreRows.map((g: any) => ({ value: String(g.id), label: g.name })),
      albumTypes: [
        { value: 'album', label: 'Album' },
        { value: 'ep', label: 'EP' },
        { value: 'single', label: 'Single' },
        { value: 'mixtape', label: 'Mixtape' },
        { value: 'live', label: 'Live' },
      ],
      articleStatuses: [
        { value: 'draft', label: 'Brouillon' },
        { value: 'published', label: 'Publié' },
        { value: 'archived', label: 'Archivé' },
      ],
    };
  } catch {
    return { artists: [], albums: [], genres: [], albumTypes: [], articleStatuses: [] };
  }
}

export function resolveSlug(entity: string, values: Record<string, any>, _existingId?: string): string | null {
  const title = values.title ?? values.name ?? '';
  if (!title) return null;
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildValues(entity: string, data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === 'true') result[key] = true;
    if (result[key] === 'false') result[key] = false;
    if (result[key] === '') result[key] = null;
  }
  return result;
}

export type Row = Record<string, any>;

function makeHandler(table: any, orderBy?: any) {
  return {
    list: async (): Promise<Row[]> => {
      try {
        const q = db.select().from(table);
        return orderBy ? await q.orderBy(orderBy).limit(200) : await q.limit(200);
      } catch { return []; }
    },
    findOne: async (id: string): Promise<Row | null> => {
      try {
        const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
        return rows[0] ?? null;
      } catch { return null; }
    },
    create: async (values: Row): Promise<Row> => {
      const [row] = await db.insert(table).values(values).returning();
      return row;
    },
    update: async (id: string, values: Row): Promise<Row> => {
      const [row] = await db.update(table).set(values).where(eq(table.id, id)).returning();
      return row;
    },
    remove: async (id: string): Promise<void> => {
      await db.delete(table).where(eq(table.id, id));
    },
  };
}

export const HANDLERS: Record<string, ReturnType<typeof makeHandler>> = {
  tracks: makeHandler(tracks, desc(tracks.id)),
  artists: makeHandler(artists, artists.name),
  albums: makeHandler(albums, desc(albums.id)),
  videos: makeHandler(videos, desc(videos.id)),
  articles: makeHandler(articles, desc(articles.id)),
  playlists: makeHandler(playlists, playlists.title),
  genres: makeHandler(genres, genres.name),
  banners: makeHandler(banners, banners.id),
};
