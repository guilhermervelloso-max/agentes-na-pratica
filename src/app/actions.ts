"use server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** "Quero isso" anônimo: +1 por IP e caso a cada 24h, no máximo 60 cliques por IP por hora. */
export async function wantCase(caseId: string): Promise<{ count: number | null }> {
  if (typeof caseId !== "string" || caseId.length > 40) return { count: null };
  const ip = await clientIp();
  const ok = (await rateLimit(`want:${ip}`, 60, 3600)) && (await rateLimit(`want:${ip}:${caseId}`, 1, 86400));
  const c = ok
    ? await prisma.case.update({ where: { id: caseId }, data: { wantCount: { increment: 1 } }, select: { wantCount: true } }).catch(() => null)
    : await prisma.case.findUnique({ where: { id: caseId }, select: { wantCount: true } });
  return { count: c?.wantCount ?? null };
}
