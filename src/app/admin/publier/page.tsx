import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded } from "@/db/seed";
import { getSelectOptions } from "@/lib/admin-handlers";
import { getSessionUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { QuickTrackForm } from "../../../components/admin/quick-track-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Publier un morceau" };

export default async function PublierMorceauPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  await ensureSeeded().catch(() => false);
  const options = await getSelectOptions();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav userName={user.name} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream-mute">
          <Link href="/admin" className="transition hover:text-mango-400">
            Tableau de bord
          </Link>
          <span>/</span>
          <span className="text-cream-dim">Publier un morceau</span>
        </nav>
        <QuickTrackForm artists={options.artists} genres={options.genres} />
      </main>
    </div>
  );
}
