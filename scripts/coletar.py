#!/usr/bin/env python3
"""Coleta posts CANDIDATOS de subreddits focados em casos de uso de IA, via feeds RSS públicos do Reddit.
NÃO publica nada: grava scripts/candidatos.json para curadoria humana.
Por que RSS: a partir de servidores, o JSON público (www/old.reddit.com/.json) e api.reddit.com
costumam responder 403/redirect; o feed .rss é público, oficial e respondeu 200 nos testes.
Para volume maior, use a API oficial do Reddit com OAuth (app-only) respeitando os termos.
Uso: python3 scripts/coletar.py [--periodo month|week|year] [--termos "use case,automated"]
"""
import json, time, pathlib, re, html, argparse, urllib.request
import xml.etree.ElementTree as ET
UA = {"User-Agent": "agentes-na-pratica-coletor/0.2 (curadoria manual; github.com/guilhermervelloso-max/agentes-na-pratica)"}
# Só comunidades onde a maioria dos posts são relatos de uso. r/OpenAI e r/LocalLLaMA foram testados
# e descartados: são majoritariamente notícias de modelos e discussões técnicas, não casos de uso.
SUBREDDITS = ["AI_Agents", "ClaudeAI", "ChatGPTPro", "n8n", "automation"]
NS = {"a": "http://www.w3.org/2005/Atom"}
SINAIS = ["i built", "i use", "i used", "i automated", "automat", "my workflow", "workflow", "use case",
          "saved me", "agent that", "how i", "built a", "built an", "replaced", "every day", "daily"]

def feed(sub, periodo):
    url = f"https://www.reddit.com/r/{sub}/top/.rss?t={periodo}&limit=100"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        root = ET.fromstring(r.read())
    for e in root.findall("a:entry", NS):
        texto = re.sub(r"<[^>]+>", " ", html.unescape(e.findtext("a:content", "", NS)))
        yield {"subreddit": f"r/{sub}", "titulo": e.findtext("a:title", "", NS),
               "url": e.find("a:link", NS).get("href"),
               "autor": e.findtext("a:author/a:name", "", NS),  # já vem como /u/nome
               "data": (e.findtext("a:published", "", NS) or e.findtext("a:updated", "", NS))[:10],
               "texto": re.sub(r"\s+", " ", texto).strip()[:3000]}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--periodo", default="month")
    ap.add_argument("--todos", action="store_true", help="não filtrar por sinais de caso de uso")
    a = ap.parse_args(); out = []
    for s in SUBREDDITS:
        try:
            for p in feed(s, a.periodo):
                alvo = (p["titulo"] + " " + p["texto"]).lower()
                if a.todos or any(k in alvo for k in SINAIS):
                    p["status"] = "a_revisar"; out.append(p)
        except Exception as ex:
            print(f"[aviso] r/{s}: {ex} (429 = limite de requisições; rode de novo mais tarde)")
        time.sleep(8)
    f = pathlib.Path(__file__).with_name("candidatos.json")
    f.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"{len(out)} candidatos em {f}. Revise, reescreva em PT-BR e só então adicione a data/casos.json.")

if __name__ == "__main__":
    main()
