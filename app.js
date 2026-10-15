// Agentes na Prática — app estático (sem build). Dados: data/casos.json (fallback data/casos.js para file://)
const EMAIL = "contato@exemplo.com"; // troque pelo seu e-mail
const REPO = "https://github.com/guilhermervelloso-max/agentes-na-pratica";
let D; const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const salvos = () => JSON.parse(localStorage.getItem("ap_salvos") || "[]");
const setSalvos = a => { localStorage.setItem("ap_salvos", JSON.stringify(a)); contaSalvos(); };
const contaSalvos = () => { const n = salvos().length; $("#nsalvos").textContent = n ? `(${n})` : ""; };
const toast = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; setTimeout(() => t.hidden = true, 2200); };
const fmtData = d => new Date(d + "T12:00").toLocaleDateString("pt-BR", {weekday:"short", day:"2-digit", month:"short", year:"numeric"});
const sigla = n => n.replace(/[^A-Za-zÀ-ú0-9 ]/g,"").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "··";
const novo = d => (new Date(D.atualizado) - new Date(d)) / 864e5 < 7;

function card(c) {
  const sv = salvos().includes(c.id);
  const fonte = c.fonte.url ? `<a href="${esc(c.fonte.url)}" target="_blank" rel="noopener">${esc(c.fonte.rotulo)}</a>` : `<span class="tag ex" title="Caso ilustrativo, sem fonte externa">${esc(c.fonte.rotulo)}</span>`;
  return `<article class="card">
   <div class="meta">${c.agentes.map(a => `<a class="tag" href="#/agente/${a}">${sigla(D.agentes[a])} · ${esc(D.agentes[a])}</a>`).join("")}
    ${novo(c.data) ? '<span class="tag novo">Novo</span>' : ""}</div>
   <h3><a href="#/caso/${c.id}">${esc(c.titulo)}</a></h3><p>${esc(c.resumo)}</p>
   <div class="meta"><a href="#/tema/${c.tema}">${esc(D.temas[c.tema])}</a> · ${fonte} · ${fmtData(c.data)}
    ${c.enviadoPor ? ` · Enviado por ${esc(c.enviadoPor)}` : ""}</div>
   <details><summary>Ver prompt</summary><pre>${esc(c.prompt)}</pre><button class="sec" data-copiar="${c.id}">Copiar prompt</button></details>
   <div class="acoes"><button class="sec" data-share="${c.id}">Compartilhar</button>
    <button class="sec" data-quero="${c.id}">Quero isso</button>
    <button class="${sv ? "on" : "sec"}" data-salvar="${c.id}">${sv ? "Salvo ✓" : "Salvar"}</button></div></article>`;
}
function porDia(lista) {
  const g = {}; lista.forEach(c => (g[c.data] ??= []).push(c));
  return Object.keys(g).sort().reverse().map(d => `<h2 class="dia">${fmtData(d)} · ${g[d].length} caso${g[d].length > 1 ? "s" : ""}</h2><div class="grade">${g[d].map(card).join("")}</div>`).join("");
}
const contagem = (campo, k) => D.casos.filter(c => campo === "agente" ? c.agentes.includes(k) : c.tema === k).length;
const maisUsados = (campo, k) => {
  const cnt = {}; D.casos.filter(c => campo === "tema" ? c.tema === k : c.agentes.includes(k)).forEach(c => campo === "tema" ? c.agentes.forEach(a => cnt[a] = (cnt[a]||0)+1) : cnt[c.tema] = (cnt[c.tema]||0)+1);
  return Object.entries(cnt).sort((a,b) => b[1]-a[1]).slice(0,3).map(([x]) => campo === "tema" ? D.agentes[x] : D.temas[x]).join(" · ");
};

