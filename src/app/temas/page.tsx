import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { topRelated } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Temas: casos de agentes de IA por tipo de tarefa", alternates: { canonical: "/temas" } };

export default async function Temas() {
  const [topics, rel] = await Promise.all([
    prisma.topic.findMany({ include: { _count: { select: { cases: true } } }, orderBy: { cases: { _count: "desc" } } }),
    topRelated(),
  ]);
  return (
    <>
      <h1 className="text-3xl font-extrabold">Temas</h1>
      <p className="mt-2 text-mute">Os casos agrupados pelo tipo de tarefa que o agente recebeu.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Link key={t.slug} href={`/temas/${t.slug}`} className="card text-tinta no-underline hover:border-mata">
            <h2 className="text-lg font-bold">{t.name}</h2>
            <span className="text-2xl font-extrabold text-mata">{t._count.cases}</span>
            <p className="text-sm">{t.description}</p>
            <small className="text-mute">Agentes mais usados: {rel.topicTop(t.slug).join(" · ") || "—"}</small>
          </Link>
        ))}
      </div>
    </>
  );
}
