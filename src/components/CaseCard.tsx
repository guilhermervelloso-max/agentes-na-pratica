import Link from "next/link";
import type { CaseWithRels } from "@/lib/queries";
import { fmtShort, initials } from "@/lib/text";
import { CaseActions, CopyButton } from "./CaseActions";

const isNew = (d: Date) => Date.now() - d.getTime() < 7 * 864e5;

export function CaseCard({ c, open = false }: { c: CaseWithRels; open?: boolean }) {
  const block = c.prompt ? { label: "Ver prompt", text: c.prompt, note: null } : c.howTo ? { label: "Como reproduzir", text: c.howTo, note: "Derivado do post (o autor não publicou um prompt)." } : null;
  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-1.5">
        {c.agents.map((a) => (
          <Link key={a.slug} href={`/agentes/${a.slug}`} className="tag"><span aria-hidden>{initials(a.name)}</span> {a.name}</Link>
        ))}
        {isNew(c.createdAt) && <span className="tag bg-sol text-tinta">Novo</span>}
      </div>
      <h3 className="text-lg font-bold leading-snug">
        <Link href={`/casos/${c.slug}`} className="text-tinta no-underline hover:underline">{c.title}</Link>
      </h3>
      <p>{c.summary}</p>
      <p className="flex flex-wrap items-center gap-x-2 text-xs text-mute">
        <Link href={`/temas/${c.topic.slug}`}>{c.topic.name}</Link>·
        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{c.subreddit}</a>
        {c.redditScore > 0 && <span title="Votos e comentários no Reddit">▲ {c.redditScore} · 💬 {c.redditComments}</span>}·
        <span>{fmtShort(c.publishedAt)}</span>
        {c.author && <span>· por {c.author}</span>}
      </p>
      <p className="text-xs text-mute">Post original: “{c.originalTitle}”</p>
      {block && (
        <details open={open}>
          <summary className="cursor-pointer font-semibold text-mata">{block.label}</summary>
          {block.note && <small className="text-mute">{block.note}</small>}
          <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[#f4f1ea] p-3 text-sm">{block.text}</pre>
          <CopyButton text={block.text} />
        </details>
      )}
      <CaseActions id={c.id} slug={c.slug} title={c.title} summary={c.summary} initialWants={c.wantCount} />
    </article>
  );
}
