import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Dados públicos dos casos salvos no navegador (os slugs vêm do localStorage). */
export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") || "").split(",").map((s) => s.trim()).filter((s) => /^[a-z0-9-]{1,100}$/.test(s)).slice(0, 100);
  if (!slugs.length) return NextResponse.json([]);
  const rows = await prisma.case.findMany({ where: { slug: { in: slugs } }, select: { slug: true, title: true, summary: true, subreddit: true } });
  const order = new Map(slugs.map((s, i) => [s, i]));
  return NextResponse.json(rows.sort((a, b) => order.get(a.slug)! - order.get(b.slug)!));
}
