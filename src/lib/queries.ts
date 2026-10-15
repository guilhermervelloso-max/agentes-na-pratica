import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export const caseInclude = {
  agents: { select: { slug: true, name: true } },
  topic: { select: { slug: true, name: true } },
} satisfies Prisma.CaseInclude;

export type CaseWithRels = Prisma.CaseGetPayload<{ include: typeof caseInclude }>;

export async function listCases(opts: { q?: string; agent?: string; topic?: string; take?: number } = {}) {
  const where: Prisma.CaseWhereInput = {};
  if (opts.agent) where.agents = { some: { slug: opts.agent } };
  if (opts.topic) where.topic = { slug: opts.topic };
  const q = opts.q?.trim().slice(0, 100);
  if (q) {
    where.OR = ["title", "originalTitle", "summary", "howTo", "prompt", "subreddit"].map((f) => ({
      [f]: { contains: q, mode: "insensitive" as const },
    }));
    where.OR.push({ agents: { some: { name: { contains: q, mode: "insensitive" } } } });
  }
  return prisma.case.findMany({ where, include: caseInclude, orderBy: [{ publishedAt: "desc" }, { redditScore: "desc" }], take: opts.take ?? 500 });
}

export async function siteStats() {
  const [cases, agents, last] = await Promise.all([
    prisma.case.count(),
    prisma.agent.count(),
    prisma.case.aggregate({ _max: { updatedAt: true, publishedAt: true } }),
  ]);
  return { cases, agents, updatedAt: last._max.updatedAt, lastPublished: last._max.publishedAt };
}

/** Top-3 temas de um agente ou top-3 agentes de um tema. */
export async function topRelated() {
  const rows = await prisma.case.findMany({ select: { topic: { select: { slug: true, name: true } }, agents: { select: { slug: true, name: true } } } });
  const byAgent: Record<string, Record<string, number>> = {};
  const byTopic: Record<string, Record<string, number>> = {};
  for (const r of rows)
    for (const a of r.agents) {
      ((byAgent[a.slug] ??= {})[r.topic.name] ??= 0);
      byAgent[a.slug][r.topic.name]++;
      ((byTopic[r.topic.slug] ??= {})[a.name] ??= 0);
      byTopic[r.topic.slug][a.name]++;
    }
  const top = (m?: Record<string, number>) => Object.entries(m ?? {}).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => k);
  return { agentTop: (s: string) => top(byAgent[s]), topicTop: (s: string) => top(byTopic[s]) };
}
