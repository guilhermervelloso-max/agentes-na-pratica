export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "Agentes na Prática";
export const SITE_DESCRIPTION = "Catálogo em português do que pessoas reais fazem com agentes de IA, com casos tirados de comunidades do Reddit.";
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "";
export const SUBREDDITS = ["AI_Agents", "ClaudeAI", "ChatGPTPro", "n8n", "automation"] as const;

/** Único admin do site (Guilherme). */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
export const isAdmin = (email?: string | null) => !!ADMIN_EMAIL && !!email && email.toLowerCase() === ADMIN_EMAIL;
export const abs = (path: string) => SITE_URL + (path.startsWith("/") ? path : "/" + path);
