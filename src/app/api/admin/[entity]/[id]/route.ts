import { NextResponse } from "next/server";
import { ENTITY_CONFIGS } from "@/lib/admin-config";
import { HANDLERS, buildValues, resolveSlug, type Row } from "@/lib/admin-handlers";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ entity: string; id: string }> };

async function resolve(context: Context) {
  const { entity, id } = await context.params;
  const handler = HANDLERS[entity];
  const config = ENTITY_CONFIGS[entity];
  if (!handler || !config || !id) return null;
  return { entity, handler, config, id };
}

export async function GET(_request: Request, context: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const resolved = await resolve(context);
  if (!resolved) return NextResponse.json({ error: "Entité inconnue." }, { status: 404 });
  const item = await resolved.handler.findOne(resolved.id);
  if (!item) return NextResponse.json({ error: "Élément introuvable." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const resolved = await resolve(context);
  if (!resolved) return NextResponse.json({ error: "Entité inconnue." }, { status: 404 });

  let body: Row;
  try {
    body = (await request.json()) as Row;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const existing = await resolved.handler.findOne(resolved.id);
  if (!existing) return NextResponse.json({ error: "Élément introuvable." }, { status: 404 });

  const values = buildValues(resolved.entity, { ...existing, ...body });
  const slug = await resolveSlug(resolved.entity, values, resolved.id);
  if (slug) values.slug = slug;
  delete values.id;

  try {
    const item = await resolved.handler.update(resolved.id, values);
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: `Mise à jour impossible : ${message}` }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const resolved = await resolve(context);
  if (!resolved) return NextResponse.json({ error: "Entité inconnue." }, { status: 404 });
  try {
    await resolved.handler.remove(resolved.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: `Suppression impossible : ${message}` }, { status: 500 });
  }
}
