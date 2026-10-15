# Agentes na Prática

Catálogo em português (PT-BR) do que dá para fazer com agentes de IA, para quem não é da área técnica.
Site 100% estático: HTML, CSS e JavaScript puro, sem etapa de build. Os dados ficam em `data/casos.json`.

> Os 20 casos iniciais são **exemplos genéricos** escritos para o projeto (fonte “Exemplo”, sem link). Não representam pessoas ou publicações reais.

## Rodar localmente
- **Mais simples:** abra `index.html` no navegador. (Abrindo direto pelo arquivo, o site lê `data/casos.js`, uma cópia dos dados, porque navegadores bloqueiam `fetch` em `file://`.)
- **Recomendado:** na pasta do projeto, rode `python3 -m http.server 8000` e acesse http://localhost:8000.

## Adicionar casos
1. Edite `data/casos.json` e adicione um objeto em `casos`:
```json
{"id":"caso-21","titulo":"…","resumo":"…","agentes":["chatgpt"],"tema":"casa",
 "fonte":{"tipo":"Reddit","rotulo":"Reddit","url":"https://…"},"enviadoPor":null,
 "data":"2026-10-15","prompt":"…"}
```
   `agentes` e `tema` usam as chaves de `agentes` e `temas` no mesmo arquivo (dá para criar novas).
2. Atualize `atualizado` com a data do dia.
3. Regenere a cópia para `file://` e o RSS: `python3 scripts/gerar.py`.

## Publicar no GitHub Pages
Settings → Pages → *Build and deployment* → Source: **Deploy from a branch** → Branch `main`, pasta `/ (root)` → Save.
Em alguns minutos o site fica em `https://guilhermervelloso-max.github.io/agentes-na-pratica/`.
Troque `EMAIL` no topo de `app.js` pelo seu e-mail de contato.

## Funcionalidades (checklist)
Baseado em estudo externo da estrutura do agentusecases.ai; código, textos e identidade visual são originais.

| Recurso | Status |
|---|---|
| Home com cartões (título, resumo, selo do agente com sigla, tema, fonte, data) | ✅ |
| Agrupamento por dia (“N casos” por data) e selo “Novo” (últimos 7 dias) | ✅ |
| Contadores: total de casos, agentes, data de atualização, casos do último dia | ✅ |
| “Ver prompt” expansível + copiar prompt | ✅ |
| Compartilhar (Web Share API ou copia o link) | ✅ |
| Salvar (localStorage) + página “Salvos” com contador no menu | ✅ |
| “Quero isso” | ⚠️ estático: registra no localStorage e oferece e-mail (mailto) |
| Busca (ignora acentos) e filtros por agente e por tema | ✅ |
| Página Agentes (contagem + temas mais comuns) e página de cada agente | ✅ |
| Página Temas (contagem + agentes mais usados) e página de cada tema | ✅ |
| Página individual de cada caso com link compartilhável (`#/caso/id`) | ✅ |
| “Enviado por” no cartão | ✅ (campo `enviadoPor`) |
| Selo de fonte com link para o post original | ✅ (exemplos usam “Exemplo”, sem link) |
| Enviar caso | ⚠️ estático: formulário abre Issue no GitHub ou e-mail; cópia no localStorage |
| Moderação/revisão antes de publicar | ⚠️ manual (Issues + edição do JSON) |
| RSS (`feed.xml`) | ✅ estático, regenerado pelo script |
| Sobre, Apoiar (patrocínio), Privacidade (com botão “apagar meus dados”) | ✅ |
| Atualização diária automática a partir das fontes | ⚠️ semi: `scripts/coletar.py` gera candidatos; curadoria é humana |
| Contagem de engajamento da fonte (ex.: curtidas) | ❌ não incluído (exigiria API em tempo real) |
| Responsivo / funciona abrindo `index.html` | ✅ |

## Fontes
Pelo que o agentusecases.ai mostra publicamente (rodapé e selos dos cartões), os casos vêm de: **web aberta** (blogs, Substack), **X**, **Reddit**, **Hacker News**, **Bluesky** e **envios de usuários**, sempre reescritos e com link para o original. Termos e subreddits abaixo são *inferidos*, não informados pelo site.

| Fonte | Como coletar de forma legal |
|---|---|
| Hacker News | API pública Algolia: `hn.algolia.com/api/v1/search_by_date?query=…` (sem chave) |
| Reddit | JSON público (`/r/<sub>/search.json`) para baixo volume; para uso regular, API oficial com OAuth e User-Agent identificado. Sugestões: r/AI_Agents, r/ClaudeAI, r/ChatGPT, r/n8n, r/automation, r/OpenAI, r/LocalLLaMA |
| Bluesky | API pública `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` |
| X | API oficial do X (busca recente, plano pago/créditos). Não fazer scraping |
| Blogs / Substack | RSS de cada publicação (`<blog>.substack.com/feed`) |
| Envios | Issues do GitHub e e-mail pelo formulário do site |

Termos sugeridos: “AI agent”, “Claude Code”, “ChatGPT agent”, “n8n agent”, “agente de IA”, nomes de agentes + “I used / automated”.

`python3 scripts/coletar.py` busca candidatos no HN, Reddit e Bluesky e grava `scripts/candidatos.json` (fora do git). **Nada é publicado automaticamente**: leia, reescreva em português com suas palavras, credite e linke a fonte, e só então adicione ao `casos.json`.

## Estrutura
`index.html`, `style.css`, `app.js`, `feed.xml`, `data/casos.json`, `data/casos.js`, `scripts/coletar.py`, `scripts/gerar.py`.
