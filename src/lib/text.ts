export function slugify(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
const TZ = "America/Sao_Paulo";
export const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
export const fmtDay = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "short", year: "numeric" });
export const fmtShort = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: TZ, month: "short", year: "numeric" });
export const initials = (n: string) => n.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "··";
export function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}
