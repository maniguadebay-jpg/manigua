import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ensureSeeded, fanCredentials } from "@/db/seed";
import { getProfile } from "@/lib/auth";
import { FanForm } from "@/components/account/fan-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion / Inscription — Compte fan",
  description: "Créez votre compte fan Maniguadebaby : favoris synchronisés, historique d'écoute et avant-premières.",
};

export default async function ConnexionPage() {
  await ensureSeeded().catch(() => false);
  const profile = await getProfile();
  if (profile) redirect("/compte");

  return <FanForm demo={fanCredentials} />;
}
