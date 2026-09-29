import { NextResponse } from "next/server";
import { getSelectOptions } from "@/lib/admin-handlers";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const options = await getSelectOptions();
  return NextResponse.json(options);
}
