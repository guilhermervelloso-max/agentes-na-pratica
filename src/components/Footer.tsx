import Link from "next/link";
import { siteStats } from "@/lib/queries";
import { fmtDay } from "@/lib/text";

export async function Footer() {
  const s = await siteStats();
  return (
    <footer className="mt-12 px-4 py-8 text-center text-sm text-mute">
      <p>
        {s.cases} casos · {s.agents} agentes{s.updatedAt ? ` · atualizado em ${fmtDay(s.updatedAt)}` : ""}
      </p>
      <p className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/feed.xml">RSS</Link>
        <Link href="/apoiar">Apoiar</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/sobre">Sobre</Link>
      </p>
    </footer>
  );
}
