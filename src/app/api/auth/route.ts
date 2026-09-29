import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { SESSION_COOKIE, createSessionToken, getSessionUser, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["admin", "superadmin"];

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);
  const profile = rows[0];
  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }
  if (!profile.passwordHash || !(await verifyPassword(password, profile.passwordHash))) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const token = createSessionToken(profile.id);
  const response = NextResponse.json({
    user: { id: profile.id, email: profile.email, name: profile.displayName, role: profile.role },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export { inArray };
