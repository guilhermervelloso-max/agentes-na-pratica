import { prisma } from "@/lib/db";
import { abs, SITE_DESCRIPTION, SITE_NAME } from "@/lib/env";
import { xmlEscape as x } from "@/lib/text";

export const dynamic = "force-dynamic";

export async function GET() {
  const cases = await prisma.case.findMany({ orderBy: { publishedAt: "desc" }, take: 50, include: { agents: true, topic: true } });
  const items = cases.map((c) => `<item>
<title>${x(c.title)}</title>
<link>${x(abs(`/casos/${c.slug}`))}</link>
<guid isPermaLink="true">${x(abs(`/casos/${c.slug}`))}</guid>
<pubDate>${c.publishedAt.toUTCString()}</pubDate>
<category>${x(c.topic.name)}</category>
<description>${x(`${c.summary} (Fonte: ${c.subreddit}${c.author ? `, ${c.author}` : ""} — ${c.sourceUrl})`)}</description>
</item>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${x(SITE_NAME)}</title><link>${x(abs("/"))}</link><description>${x(SITE_DESCRIPTION)}</description><language>pt-BR</language>
<atom:link href="${x(abs("/feed.xml"))}" rel="self" type="application/rss+xml"/>
${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
