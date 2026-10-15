# Agentes na Prática

Catálogo público, em português, do que pessoas reais fazem com agentes de IA. Os casos vêm de posts do Reddit em comunidades sobre uso de IA. Cada um tem um resumo em PT-BR, link para o original, autor, data e engajamento.

**Stack (tudo gratuito e de código aberto):** Next.js 15 (App Router, TypeScript) · PostgreSQL + Prisma · Tailwind CSS 4 · Auth.js (somente para o admin).
O código não depende de nenhum host: roda em qualquer lugar com Node 20 ou Docker e um Postgres.

## Notas — 15 de outubro de 2026

- O catálogo em `data/casos.json` passou de 32 para **42 casos**. Entraram 10 relatos novos, só de quem fez ou usa de verdade, das comunidades já listadas abaixo. Campo `atualizado`: `2026-10-15`.
- A aba de **sugerir um caso** fica de fora desta versão. O envio por visitantes continua no futuro.
- O próximo lote é **sexta, 23 de outubro de 2026**. Antes disso o catálogo não muda. Nada é publicado automaticamente: cada caso passa por revisão.

## Rodar localmente

### Opção 1: um comando (Docker)
```bash
docker compose up --build
```
- Site: http://localhost:3000. As migrações e os 42 casos são carregados automaticamente.
- Painel: http://localhost:3000/admin/entrar. Use o e-mail `admin@localhost`; o link chega no Mailpit, em http://localhost:8025.
- Para mudar valores, crie um `.env` ao lado do `docker-compose.yml` (o Compose lê `ADMIN_EMAIL`, `AUTH_SECRET` etc.).

### Opção 2: `npm run dev`
Requer Node 20+ e um Postgres. Para subir só o banco e o e-mail: `docker compose up db mail`.
```bash
cp .env.example .env          # ajuste DATABASE_URL, ADMIN_EMAIL...
npm install
npm run setup                 # migrações + seed dos 42 casos
npm run dev                   # http://localhost:3000
```

Outros comandos: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`, `npm run db:migrate:dev` (cria uma migração depois de mudar o schema), `npm run admin:hash -- "senha"`.

## Variáveis de ambiente
Todas estão documentadas em [`.env.example`](.env.example).

| Variável | Obrigatória | Para quê |
|---|---|---|
| `DATABASE_URL` | sim | Conexão Postgres |
| `NEXT_PUBLIC_SITE_URL` | sim | URL pública, sem barra no final (ex.: `https://agentes.seudominio.com.br`). Usada em SEO, sitemap, RSS, Open Graph e e-mails |
| `AUTH_SECRET` | sim | Segredo das sessões (`openssl rand -base64 32`) |
| `AUTH_URL` | sim | A mesma URL do site (`NEXTAUTH_URL` também é aceita) |
| `AUTH_TRUST_HOST` | fora da Vercel | `true` atrás de proxy, Docker ou VPS |
| `ADMIN_EMAIL` | sim | O único e-mail com acesso a `/admin` |
| `EMAIL_SERVER`, `EMAIL_FROM` | uma das duas formas de login | SMTP para o link mágico do admin |
| `ADMIN_PASSWORD_HASH` | uma das duas formas de login | Login do admin por senha (`npm run admin:hash -- "senha"`) |
| `CRON_SECRET` | sim | Protege `/api/cron/coletar` |
| `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` | recomendadas | API oficial do Reddit (OAuth app-only). Sem elas, o coletor usa RSS e não atualiza o engajamento |
| `CONTACT_EMAIL` | não | Contato exibido em Apoiar e Privacidade |

## Funcionalidades
| Recurso | Como funciona |
|---|---|
| Home agrupada por dia, com contagem por dia, total de casos e data de atualização | Renderizada no servidor a partir do banco |
| Busca e filtros por agente e por tema | Formulário GET com URLs compartilháveis (`/?q=&agente=&tema=`); funciona sem JavaScript |
| `/agentes`, `/agentes/[slug]`, `/temas`, `/temas/[slug]` | Contagens e “mais comuns” calculados no banco |
| `/casos/[slug]` | Página própria com metadados, Open Graph e JSON-LD |
| Cartão: selo do agente, tema, subreddit com link, ▲ votos · 💬 comentários, data, autor, título original, selo “Novo” | ✅ |
| “Ver prompt” / “Como reproduzir” | “Ver prompt” só aparece se o post trouxer um prompt; senão aparece “Como reproduzir”, marcado como derivado do post |
| Compartilhar | Compartilhamento nativo do celular ou cópia do link |
| Salvar + página `/salvos` | Guardado no `localStorage` do navegador; sem contas |
| Quero isso | Contador anônimo no banco, limitado por IP (1 por caso a cada 24 h e até 60 por hora) |
| RSS `/feed.xml`, `/sitemap.xml`, `/robots.txt` | Gerados a partir do banco, usando `NEXT_PUBLIC_SITE_URL` |
| `/sobre`, `/apoiar`, `/privacidade` | ✅ |
| Coletor diário | `/api/cron/coletar`, protegido por `CRON_SECRET` |
| `/admin` | Só para o admin: revisar candidatos do Reddit, escrever título e resumo em PT-BR, aprovar (publica) ou rejeitar, e rodar uma coleta manual |
| Segurança | Validação com zod, limite de requisições no Postgres, cabeçalhos de segurança, comparação de segredos em tempo constante; o link mágico só é enviado ao `ADMIN_EMAIL` |

