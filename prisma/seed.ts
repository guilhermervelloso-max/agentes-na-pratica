/* Carrega os 32 casos reais (posts do Reddit) de data/casos.json. Idempotente: pode rodar várias vezes. */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Raw = {
  agentes: Record<string, string>; temas: Record<string, string>;
  casos: { id: string; titulo: string; tituloOriginal: string; resumo: string; agentes: string[]; tema: string;
    fonte: { rotulo: string; url: string }; autor: string | null; data: string; prompt: string | null; comoReproduzir: string | null }[];
};
const AGENT_DESC: Record<string, string> = {
  claude: "Assistente e agente de programação da Anthropic, incluindo o Claude Code.",
  chatgpt: "Assistente da OpenAI e os modelos GPT usados em automações.",
  gemini: "Modelos e assistente do Google, muito usados em automações baratas.",
  n8n: "Ferramenta de automação de fluxos, de código aberto, onde muita gente monta agentes.",
  outro: "Agentes próprios, ferramentas menos conhecidas ou casos em que o autor não citou a ferramenta.",
};
const TOPIC_DESC: Record<string, string> = {
  dinheiro: "Contas, recibos, faturas, gastos e investimentos.",
  casa: "Rotina, organização pessoal e a casa.",
  saude: "Acompanhamento de saúde e bem-estar, sempre com médico no circuito.",
  trabalho: "Papelada, e-mail, agenda e o dia a dia do escritório.",
  vendas: "Atendimento no WhatsApp, prospecção e marketing.",
  pesquisa: "Resumos, notícias, ciência e estudo.",
  conteudo: "Vídeos, apps, jogos e projetos criativos.",
};
const slugify = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const prisma = new PrismaClient();
async function main() {
  const d = JSON.parse(readFileSync(join(__dirname, "..", "data", "casos.json"), "utf8")) as Raw;
  for (const [slug, name] of Object.entries(d.agentes))
    await prisma.agent.upsert({ where: { slug }, create: { slug, name, description: AGENT_DESC[slug] ?? "" }, update: { name } });
  for (const [slug, name] of Object.entries(d.temas))
    await prisma.topic.upsert({ where: { slug }, create: { slug, name, description: TOPIC_DESC[slug] ?? "" }, update: { name } });
  const topics = Object.fromEntries((await prisma.topic.findMany()).map((t) => [t.slug, t.id]));
  for (const c of d.casos) {
    const data = {
      title: c.titulo, originalTitle: c.tituloOriginal, summary: c.resumo, prompt: c.prompt, howTo: c.comoReproduzir,
      subreddit: c.fonte.rotulo, author: c.autor, redditId: c.id.replace(/^r-/, ""), publishedAt: new Date(c.data + "T12:00:00Z"),
      topicId: topics[c.tema], agents: { set: [], connect: c.agentes.map((slug) => ({ slug })) },
    };
    await prisma.case.upsert({
      where: { sourceUrl: c.fonte.url },
      create: { ...data, slug: slugify(c.titulo), sourceUrl: c.fonte.url, agents: { connect: c.agentes.map((slug) => ({ slug })) } },
      update: data,
    });
  }
  console.log(`Seed ok: ${d.casos.length} casos, ${Object.keys(d.agentes).length} agentes, ${Object.keys(d.temas).length} temas.`);
}
main().finally(() => prisma.$disconnect());
