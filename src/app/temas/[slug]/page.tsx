import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseList } from "@/components/CaseList";
import { prisma } from "@/lib/db";
import { listCases } from "@/lib/queries";

export const dynamic = "force-dynamic";
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const a = await prisma.topic.findUnique({ where: { slug: (await params).slug } });
  if (!a) return {};
  return { title: `${a.name}: casos com agentes de IA`, description: a.description, alternates: { canonical: `/topices/${a.slug}` } };
}

export default async function Tema({ params }: { params: P }) {
  const { slug } = await params;
  const a = await prisma.topic.findUnique({ where: { slug } });
  if (!a) notFound();
  const cases = await listCases({ topic: slug });
  return (
    <>
      <h1 className="text-3xl font-extrabold">{a.name}</h1>
      <p className="mt-2 text-mute">{a.description} · {cases.length} caso(s).</p>
      <CaseList cases={cases} />
    </>
  );
}
