"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { slug: string; title: string; summary: string; subreddit: string };

export function SavedList() {
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    let slugs: string[] = [];
    try { slugs = JSON.parse(localStorage.getItem("ap:salvos") || "[]"); } catch {}
    if (!slugs.length) return setItems([]);
    fetch("/api/salvos?slugs=" + encodeURIComponent(slugs.slice(0, 100).join(",")))
      .then((r) => r.json()).then((d: Item[]) => setItems(d)).catch(() => setItems([]));
  }, []);
  function remove(slug: string) {
    const s: string[] = JSON.parse(localStorage.getItem("ap:salvos") || "[]").filter((x: string) => x !== slug);
    localStorage.setItem("ap:salvos", JSON.stringify(s));
    setItems((it) => it?.filter((i) => i.slug !== slug) ?? null);
  }
  if (items === null) return <p>Carregando…</p>;
  if (!items.length) return <p className="mt-4">Nada salvo ainda. Clique em “Salvar” em qualquer caso.</p>;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <article key={i.slug} className="card">
          <h2 className="text-lg font-bold"><Link href={`/casos/${i.slug}`} className="text-tinta">{i.title}</Link></h2>
          <p>{i.summary}</p>
          <p className="text-xs text-mute">{i.subreddit}</p>
          <button type="button" className="btn-sec w-fit" onClick={() => remove(i.slug)}>Remover</button>
        </article>
      ))}
    </div>
  );
}
