#!/usr/bin/env python3
"""Gera data/casos.js (para abrir via file://) e feed.xml a partir de data/casos.json."""
import json, pathlib, datetime, email.utils
from xml.sax.saxutils import escape as e
R = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://guilhermervelloso-max.github.io/agentes-na-pratica/"
d = json.loads((R / "data/casos.json").read_text())
(R / "data/casos.js").write_text("window.CASOS=" + json.dumps(d, ensure_ascii=False) + ";")
def dt(s): y, m, dd = map(int, s.split("-")); return email.utils.format_datetime(datetime.datetime(y, m, dd, 12, tzinfo=datetime.timezone.utc))
items = "".join(f'<item><title>{e(c["titulo"])}</title><description>{e(c["resumo"])}</description><guid isPermaLink="false">{c["id"]}</guid><link>{BASE}index.html#/caso/{c["id"]}</link><pubDate>{dt(c["data"])}</pubDate></item>' for c in sorted(d["casos"], key=lambda c: c["data"], reverse=True))
(R / "feed.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Agentes na Prática</title><link>{BASE}</link><description>O que dá para fazer com agentes de IA</description><language>pt-BR</language>{items}</channel></rss>')
print("ok:", len(d["casos"]), "casos")
