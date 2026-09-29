import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ENTITY_CONFIGS } from "@/lib/admin-config";
import { HANDLERS, getSelectOptions } from "@/lib/admin-handlers";
import { getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { AdminNav } from "@/components/admin/admin-nav";
import { EntityManager, type OptionsMap, type Row } from "@/components/admin/entity-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gestion des contenus" };

type Props = { params: Promise<{ entity: string }> };

export default async function AdminEntityPage({ params }: Props) {
  const { entity } = await params;
  const config = ENTITY_CONFIGS[entity];
  const handler = HANDLERS[entity];
  if (!config || !handler) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  await ensureSeeded().catch(() => false);
  const [items, options] = await Promise.all([handler.list(), getSelectOptions()]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav userName={user.name} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream-mute">
          <Link href="/admin" className="transition hover:text-mango-400">
            Tableau de bord
          </Link>
          <span>/</span>
          <span className="text-cream-dim">{config.labelPlural}</span>
        </nav>
        <EntityManager config={config} initialItems={items as Row[]} options={options as OptionsMap} />
      </main>
    </div>
  );
}
