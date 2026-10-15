import type { CaseWithRels } from "@/lib/queries";
import { dayKey, fmtDay } from "@/lib/text";
import { CaseCard } from "./CaseCard";

/** Agrupa por dia de publicação, com contagem por dia. */
export function CaseList({ cases }: { cases: CaseWithRels[] }) {
  if (!cases.length) return <p className="text-mute">Nenhum caso encontrado.</p>;
  const groups = new Map<string, CaseWithRels[]>();
  for (const c of cases) {
    const k = dayKey(c.publishedAt);
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return (
    <div>
      {[...groups.entries()].map(([k, list]) => (
        <section key={k} aria-label={fmtDay(list[0].publishedAt)}>
          <h2 className="mb-3 mt-8 border-l-4 border-sol pl-3 text-base font-bold">
            {fmtDay(list[0].publishedAt)} · {list.length} caso{list.length > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CaseCard key={c.id} c={c} />)}</div>
        </section>
      ))}
    </div>
  );
}
