import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, tracks } from "@/db/schema";
import { VISITOR_COOKIE, generateVisitorId, getProfile } from "@/lib/auth";
import { listFavorites } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["track", "artist", "album", "video", "article", "playlist"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Owner = { userId: string | null; visitorId: string | null; isNewVisitor: boolean };

async function resolveOwner(): Promise<Owner> {
  const store = await cookies();
  const profile = await getProfile();
  if (profile) return { userId: profile.id, visitorId: null, isNewVisitor: false };
  const existing = store.get(VISITOR_COOKIE)?.value ?? null;
  if (existing) return { userId: null, visitorId: existing, isNewVisitor: false };
  return { userId: null, visitorId: generateVisitorId(), isNewVisitor: true };
}

function withVisitorCookie(response: NextResponse, owner: Owner) {
  if (owner.isNewVisitor && owner.visitorId) {
    response.cookies.set(VISITOR_COOKIE, owner.visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

function ownerScope(owner: Owner) {
  return owner.userId
    ? eq(favorites.userId, owner.userId)
    : and(isNull(favorites.userId), eq(favorites.visitorId, owner.visitorId!))!;
}

async function parseBody(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { itemType?: string; itemId?: string };
  const itemType = body.itemType ?? "";
  const itemId = String(body.itemId ?? "");
  if (!ALLOWED_TYPES.includes(itemType) || !UUID_REGEX.test(itemId)) return null;
  return { itemType, itemId };
}

export async function GET() {
  const owner = await resolveOwner();
  const items = await listFavorites({ userId: owner.userId, visitorId: owner.visitorId });
  return withVisitorCookie(
    NextResponse.json({ favorites: items, scope: owner.userId ? "profile" : "visitor" }),
    owner,
  );
}

export async function POST(request: Request) {
  const owner = await resolveOwner();
  const parsed = await parseBody(request);
  if (!parsed) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });

  await db
    .insert(favorites)
    .values({
      userId: owner.userId,
      visitorId: owner.userId ? null : owner.visitorId,
      itemType: parsed.itemType,
      itemId: parsed.itemId,
    })
    .onConflictDoNothing();

  if (parsed.itemType === "track") {
    await db.update(tracks).set({ likes: sql`${tracks.likes} + 1` }).where(eq(tracks.id, parsed.itemId));
  }

  const items = await listFavorites({ userId: owner.userId, visitorId: owner.visitorId });
  return withVisitorCookie(NextResponse.json({ favorites: items }), owner);
}

export async function DELETE(request: Request) {
  const owner = await resolveOwner();
  const parsed = await parseBody(request);
  if (!parsed) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });

  await db
    .delete(favorites)
    .where(and(ownerScope(owner), eq(favorites.itemType, parsed.itemType), eq(favorites.itemId, parsed.itemId)));

  if (parsed.itemType === "track") {
    await db
      .update(tracks)
      .set({ likes: sql`greatest(${tracks.likes} - 1, 0)` })
      .where(eq(tracks.id, parsed.itemId));
  }

  const items = await listFavorites({ userId: owner.userId, visitorId: owner.visitorId });
  return withVisitorCookie(NextResponse.json({ favorites: items }), owner);
}
