import Link from "next/link";
import { CaseList } from "@/components/CaseList";
import { Filters } from "@/components/Filters";
import { listCases, siteStats } from "@/lib/queries";
import { dayKey, fmtDay } from "@/lib/text";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; agente?: string; tema?: string }>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [cases, stats] = await Promise.all([listCases({ q: sp.q, agent: sp.agente, topic: sp.tema }), siteStats()]);
  const filtered = !!(sp.q || sp.agente || sp.tema);
  const lastDay = cases[0] ? dayKey(cases[0].publishedAt) : null;
  const newest = lastDay ? cases.filter((c) => dayKey(c.publishedAt) === lastDay).length : 0;
  return (
    <>
      <h1 className="text-3xl font-extrabold sm:text-4xl">O que pessoas reais fazem com agentes de IA</h1>
      <p className="mt-2 text-mute">
        {stats.cases} casos{stats.updatedAt ? ` · atualizado em ${fmtDay(stats.updatedAt)}` : ""} · fonte: posts do Reddit em
        comunidades sobre uso de IA, resumidos em português com link para o original.
        {!filtered && newest > 0 && <> · <strong>{newest} caso{newest > 1 ? "s" : ""}</strong> no dia mais recente.</>}
      </p>
      <Filters q={sp.q} agente={sp.agente} tema={sp.tema} />
      {filtered && <p className="text-sm text-mute">{cases.length} resultado(s). <Link href="/">Limpar filtros</Link></p>}
      <CaseList cases={cases} />
    </>
  );
}
