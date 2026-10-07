import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "../../../components/admin/login-form";
import { ensureSeeded, seedCredentials } from "@/db/seed";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Connexion admin" };

export default async function AdminLoginPage() {
  await ensureSeeded().catch(() => false);
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return <LoginForm demoEmail={seedCredentials.email} demoPassword={seedCredentials.password} />;
}
