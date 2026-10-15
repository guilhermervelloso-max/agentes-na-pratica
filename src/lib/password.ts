import { scryptSync, timingSafeEqual } from "node:crypto";

/** Formato: scrypt:<salt-hex>:<hash-hex>. Gere com: npm run admin:hash -- "sua-senha" */
export function verifyPassword(password: string, stored: string): boolean {
  const [alg, salt, hash] = stored.split(":");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const got = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return got.length === expected.length && timingSafeEqual(got, expected);
}
