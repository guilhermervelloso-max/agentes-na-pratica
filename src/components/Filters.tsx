import { prisma } from "@/lib/db";

/** Formulário GET: funciona sem JavaScript e gera URLs compartilháveis (?q=&agente=&tema=). */
export async function Filters({ q, agente, tema, action = "/" }: { q?: string; agente?: string; tema?: string; action?: string }) {
  const [agents, topics] = await Promise.all([
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <form action={action} method="get" role="search" className="my-4 flex flex-wrap gap-2">
      <label className="sr-only" htmlFor="q">Buscar</label>
      <input id="q" name="q" type="search" defaultValue={q} maxLength={100} placeholder="Buscar: WhatsApp, recibos, vídeo…" className="input min-w-[200px] flex-1" />
      <select name="agente" defaultValue={agente ?? ""} className="input" aria-label="Agente">
        <option value="">Todos os agentes</option>
        {agents.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
      </select>
      <select name="tema" defaultValue={tema ?? ""} className="input" aria-label="Tema">
        <option value="">Todos os temas</option>
        {topics.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
      </select>
      <button className="btn">Filtrar</button>
    </form>
  );
}
