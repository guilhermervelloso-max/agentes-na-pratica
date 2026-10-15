"use client";
import { useActionState } from "react";
import { approveCandidate } from "./actions";

type Opt = { slug: string; name: string };
export function ApproveForm({ c, agents, topics }: { c: { id: string; author: string | null; date: string }; agents: Opt[]; topics: Opt[] }) {
  const [state, action, pending] = useActionState(approveCandidate, {});
  return (
    <details>
      <summary className="cursor-pointer font-semibold text-mata">Aprovar e publicar…</summary>
      <form action={action} className="mt-2 grid gap-2">
        <input type="hidden" name="id" value={c.id} />
        <input name="title" required minLength={8} maxLength={140} placeholder="Título em PT-BR" className="input" />
        <textarea name="summary" required minLength={30} maxLength={2000} rows={3} placeholder="Resumo fiel ao post, em PT-BR" className="input" />
        <textarea name="howTo" maxLength={2000} rows={2} placeholder="Como reproduzir (derivado do post)" className="input" />
        <textarea name="prompt" maxLength={3000} rows={2} placeholder="Prompt (somente se o post mostrar um)" className="input" />
        <fieldset className="flex flex-wrap gap-3 text-sm"><legend className="font-semibold">Agentes</legend>
          {agents.map((a) => <label key={a.slug}><input type="checkbox" name="agents" value={a.slug} /> {a.name}</label>)}
        </fieldset>
        <select name="topic" required className="input" defaultValue=""><option value="" disabled>Tema</option>{topics.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select>
        <div className="flex gap-2">
          <input name="author" defaultValue={c.author ?? ""} placeholder="u/autor" className="input flex-1" />
          <input name="publishedAt" type="date" defaultValue={c.date} required className="input" />
        </div>
        {state.error && <p className="text-sm text-red-800">{state.error}</p>}
        <button className="btn w-fit" disabled={pending}>Publicar caso</button>
      </form>
    </details>
  );
}
