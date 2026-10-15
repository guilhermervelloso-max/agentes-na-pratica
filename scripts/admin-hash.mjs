// Uso: npm run admin:hash -- "minha senha forte"   → copie a saída para ADMIN_PASSWORD_HASH
import { randomBytes, scryptSync } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 12) { console.error("Informe uma senha com pelo menos 12 caracteres."); process.exit(1); }
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`);
