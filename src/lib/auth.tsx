import { cookies } from 'next/headers';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE = 'mgb_session';
export const PROFILE_COOKIE = 'mgb_profile';
export const VISITOR_COOKIE = 'mgb_visitor';

const SECRET = process.env.AUTH_SECRET ?? 'maniguadebaby-secret-v1';

export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function createProfileToken(userId: string): string {
  return createSessionToken(userId);
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;
    const sig = parts.pop()!;
    const payload = parts.join(':');
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const userId = parts[0];
    return userId;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const userId = verifyToken(token);
    if (!userId) return null;
    const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    const profile = rows[0];
    if (!profile || !['admin', 'superadmin'].includes(profile.role ?? '')) return null;
    return { id: profile.id, email: profile.email, name: profile.displayName ?? profile.email, role: profile.role };
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const store = await cookies();
    const token = store.get(PROFILE_COOKIE)?.value;
    if (!token) return null;
    const userId = verifyToken(token);
    if (!userId) return null;
    const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    const profile = rows[0];
    if (!profile) return null;
    return { id: profile.id, email: profile.email, role: profile.role };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(':');
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(hash, 'hex'), derived);
  } catch {
    return false;
  }
}

export function generateVisitorId(): string {
  return `v_${randomBytes(12).toString('hex')}`;
}