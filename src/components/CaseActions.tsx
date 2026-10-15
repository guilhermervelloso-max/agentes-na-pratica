"use client";
import { useEffect, useState, useTransition } from "react";
import { wantCase } from "@/app/actions";

const KEY_SAVED = "ap:salvos";
const KEY_WANT = "ap:quero";
const read = (k: string): string[] => {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
};
const write = (k: string, v: string[]) => localStorage.setItem(k, JSON.stringify(v));

export function CaseActions({ id, slug, title, summary, initialWants }: { id: string; slug: string; title: string; summary: string; initialWants: number }) {
  const [saved, setSaved] = useState(false);
  const [wanted, setWanted] = useState(false);
  const [wants, setWants] = useState(initialWants);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setSaved(read(KEY_SAVED).includes(slug));
    setWanted(read(KEY_WANT).includes(id));
  }, [id, slug]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };

  function toggleSave() {
    const s = read(KEY_SAVED);
    const next = s.includes(slug) ? s.filter((x) => x !== slug) : [slug, ...s].slice(0, 500);
    write(KEY_SAVED, next);
    setSaved(next.includes(slug));
    flash(next.includes(slug) ? "Salvo neste navegador" : "Removido dos salvos");
    window.dispatchEvent(new Event("ap:salvos"));
  }

  function want() {
    if (wanted) return;
    start(async () => {
      const r = await wantCase(id);
      if (r.count !== null) setWants(r.count);
      write(KEY_WANT, [...read(KEY_WANT), id]);
      setWanted(true);
      flash("Anotado! Obrigado.");
    });
  }

  async function share() {
    const url = `${location.origin}/casos/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title, text: summary, url });
      else { await navigator.clipboard.writeText(url); flash("Link copiado"); }
    } catch { /* cancelado */ }
  }

  return (
    <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
      <button type="button" className="btn-sec" onClick={share}>Compartilhar</button>
      <button type="button" className={wanted ? "btn" : "btn-sec"} onClick={want} disabled={pending} aria-pressed={wanted} title="Quero fazer isso também">
        Quero isso{wants > 0 ? ` · ${wants}` : ""}
      </button>
      <button type="button" className={saved ? "btn" : "btn-sec"} onClick={toggleSave} aria-pressed={saved}>
        {saved ? "Salvo ✓" : "Salvar"}
      </button>
      <span role="status" className="text-xs text-mute">{msg}</span>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn-sec mt-2" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? "Copiado ✓" : "Copiar"}
    </button>
  );
}
