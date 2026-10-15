import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { topRelated } from "@/lib/queries";
import { initials } from "@/lib/text";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agentes de IA e o que as pessoas fazem com eles", alternates: { canonical: "/agentes" } };

export default async function Agentes() {
  const [agents, rel] = await Promise.all([
    prisma.agent.findMany({ include: { _count: { select: { cases: true } } }, orderBy: { cases: { _count: "desc" } } }),
    topRelated(),
  ]);
  const total = agents.reduce((n, a) => n + a._count.cases, 0);
  return (
    <>
      <h1 className="text-3xl font-extrabold">Agentes de IA e o que fazem</h1>
      <p className="mt-2 text-mute">{agents.length} agentes e ferramentas, {total} citações em casos. Escolha um para ver os casos.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <Link key={a.slug} href={`/agentes/${a.slug}`} className="card text-tinta no-underline hover:border-mata">
            <span className="tag w-fit">{initials(a.name)}</span>
            <h2 className="text-lg font-bold">{a.name}</h2>
            <span className="text-2xl font-extrabold text-mata">{a._count.cases}</span>
            <p className="text-sm">{a.description}</p>
            <small className="text-mute">Mais comum em: {rel.agentTop(a.slug).join(" · ") || "—"}</small>
          </Link>
        ))}
      </div>
    </>
  );
}