function home(q = {}) {
  const ult = [...new Set(D.casos.map(c => c.data))].sort().pop(), nUlt = D.casos.filter(c => c.data === ult).length;
  $("#app").innerHTML = `<h1>O que as pessoas fazem com agentes de IA</h1>
   <p class="sub">${D.casos.length} casos · atualizado em ${fmtData(D.atualizado)} · <strong>${nUlt} casos novos</strong> no último dia. Fontes: web aberta, X, Reddit, Hacker News, Bluesky e envios. Os casos iniciais são <span class="tag ex">Exemplo</span>.</p>
   <div class="ctrl"><input type="search" id="busca" placeholder="Buscar: WhatsApp, imposto, viagem…" value="${esc(q.busca||"")}">
    <select id="fAgente"><option value="">Todos os agentes</option>${Object.entries(D.agentes).map(([k,v]) => `<option value="${k}" ${q.agente===k?"selected":""}>${esc(v)}</option>`).join("")}</select>
    <select id="fTema"><option value="">Todos os temas</option>${Object.entries(D.temas).map(([k,v]) => `<option value="${k}" ${q.tema===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div>
   <div id="res"></div>`;
  const f = () => {
    const b = $("#busca").value.toLowerCase().normalize("NFD").replace(/\p{M}/gu,""), a = $("#fAgente").value, t = $("#fTema").value;
    const l = D.casos.filter(c => (!a || c.agentes.includes(a)) && (!t || c.tema === t) && (!b || (c.titulo+" "+c.resumo+" "+c.prompt+" "+c.agentes.map(x=>D.agentes[x]).join(" ")).toLowerCase().normalize("NFD").replace(/\p{M}/gu,"").includes(b)));
    $("#res").innerHTML = l.length ? porDia(l) : "<p>Nenhum caso encontrado. Que tal <a href='#/enviar'>enviar um</a>?</p>";
  };
  ["#busca","#fAgente","#fTema"].forEach(s => $(s).addEventListener("input", f)); f();
}
const paginas = {
  agentes: () => `<h1>Agentes de IA e o que fazem</h1><p class="sub">${Object.keys(D.agentes).length} agentes e ferramentas. Escolha um para ver os casos.</p>
    <div class="lista">${Object.entries(D.agentes).map(([k,v]) => `<a class="card" href="#/agente/${k}"><span class="tag">${sigla(v)}</span><h3>${esc(v)}</h3><span class="n">${contagem("agente",k)}</span><small>Mais comum em: ${esc(maisUsados("agente",k)) || "—"}</small></a>`).join("")}</div>`,
  temas: () => `<h1>Temas</h1><p class="sub">Casos agrupados pelo tipo de tarefa.</p>
    <div class="lista">${Object.entries(D.temas).map(([k,v]) => `<a class="card" href="#/tema/${k}"><h3>${esc(v)}</h3><span class="n">${contagem("tema",k)}</span><small>Agentes mais usados: ${esc(maisUsados("tema",k)) || "—"}</small></a>`).join("")}</div>`,
  salvos: () => { const l = D.casos.filter(c => salvos().includes(c.id)); return `<h1>Seus salvos</h1><p class="sub">Ficam guardados só neste navegador (localStorage).</p>${l.length ? `<div class="grade">${l.map(card).join("")}</div>` : "<p>Nada salvo ainda. Clique em “Salvar” em qualquer caso.</p>"}`; },
  sobre: () => `<h1>Sobre</h1><p>O <strong>Agentes na Prática</strong> é um catálogo em português de coisas úteis que dá para fazer com agentes de IA, explicado sem jargão.</p>
    <p>Cada caso traz um resumo em palavras nossas, o agente usado, a fonte e um prompt de exemplo para você adaptar. Os casos iniciais são <strong>exemplos genéricos</strong>, marcados como “Exemplo”. Casos reais sempre terão link para a publicação original.</p>
    <p>Qualquer pessoa pode <a href="#/enviar">enviar um caso</a>. Tudo é revisado manualmente antes de publicar.</p><p>Código aberto: <a href="${REPO}">${REPO}</a></p>`,
  privacidade: () => `<h1>Privacidade</h1><p>Este site é estático. Não usamos cookies, rastreadores nem contas. Seus itens salvos e pedidos “Quero isso” ficam apenas no <em>localStorage</em> do seu navegador e podem ser apagados limpando os dados do site.</p><p>Ao enviar um caso por e-mail ou GitHub, você compartilha as informações que escrever com o mantenedor.</p><button id="limpar">Apagar meus dados locais</button>`,
  apoiar: () => `<h1>Apoiar</h1><p>Gostou do projeto? Divulgue, envie casos ou contribua no <a href="${REPO}">GitHub</a>. Para parcerias e patrocínio, escreva para <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
  enviar: () => `<h1>Enviar um caso</h1><p class="sub">Conte o que você (ou alguém) fez com um agente. Revisamos antes de publicar.</p>
    <form class="f" id="fEnviar"><input name="titulo" required placeholder="Título curto (ex.: Responder clientes no WhatsApp)">
    <select name="agente">${Object.entries(D.agentes).map(([k,v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
    <select name="tema">${Object.entries(D.temas).map(([k,v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
    <textarea name="resumo" required rows="3" placeholder="O que o agente fez?"></textarea><textarea name="prompt" rows="3" placeholder="Prompt usado (opcional)"></textarea>
    <input name="link" type="url" placeholder="Link da fonte (opcional)"><input name="nome" placeholder="Seu nome ou @ (opcional)">
    <div class="acoes"><button value="github">Enviar pelo GitHub</button><button value="email" class="sec">Enviar por e-mail</button></div></form>`
};
function rota() {
  const [, p, id] = (location.hash || "#/").split("/"); window.scrollTo(0,0);
  if (!p) return home();
  if (p === "agente") return home({agente:id});
  if (p === "tema") return home({tema:id});
  if (p === "caso") { const c = D.casos.find(x => x.id === id); $("#app").innerHTML = c ? `<p><a href="#/">← Todos os casos</a></p><div style="max-width:640px">${card(c)}</div>` : "<p>Caso não encontrado.</p>"; const d=$("details"); if(d) d.open = true; document.title = (c?c.titulo+" — ":"")+"Agentes na Prática"; return; }
  $("#app").innerHTML = (paginas[p] || (() => "<h1>Página não encontrada</h1>"))();
}
document.addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return; const ds = b.dataset;
  const c = D.casos.find(x => x.id === (ds.salvar||ds.share||ds.quero||ds.copiar));
  if (ds.salvar) { const s = salvos(), i = s.indexOf(ds.salvar); i < 0 ? s.push(ds.salvar) : s.splice(i,1); setSalvos(s); rota(); toast(i<0 ? "Salvo neste navegador" : "Removido dos salvos"); }
  if (ds.copiar) { await navigator.clipboard?.writeText(c.prompt); toast("Prompt copiado"); }
  if (ds.share) { const url = location.href.split("#")[0] + "#/caso/" + c.id;
    if (navigator.share) navigator.share({title:c.titulo, text:c.resumo, url}).catch(()=>{}); else { await navigator.clipboard?.writeText(url); toast("Link copiado"); } }
  if (ds.quero) { const q = JSON.parse(localStorage.getItem("ap_quero")||"[]"); if(!q.includes(c.id)) q.push(c.id); localStorage.setItem("ap_quero", JSON.stringify(q));
    if (confirm("Anotado! Quer pedir ajuda por e-mail para montar isso?")) location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Quero isso: "+c.titulo)}&body=${encodeURIComponent("Olá! Tenho interesse neste caso: "+c.titulo)}`; }
  if (b.id === "limpar") { localStorage.removeItem("ap_salvos"); localStorage.removeItem("ap_quero"); contaSalvos(); toast("Dados locais apagados"); }
});
document.addEventListener("submit", e => {
  e.preventDefault(); const f = new FormData(e.target), via = e.submitter?.value;
  const txt = `Agente: ${D.agentes[f.get("agente")]}\nTema: ${D.temas[f.get("tema")]}\nResumo: ${f.get("resumo")}\nPrompt: ${f.get("prompt")}\nFonte: ${f.get("link")}\nEnviado por: ${f.get("nome")}`;
  const t = "Novo caso: " + f.get("titulo");
  const env = JSON.parse(localStorage.getItem("ap_envios")||"[]"); env.push(Object.fromEntries(f)); localStorage.setItem("ap_envios", JSON.stringify(env));
  location.href = via === "email" ? `mailto:${EMAIL}?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(txt)}` : `${REPO}/issues/new?title=${encodeURIComponent(t)}&body=${encodeURIComponent(txt)}&labels=novo-caso`;
});
async function iniciar() {
  try { D = await (await fetch("data/casos.json")).json(); } catch { D = window.CASOS; }
  $("#stats").textContent = `${D.casos.length} casos · ${Object.keys(D.agentes).length} agentes · atualizado em ${fmtData(D.atualizado)}`;
  contaSalvos(); addEventListener("hashchange", rota); rota();
}
iniciar();
