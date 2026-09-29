import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const items = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string | undefined>;
  const kind = body.kind === "booking" ? "booking" : "contact";
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (name.length < 2) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  if (!EMAIL_REGEX.test(email)) return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });

  const [created] = await db
    .insert(contactMessages)
    .values({
      kind,
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      organization: (body.organization ?? "").trim().slice(0, 160),
      phone: (body.phone ?? "").trim().slice(0, 40),
      artist: (body.artist ?? "").trim().slice(0, 120),
      eventDate: (body.eventDate ?? "").trim().slice(0, 80),
      budget: (body.budget ?? "").trim().slice(0, 80),
      message: message.slice(0, 4000),
      status: "new",
    })
    .returning({ id: contactMessages.id });

  return NextResponse.json({ ok: true, id: created?.id ?? null }, { status: 201 });
}
