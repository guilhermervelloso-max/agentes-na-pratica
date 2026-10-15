import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Apoiar", alternates: { canonical: "/apoiar" } };

export default function Apoiar() {
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-extrabold">Apoiar</h1>
      <p>Gostou do projeto? A melhor ajuda é compartilhar os casos com quem está começando a usar IA.</p>
      <p>Para parcerias e patrocínio{CONTACT_EMAIL ? <> escreva para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</> : ", entre em contato pelos canais do mantenedor."}</p>
      <p className="text-sm text-mute">Patrocínios nunca influenciam quais casos são publicados.</p>
    </article>
  );
}
