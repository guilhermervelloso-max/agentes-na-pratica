import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CaseCard } from "@/components/CaseCard";
import { prisma } from "@/lib/db";
import { abs, SITE_NAME } from "@/lib/env";
import { caseInclude } from "@/lib/queries";

export const dynamic = "force-dynamic";
type P = Promise<{ slug: string }>;
const getCase = cache((slug: string) => prisma.case.findUnique({ where: { slug }, include: caseInclude }));

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const c = await getCase((await params).slug);
  if (!c) return {};
  const url = `/casos/${c.slug}`;
  return {
    title: c.title, description: c.summary, alternates: { canonical: url },
    openGraph: { type: "article", url, title: c.title, description: c.summary, publishedTime: c.publishedAt.toISOString() },
    twitter: { card: "summary_large_image", title: c.title, description: c.summary },
  };
}

export default async function Caso({ params }: { params: P }) {
  const c = await getCase((await params).slug);
  if (!c) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: c.title, description: c.summary, inLanguage: "pt-BR",
    datePublished: c.publishedAt.toISOString(), dateModified: c.updatedAt.toISOString(), url: abs(`/casos/${c.slug}`),
    publisher: { "@type": "Organization", name: SITE_NAME }, isBasedOn: c.sourceUrl,
  };
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3"><Link href="/">← Todos os casos</Link></p>
      <CaseCard c={c} open />
      <p className="mt-4 text-sm text-mute">Resumo escrito pela equipe a partir do post original. Os resultados são relatos do autor e não foram verificados.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
