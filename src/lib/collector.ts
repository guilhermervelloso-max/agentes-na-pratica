import { prisma } from "./db";
import { fetchEngagement, fetchTopPosts, looksLikeUseCase } from "./reddit";

/** Coleta candidatos (sempre PENDING, nunca publica) e atualiza engajamento dos casos publicados. */
export async function runCollector(period: "day" | "week" | "month" = "week") {
  const { method, posts, errors, token } = await fetchTopPosts(period);
  const candidates = posts.filter(looksLikeUseCase);
  let added = 0, refreshed = 0;
  for (const p of candidates) {
    const known = await prisma.case.findFirst({ where: { OR: [{ sourceUrl: p.url }, { redditId: p.redditId }] }, select: { id: true } });
    if (known) continue;
    const r = await prisma.candidate.upsert({
      where: { sourceUrl: p.url },
      create: { title: p.title, sourceUrl: p.url, subreddit: p.subreddit, author: p.author, redditId: p.redditId, redditScore: p.score, redditComments: p.comments, postedAt: p.postedAt, rawText: p.text },
      update: { redditScore: p.score, redditComments: p.comments },
      select: { createdAt: true },
    });
    if (Date.now() - r.createdAt.getTime() < 60_000) added++;
  }
  // Engajamento: posts vistos agora já trazem score (OAuth); demais casos via /api/info.
  if (token) {
    try {
      const cases = await prisma.case.findMany({ where: { redditId: { not: null } }, select: { id: true, redditId: true } });
      const eng = await fetchEngagement(token, cases.map((c) => c.redditId!));
      for (const c of cases) {
        const e = eng.get(c.redditId!);
        if (e) { await prisma.case.update({ where: { id: c.id }, data: { redditScore: e.score, redditComments: e.comments, engagementAt: new Date() } }); refreshed++; }
      }
    } catch (e) { errors.push(String(e)); }
  } else {
    errors.push("Sem REDDIT_CLIENT_ID/SECRET: engajamento (score/comentários) não atualizado; RSS não traz esses números.");
  }
  const run = await prisma.collectorRun.create({ data: { method, found: candidates.length, added, refreshed, errors: errors.join("\n") } });
  return run;
}
