import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    let seeded: boolean | string = false;
    try {
      seeded = await ensureSeeded();
    } catch (error) {
      seeded = `seed indisponible : ${error instanceof Error ? error.message : "erreur"}`;
    }
    return Response.json({ ok: true, service: "maniguadebaby", version: "v1", seeded });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
