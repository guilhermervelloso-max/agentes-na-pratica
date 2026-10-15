import type { Metadata } from "next";
import { SUBREDDITS } from "@/lib/env";

export const metadata: Metadata = { title: "Sobre", alternates: { canonical: "/sobre" } };

export default function Sobre() {
  return (
    <article className="prose mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-extrabold">Sobre</h1>
      <p>O <strong>Agentes na Prática</strong> é um catálogo em português de coisas úteis que pessoas reais fazem com agentes de IA, explicado sem jargão.</p>
      <p>Todo caso vem de um post público do Reddit em comunidades dedicadas a usos de IA: {SUBREDDITS.map((s) => `r/${s}`).join(", ")}. Escrevemos um resumo com nossas palavras e sempre linkamos o post original, com autor, data e engajamento.</p>
      <p>Quando o autor publicou o prompt usado, ele aparece em “Ver prompt”. Quando não, mostramos um “Como reproduzir” derivado do post e identificado assim.</p>
      <p>Um coletor busca candidatos todos os dias, mas <strong>nada é publicado automaticamente</strong>: cada caso é lido e revisado manualmente antes de entrar no site.</p>
      <p>Os resultados descritos são relatos dos autores e não foram verificados por nós.</p>
    </article>
  );
}
