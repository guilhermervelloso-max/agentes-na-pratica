import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Privacidade", alternates: { canonical: "/privacidade" } };

export default function Privacidade() {
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-extrabold">Privacidade</h1>
      <p>O site é público e não tem contas de usuário. Não usamos cookies de rastreamento nem publicidade.</p>
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Salvar</strong>: a lista fica só no <em>localStorage</em> do seu navegador. Não chega ao servidor, exceto para buscar os títulos quando você abre “Salvos”.</li>
        <li><strong>Quero isso</strong>: guardamos apenas um contador anônimo por caso. Para evitar abuso, o endereço IP é usado temporariamente em um limite de requisições e não é associado a você.</li>
        <li>Os registros técnicos do provedor de hospedagem podem conter IP e navegador, por tempo limitado.</li>
      </ul>
      <p>Os casos citam posts públicos do Reddit com nome de usuário e link. Se você é autor de um post e quer que ele seja removido{CONTACT_EMAIL ? <>, escreva para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></> : ", entre em contato"}.</p>
    </article>
  );
}