**Futuro:** envio de casos por usuários (fora desta versão inicial).

## Fontes e coletor
Somente estas comunidades, porque a maioria dos posts delas são relatos de uso:

| Subreddit | Por quê |
|---|---|
| r/AI_Agents | Relatos “eu construí / eu uso” com agentes |
| r/ClaudeAI | Projetos concretos com Claude e Claude Code |
| r/ChatGPTPro | Usos avançados do ChatGPT no dia a dia |
| r/n8n | Automações com IA para negócios e uso pessoal, com detalhes |
| r/automation | Automações reais em empresas pequenas e na rotina |

r/OpenAI e r/LocalLLaMA foram avaliados e descartados: a maioria dos posts é notícia de modelos ou discussão técnica.

Como o coletor funciona:
1. Busca os posts mais votados do período (`?periodo=day|week|month`; o padrão é `week`) nos 5 subreddits.
2. Com `REDDIT_CLIENT_ID`/`SECRET`, usa a API oficial (OAuth app-only) e também atualiza votos e comentários dos casos publicados. Para criar a credencial, vá em https://www.reddit.com/prefs/apps e escolha o tipo “script”.
3. Sem credenciais, usa os feeds RSS públicos. Eles não trazem votos nem comentários, e o Reddit pode responder 429 (limite de requisições).
4. Filtra os posts que parecem relatos de uso e grava como **candidatos pendentes**. **Nada é publicado automaticamente.**

Agendamento: o `vercel.json` já traz um cron diário (09:00 UTC = 06:00 em Brasília), que a Vercel autentica com `CRON_SECRET`. Em qualquer outro host, use um crontab:
```
0 9 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://SEU-SITE/api/cron/coletar
```

## Deploy (quando decidir o host)
O código está pronto para produção; nada foi publicado ainda.

1. **Banco:** crie um Postgres. Opções gratuitas: Neon (plano Free), Supabase (plano Free) ou o próprio servidor. Copie a URL de conexão para `DATABASE_URL`.
2. **Aplicação.** Escolha uma das opções:
   - **Vercel (plano Hobby, gratuito):** importe o repositório, configure as variáveis e use o build padrão (`npm run build`). Rode `npm run setup` uma vez, localmente, apontando para o banco de produção.
   - **Qualquer servidor com Docker** (VPS da Hostinger, Railway, Render, Fly.io…): gere a imagem com `docker build --target runner -t agentes .` e rode `docker run -p 3000:3000 --env-file .env agentes`. Antes, rode as migrações e o seed uma vez com `docker build --target builder -t agentes-tools . && docker run --env-file .env agentes-tools npm run setup`. Coloque um proxy com HTTPS na frente (Caddy, Nginx ou o do painel).
   - **Node puro:** `npm ci && npm run build && npm run setup && npm start`.
3. **Variáveis:** `NEXT_PUBLIC_SITE_URL` e `AUTH_URL` com o domínio final (`https://…`), `AUTH_SECRET` e `CRON_SECRET` fortes, `ADMIN_EMAIL` e SMTP ou `ADMIN_PASSWORD_HASH`.
4. **Agendamento:** configure o cron (veja acima).

### Apontar um subdomínio da Hostinger
No hPanel: **Domínios → seu domínio → DNS / Nameservers → Gerenciar registros DNS**.
- **Host que fornece um nome** (Vercel, Render, Railway…): crie um registro **CNAME** com nome `agentes` (ou outro subdomínio) e o destino que o host indicar (na Vercel, `cname.vercel-dns.com`). Depois adicione o domínio no painel do host.
- **VPS ou servidor com IP fixo:** crie um registro **A** com nome `agentes` apontando para o IPv4 do servidor (e **AAAA**, se houver IPv6). Configure HTTPS no proxy (o Caddy emite o certificado sozinho).
- A propagação leva de minutos a algumas horas. Em seguida, atualize `NEXT_PUBLIC_SITE_URL` e `AUTH_URL` para `https://agentes.seudominio.com.br`.

## Estrutura
```
prisma/schema.prisma      modelos (Case, Agent, Topic, Candidate, RateLimit, CollectorRun + tabelas do Auth.js para o admin)
prisma/seed.ts            carrega data/casos.json (42 casos reais)
src/app/                  páginas, rotas (feed.xml, sitemap, robots, api/cron/coletar, api/salvos) e /admin
src/lib/                  banco, auth do admin, coletor do Reddit, limite de requisições, consultas
Dockerfile, docker-compose.yml, vercel.json (opcional)
```
