import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, emailLoginEnabled, passwordLoginEnabled } from "@/lib/auth";
import { isAdmin } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acesso do admin", robots: { index: false, follow: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ enviado?: string; error?: string }> }) {
  if (isAdmin((await auth())?.user?.email)) redirect("/admin");
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-extrabold">Acesso do admin</h1>
      <p className="mt-2 text-sm text-mute">Área restrita. O site público não tem contas.</p>
      {sp.enviado && <p className="mt-4 rounded-lg bg-mata-claro p-3">Se o e-mail for o do admin, um link de acesso foi enviado.</p>}
      {sp.error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">Acesso recusado.</p>}
      <LoginForm email={emailLoginEnabled} password={passwordLoginEnabled} />
    </div>
  );
}
