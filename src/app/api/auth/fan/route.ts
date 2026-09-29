import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, profiles } from "@/db/schema";
import {
  PROFILE_COOKIE,
  VISITOR_COOKIE,
  createProfileToken,
  getProfile,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { createSupabaseUser, verifyCredentials } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/** Rapatrie les favoris anonymes d'un visiteur vers son nouveau compte. */
async function mergeVisitorFavorites(profileId: string, visitorId?: string | null) {
  if (!visitorId) return;
  await db.execute(sql`
    delete from ${favorites} as visitor
    using ${favorites} as owned
    where visitor.visitor_id = ${visitorId}
      and visitor.user_id is null
      and owned.user_id = ${profileId}
      and owned.item_type = visitor.item_type
      and owned.item_id = visitor.item_id
  `);
  await db
    .update(favorites)
    .set({ userId: profileId, visitorId: null })
    .where(sql`${favorites.visitorId} = ${visitorId} and ${favorites.userId} is null`);
}

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    email?: string;
    password?: string;
    displayName?: string;
    city?: string;
  };

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const mode = body.mode === "register" ? "register" : "login";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
  }

  const store = await cookies();
  const visitorId = store.get(VISITOR_COOKIE)?.value ?? null;

  if (mode === "register") {
    const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
    if (existing[0]) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email. Connectez-vous." }, { status: 409 });
    }
    // Supabase Auth : crée l'utilisateur auth.users, le trigger `handle_new_user`
    // crée le profil ; notre profil local est créé dans la foulée pour la V1.
    await createSupabaseUser(email, password, {
      display_name: (body.displayName ?? "").trim() || email.split("@")[0],
      role: "fan",
    }).catch(() => null);
    const [created] = await db
      .insert(profiles)
      .values({
        email,
        passwordHash: await hashPassword(password),
        displayName: (body.displayName ?? "").trim() || email.split("@")[0],
        city: (body.city ?? "").trim(),
        role: "fan",
      })
      .returning();
    await mergeVisitorFavorites(created.id, visitorId);
    const response = NextResponse.json(
      { profile: { id: created.id, email: created.email, displayName: created.displayName, role: created.role, city: created.city } },
      { status: 201 },
    );
    response.cookies.set(PROFILE_COOKIE, createProfileToken(created.id), COOKIE_OPTIONS);
    return response;
  }

  const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  const profile = rows[0];

  // 1) Supabase Auth (si configuré) · 2) repli local scrypt
  const supabaseUser = await verifyCredentials(email, password).catch(() => null);
  const passwordOk = supabaseUser
    ? true
    : Boolean(profile && profile.passwordHash && (await verifyPassword(password, profile.passwordHash)));

  if (!profile || !passwordOk) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }
  await mergeVisitorFavorites(profile.id, visitorId);
  const response = NextResponse.json({
    profile: { id: profile.id, email: profile.email, displayName: profile.displayName, role: profile.role, city: profile.city },
  });
  response.cookies.set(PROFILE_COOKIE, createProfileToken(profile.id), COOKIE_OPTIONS);
  return response;
}

export async function PATCH(request: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string;
    city?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
  };

  const patch: Record<string, string> = {};
  if (typeof body.displayName === "string" && body.displayName.trim()) patch.displayName = body.displayName.trim().slice(0, 60);
  if (typeof body.city === "string") patch.city = body.city.trim().slice(0, 60);
  if (typeof body.avatarUrl === "string") patch.avatarUrl = body.avatarUrl.trim().slice(0, 500);
  if (typeof body.bio === "string") patch.bio = body.bio.trim().slice(0, 600);
  if (typeof body.phone === "string") patch.phone = body.phone.trim().slice(0, 30);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
  }

  const [updated] = await db.update(profiles).set(patch).where(eq(profiles.id, profile.id)).returning();
  return NextResponse.json({
    profile: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      role: updated.role,
      city: updated.city,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PROFILE_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
