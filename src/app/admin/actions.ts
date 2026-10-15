"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthError } from "next-auth";
import { requireAdmin, signIn, signOut } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/env";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/text";
import { runCollector } from "@/lib/collector";

const approveSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(8).max(140),
  summary: z.string().trim().min(30).max(2000),
  prompt: z.string().trim().max(3000).optional(),
  howTo: z.string().trim().max(2000).optional(),
  agents: z.array(z.string()).min(1),
  topic: z.string().min(1),
  author: z.string().trim().max(80).optional(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function approveCandidate(_: unknown, form: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  const p = approveSchema.safeParse({ ...Object.fromEntries(form), agents: form.getAll("agents") });
  if (!p.success) return { error: p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  const d = p.data;
  const s = await prisma.candidate.findUniqueOrThrow({ where: { id: d.id } });
  const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: d.topic } });
  let slug = slugify(d.title);
  if (await prisma.case.findUnique({ where: { slug } })) slug = `${slug}-${s.redditId}`;
  const c = await prisma.case.create({
    data: { slug, title: d.title, originalTitle: s.title, summary: d.summary, prompt: d.prompt || null, howTo: d.howTo || null,
      sourceUrl: s.sourceUrl, subreddit: s.subreddit, author: d.author || s.author, redditId: s.redditId,
      redditScore: s.redditScore, redditComments: s.redditComments, publishedAt: new Date(d.publishedAt + "T12:00:00Z"),
      topicId: topic.id, agents: { connect: d.agents.map((slug) => ({ slug })) } },
  });
  await prisma.candidate.update({ where: { id: s.id }, data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: admin, caseId: c.id } });
  revalidatePath("/", "layout");
  return {};
}

export async function rejectCandidate(form: FormData) {
  const admin = await requireAdmin();
  await prisma.candidate.update({ where: { id: String(form.get("id")) }, data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: admin } });
  revalidatePath("/admin");
}

export async function runCollectorNow() {
  await requireAdmin();
  await runCollector("week");
  revalidatePath("/admin");
}

// ---------- Login do admin ----------

export async function adminLogin(_: unknown, form: FormData): Promise<{ error?: string; sent?: boolean }> {
  const ip = await clientIp();
  if (!(await rateLimit(`admin-login:${ip}`, 8, 900))) return { error: "Muitas tentativas. Aguarde 15 minutos." };
  const method = form.get("method");
  try {
    if (method === "senha") {
      await signIn("senha", { password: String(form.get("password") || ""), redirectTo: "/admin" });
    } else {
      const email = String(form.get("email") || "").trim().toLowerCase();
      // Resposta igual para qualquer e-mail, para não revelar qual é o do admin.
      if (!isAdmin(email)) return { sent: true };
      await signIn("nodemailer", { email, redirectTo: "/admin", redirect: false });
      return { sent: true };
    }
  } catch (e) {
    if (e instanceof AuthError) return { error: "Não foi possível entrar." };
    throw e; // redirect do Next
  }
  return {};
}

export async function adminLogout() {
  await signOut({ redirectTo: "/" });
}
