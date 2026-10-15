# Agentes na Prática

Catálogo em português (PT-BR) do que dá para fazer com agentes de IA, para quem não é da área técnica.
Site 100% estático: HTML, CSS e JavaScript puro, sem etapa de build. Os dados ficam em `data/casos.json`.

> Todos os casos são **posts reais do Reddit**, com título original, link, subreddit, autor (u/nome) e data. Os resumos foram escritos em PT-BR. Como nenhum dos posts trazia um prompt pronto, cada caso mostra um “Como reproduzir” derivado do post e identificado como tal. Os resultados são relatos dos autores, não verificados.

## Rodar localmente
- **Mais simples:** abra `index.html` no navegador. (Abrindo direto pelo arquivo, o site lê `data/casos.js`, uma cópia dos dados, porque navegadores bloqueiam `fetch` em `file://`.)
- **Recomendado:** na pasta do projeto, rode `python3 -m http.server 8000` e acesse http://localhost:8000.

## Adicionar casos
1. Edite `data/casos.json` e adicione um objeto em `casos`:
```json
{"id":"r-<id do post>","titulo":"Título em PT-BR","tituloOriginal":"Título do post",
 "resumo":"…","agentes":["n8n"],"tema":"casa",
 "fonte":{"tipo":"Reddit","rotulo":"r/n8n","url":"https://www.reddit.com/r/n8n/comments/…"},
 "autor":"u/nome","data":"2026-10-15","prompt":null,"comoReproduzir":"…"}
```
   Use `prompt` só se o post mostrar um prompt; senão deixe `null` e preencha `comoReproduzir`.
   `agentes` e `tema` usam as chaves de `agentes` e `temas` no mesmo arquivo (dá para criar novas).
2. Atualize `atualizado` com a data do dia.
3. Regenere a cópia para `file://` e o RSS: `python3 scripts/gerar.py`.

## Funcionalidades (checklist)
Baseado em estudo externo da estrutura do agentusecases.ai; código, textos e identidade visual são originais.

| Recurso | Status |
|---|---|
| Home com cartões (título, resumo, selo do agente com sigla, tema, fonte, data) | ✅ |
| Agrupamento por dia (“N casos” por data) e selo “Novo” (últimos 7 dias) | ✅ |
| Contadores: total de casos, agentes, data de atualização, casos do último dia | ✅ |
| “Ver prompt” (quando o post traz um) ou “Como reproduzir” (derivado do post), expansível e copiável | ✅ |
| Compartilhar (Web Share API ou copia o link) | ✅ |
| Salvar (localStorage) + página “Salvos” com contador no menu | ✅ |
| “Quero isso” | ⚠️ estático: registra no localStorage e oferece e-mail (mailto) |
| Busca (ignora acentos) e filtros por agente e por tema | ✅ |
| Página Agentes (contagem + temas mais comuns) e página de cada agente | ✅ |
| Página Temas (contagem + agentes mais usados) e página de cada tema | ✅ |
| Página individual de cada caso com link compartilhável (`#/caso/id`) | ✅ |
| Autor do post (u/nome) e título original no cartão | ✅ |
| Selo de fonte (subreddit) com link para o post original | ✅ |
| Enviar caso | ⚠️ estático: formulário abre Issue no GitHub ou e-mail; cópia no localStorage |
| Moderação/revisão antes de publicar | ⚠️ manual (Issues + edição do JSON) |
| RSS (`feed.xml`) | ✅ estático, regenerado pelo script |
| Sobre, Apoiar (patrocínio), Privacidade (com botão “apagar meus dados”) | ✅ |
| Atualização diária automática a partir das fontes | ⚠️ semi: `scripts/coletar.py` gera candidatos; curadoria é humana |
| Contagem de engajamento da fonte (ex.: curtidas) | ❌ não incluído (exigiria API em tempo real) |
| Responsivo / funciona abrindo `index.html` | ✅ |

## Fontes
Somente subreddits focados em **relatos de uso de IA**:

| Subreddit | Por quê |
|---|---|
| r/AI_Agents | Comunidade de agentes; muitos relatos “eu construí / eu uso” |
| r/ClaudeAI | Projetos concretos feitos com Claude e Claude Code |
| r/ChatGPTPro | Usuários avançados contando como usam o ChatGPT no dia a dia |
| r/n8n | Fluxos de automação com IA para negócios e uso pessoal, geralmente com detalhes |
| r/automation | Automações reais em empresas pequenas e na rotina |

Testados e **descartados**: r/OpenAI e r/LocalLLaMA (a maior parte dos posts é notícia de modelos ou discussão técnica, não caso de uso).

### Coleta (`scripts/coletar.py`)
`python3 scripts/coletar.py --periodo month` (ou `week`, `year`) lê o feed **RSS público** dos posts mais votados de cada subreddit, filtra os que parecem relatos de uso e grava `scripts/candidatos.json` (fora do git). Sem dependências externas.

- Por que RSS: de servidores, `www.reddit.com/.json` e `api.reddit.com` responderam 403, e `old.reddit.com` redirecionou (302). O `.rss` respondeu 200.
- O Reddit limita requisições (erro 429). O script espera 8 s entre subreddits; se aparecer 429, rode de novo mais tarde.
- Para coleta regular ou em maior volume, o caminho oficial é a API do Reddit com OAuth (app-only), seguindo os termos de uso.
- **Nada é publicado automaticamente.** Leia o post, escreva um resumo fiel em PT-BR com suas palavras, credite autor e subreddit, linke o original e só então adicione ao `casos.json`.

## Estrutura
`index.html`, `style.css`, `app.js`, `feed.xml`, `data/casos.json`, `data/casos.js`, `scripts/coletar.py`, `scripts/gerar.py`.
