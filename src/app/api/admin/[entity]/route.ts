import { NextResponse } from "next/server";
import { ENTITY_CONFIGS } from "@/lib/admin-config";
import { HANDLERS, buildValues, resolveSlug, type Row } from "@/lib/admin-handlers";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ entity: string }> };

export async function GET(_request: Request, context: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const { entity } = await context.params;
  const handler = HANDLERS[entity];
  const config = ENTITY_CONFIGS[entity];
  if (!handler || !config) return NextResponse.json({ error: "Entité inconnue." }, { status: 404 });

  const items = await handler.list();
  return NextResponse.json({ items, config });
}

export async function POST(request: Request, context: Context) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const { entity } = await context.params;
  const handler = HANDLERS[entity];
  const config = ENTITY_CONFIGS[entity];
  if (!handler || !config) return NextResponse.json({ error: "Entité inconnue." }, { status: 404 });

  let body: Row;
  try {
    body = (await request.json()) as Row;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const values = buildValues(entity, body);
  const missing = config.fields.filter((field) => {
    if (!field.required) return false;
    const value = values[field.name];
    return value === "" || value === null || value === undefined;
  });
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Champs obligatoires manquants : ${missing.map((f) => f.label).join(", ")}.`, fields: missing.map((f) => f.name) },
      { status: 400 },
    );
  }

  const slug = await resolveSlug(entity, values);
  if (slug) values.slug = slug;

  try {
    const item = await handler.create(values);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: `Enregistrement impossible : ${message}` }, { status: 500 });
  }
}
