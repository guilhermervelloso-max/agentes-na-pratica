#!/usr/bin/env python3
"""Coleta posts CANDIDATOS de fontes públicas para revisão manual.
NÃO publica nada: grava em scripts/candidatos.json. Use só a biblioteca padrão.
Fontes: Hacker News (API Algolia), Reddit (JSON público), Bluesky (searchPosts público).
Respeite os termos de cada serviço; para uso intenso do Reddit, use a API oficial com OAuth.
"""
import json, urllib.request, urllib.parse, time, pathlib
UA = {"User-Agent": "agentes-na-pratica-coletor/0.1 (curadoria manual)"}
TERMOS = ["AI agent", "Claude Code", "ChatGPT agent", "n8n agent", "agente de IA"]
SUBREDDITS = ["AI_Agents", "ClaudeAI", "ChatGPT", "n8n", "automation", "OpenAI", "LocalLLaMA"]

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return json.load(r)

def hn(t):
    d = get("https://hn.algolia.com/api/v1/search_by_date?tags=story&query=" + urllib.parse.quote(t))
    return [{"fonte": "Hacker News", "titulo": h.get("title"), "url": h.get("url") or f"https://news.ycombinator.com/item?id={h['objectID']}", "data": h.get("created_at"), "termo": t} for h in d["hits"]]

def reddit(sub, t):
    d = get(f"https://www.reddit.com/r/{sub}/search.json?restrict_sr=1&sort=new&limit=25&q=" + urllib.parse.quote(t))
    return [{"fonte": f"Reddit r/{sub}", "titulo": p["data"]["title"], "url": "https://www.reddit.com" + p["data"]["permalink"], "data": p["data"]["created_utc"], "termo": t} for p in d["data"]["children"]]

def bsky(t):
    d = get("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?limit=25&q=" + urllib.parse.quote(t))
    return [{"fonte": "Bluesky", "titulo": p["record"].get("text", "")[:200], "url": f"https://bsky.app/profile/{p['author']['handle']}/post/{p['uri'].split('/')[-1]}", "data": p["record"].get("createdAt"), "termo": t} for p in d.get("posts", [])]

def main():
    out, vistos = [], set()
    tarefas = [(hn, (t,)) for t in TERMOS] + [(bsky, (t,)) for t in TERMOS] + [(reddit, (s, "agent")) for s in SUBREDDITS]
    for fn, args in tarefas:
        try:
            for item in fn(*args):
                if item["url"] not in vistos:
                    vistos.add(item["url"]); item["status"] = "a_revisar"; out.append(item)
        except Exception as e:
            print(f"[aviso] {fn.__name__}{args}: {e}")
        time.sleep(1.5)
    p = pathlib.Path(__file__).with_name("candidatos.json")
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"{len(out)} candidatos gravados em {p} (revise antes de publicar)")

if __name__ == "__main__":
    main()
