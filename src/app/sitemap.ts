import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { abs } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases, agents, topics] = await Promise.all([
    prisma.case.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.agent.findMany({ select: { slug: true } }),
    prisma.topic.findMany({ select: { slug: true } }),
  ]);
  return [
    ...["/", "/agentes", "/temas", "/sobre", "/apoiar", "/privacidade"].map((p) => ({ url: abs(p), changeFrequency: "daily" as const })),
    ...agents.map((a) => ({ url: abs(`/agentes/${a.slug}`) })),
    ...topics.map((t) => ({ url: abs(`/temas/${t.slug}`) })),
    ...cases.map((c) => ({ url: abs(`/casos/${c.slug}`), lastModified: c.updatedAt })),
  ];
}
