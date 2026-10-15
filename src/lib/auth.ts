import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { createTransport } from "nodemailer";
import { prisma } from "./db";
import { ADMIN_EMAIL, isAdmin, SITE_NAME } from "./env";
import { verifyPassword } from "./password";

/**
 * O site público não tem contas. Este login existe só para o ADMIN (ADMIN_EMAIL):
 *  - link mágico por e-mail (se EMAIL_SERVER estiver definido), e/ou
 *  - senha (se ADMIN_PASSWORD_HASH estiver definido).
 * Qualquer outro e-mail é recusado antes de qualquer envio.
 */
const providers: Provider[] = [];
export const emailLoginEnabled = !!process.env.EMAIL_SERVER;
export const passwordLoginEnabled = !!process.env.ADMIN_PASSWORD_HASH;

if (emailLoginEnabled)
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "nao-responda@localhost",
      maxAge: 60 * 15,
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!isAdmin(identifier)) return; // nunca manda e-mail para quem não é o admin
        const host = new URL(url).host;
        const r = await createTransport(provider.server).sendMail({
          to: identifier,
          from: provider.from,
          subject: `Acesso admin — ${SITE_NAME}`,
          text: `Link de acesso ao painel de ${host} (vale 15 minutos):\n${url}\n\nSe não foi você, ignore.`,
          html: `<p>Link de acesso ao painel de <b>${host}</b> (vale 15 minutos):</p><p><a href="${url}">Entrar no painel</a></p><p>Se não foi você, ignore.</p>`,
        });
        if (r.rejected.length) throw new Error("Falha ao enviar e-mail");
      },
    }),
  );

if (passwordLoginEnabled)
  providers.push(
    Credentials({
      id: "senha",
      name: "Senha",
      credentials: { password: { label: "Senha", type: "password" } },
      async authorize(c) {
        const pw = typeof c?.password === "string" ? c.password : "";
        if (!ADMIN_EMAIL || !pw || !verifyPassword(pw, process.env.ADMIN_PASSWORD_HASH!)) return null;
        return { id: "admin", email: ADMIN_EMAIL, name: "Admin" };
      },
    }),
  );

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || undefined,
  pages: { signIn: "/admin/entrar", verifyRequest: "/admin/entrar?enviado=1", error: "/admin/entrar" },
  providers,
  callbacks: {
    signIn: ({ user }) => isAdmin(user.email),
  },
});

export async function requireAdmin(): Promise<string> {
  const s = await auth();
  if (!isAdmin(s?.user?.email)) throw new Error("Acesso negado");
  return s!.user!.email!;
}
