import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/env";
import { adminLogout, rejectCandidate, runCollectorNow } from "./actions";
import { ApproveForm } from "./ApproveForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/admin/entrar");
  const st = (await searchParams).status;
  const status = st === "APPROVED" || st === "REJECTED" ? st : "PENDING";
  const [candidates, counts, runs, agents, topics] = await Promise.all([
    prisma.candidate.findMany({ where: { status }, orderBy: [{ redditScore: "desc" }, { postedAt: "desc" }], take: 50 }),
    prisma.candidate.groupBy({ by: ["status"], _count: true }),
    prisma.collectorRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Painel · candidatos do Reddit</h1>
        <div className="flex gap-2">
          <form action={runCollectorNow}><button className="btn-sec">Coletar agora</button></form>
          <form action={adminLogout}><button className="btn-sec">Sair</button></form>
        </div>
      </div>
      <nav className="flex gap-4 text-sm font-semibold">
        <Link href="/admin">Pendentes ({n("PENDING")})</Link>
        <Link href="/admin?status=APPROVED">Aprovados ({n("APPROVED")})</Link>
        <Link href="/admin?status=REJECTED">Rejeitados ({n("REJECTED")})</Link>
      </nav>
      <section className="text-xs text-mute">
        <h2 className="font-bold">Últimas coletas</h2>
        {runs.length === 0 ? <p>Nenhuma ainda.</p> : runs.map((r) => (
          <p key={r.id}>{r.startedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} · {r.method} · {r.found} encontrados · {r.added} novos · {r.refreshed} engajamentos{r.errors && <span className="text-red-700"> · {r.errors}</span>}</p>
        ))}
      </section>
      <p className="text-sm text-mute">Aprovar publica o caso. Escreva título e resumo em PT-BR, fiéis ao post; use “prompt” só se o post mostrar um.</p>
      {candidates.length === 0 && <p>Nada aqui.</p>}
      {candidates.map((c) => (
        <article key={c.id} className="card">
          <p className="text-xs text-mute">{c.subreddit} · {c.author ?? "autor desconhecido"} · {c.postedAt.toISOString().slice(0, 10)} · ▲ {c.redditScore} · 💬 {c.redditComments}</p>
          <h2 className="font-bold"><a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">{c.title}</a></h2>
          <details><summary className="cursor-pointer text-sm">Texto do post</summary><p className="whitespace-pre-wrap text-sm">{c.rawText || "(sem texto)"}</p></details>
          {status === "PENDING" && (
            <>
              <ApproveForm c={{ id: c.id, author: c.author, date: c.postedAt.toISOString().slice(0, 10) }} agents={agents.map((a) => ({ slug: a.slug, name: a.name }))} topics={topics.map((t) => ({ slug: t.slug, name: t.name }))} />
              <form action={rejectCandidate}><input type="hidden" name="id" value={c.id} /><button className="btn-sec">Rejeitar</button></form>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
