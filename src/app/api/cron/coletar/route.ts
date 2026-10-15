import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { runCollector } from "@/lib/collector";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") || "");
  const exp = Buffer.from(`Bearer ${secret}`);
  return got.length === exp.length && timingSafeEqual(got, exp);
}

/** Chamado pelo agendador (vercel.json, crontab do servidor, etc.). Só cria candidatos PENDING. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const p = req.nextUrl.searchParams.get("periodo");
  const run = await runCollector(p === "day" || p === "month" ? p : "week");
  return NextResponse.json(run);
}
export const POST = GET;
