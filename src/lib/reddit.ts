import { SUBREDDITS } from "./env";

export type RedditPost = {
  redditId: string; title: string; url: string; subreddit: string; author: string | null;
  postedAt: Date; text: string; score: number; comments: number;
};

const UA = () => process.env.REDDIT_USER_AGENT || "web:agentes-na-pratica:1.0 (coletor com curadoria manual)";
// Sinais de que o post é um relato de uso (não notícia/opinião).
const SIGNALS = ["i built", "i use", "i used", "i automated", "automat", "my workflow", "workflow", "use case", "saved me",
  "agent that", "how i", "built a", "built an", "replaced", "every day", "daily"];
export const looksLikeUseCase = (p: Pick<RedditPost, "title" | "text">) => {
  const t = (p.title + " " + p.text).toLowerCase();
  return SIGNALS.some((s) => t.includes(s));
};

async function oauthToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID, secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  const r = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"), "User-Agent": UA(), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`OAuth Reddit ${r.status}`);
  return ((await r.json()) as { access_token: string }).access_token;
}

type Listing = { data: { children: { data: { id: string; title: string; permalink: string; subreddit: string; author: string; created_utc: number; selftext: string; score: number; num_comments: number } }[] } };
const fromListing = (l: Listing): RedditPost[] => l.data.children.map(({ data: d }) => ({
  redditId: d.id, title: d.title, url: "https://www.reddit.com" + d.permalink, subreddit: "r/" + d.subreddit,
  author: d.author && d.author !== "[deleted]" ? "u/" + d.author : null, postedAt: new Date(d.created_utc * 1000),
  text: (d.selftext || "").slice(0, 4000), score: d.score, comments: d.num_comments,
}));

const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#32;/g, " ").replace(/&amp;/g, "&");
async function viaRss(sub: string, period: string): Promise<RedditPost[]> {
  const r = await fetch(`https://www.reddit.com/r/${sub}/top/.rss?t=${period}&limit=100`, { headers: { "User-Agent": UA() }, cache: "no-store" });
  if (!r.ok) throw new Error(`RSS r/${sub} ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const g = (re: RegExp) => e.match(re)?.[1] ?? "";
    const url = g(/<link href="([^"]+)"/);
    const author = g(/<author><name>([^<]+)<\/name>/).replace(/^\//, "");
    return {
      redditId: url.match(/comments\/([a-z0-9]+)/)?.[1] ?? "", title: decode(g(/<title>([\s\S]*?)<\/title>/)), url, subreddit: "r/" + sub,
      author: author || null, postedAt: new Date(g(/<published>([^<]+)<\/published>/) || g(/<updated>([^<]+)<\/updated>/)),
      text: decode(decode(g(/<content type="html">([\s\S]*?)<\/content>/))).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000),
      score: 0, comments: 0,
    };
  }).filter((p) => p.redditId);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Busca os posts mais votados do período nos 5 subreddits. OAuth oficial se configurado; senão RSS público. */
export async function fetchTopPosts(period: "day" | "week" | "month" = "week") {
  const errors: string[] = [];
  let token: string | null = null;
  try { token = await oauthToken(); } catch (e) { errors.push(String(e)); }
  const posts: RedditPost[] = [];
  for (const sub of SUBREDDITS) {
    try {
      if (token) {
        const r = await fetch(`https://oauth.reddit.com/r/${sub}/top?t=${period}&limit=100&raw_json=1`, { headers: { Authorization: `Bearer ${token}`, "User-Agent": UA() }, cache: "no-store" });
        if (!r.ok) throw new Error(`API r/${sub} ${r.status}`);
        posts.push(...fromListing((await r.json()) as Listing));
      } else {
        posts.push(...(await viaRss(sub, period)));
        await sleep(3000); // RSS tem limite de requisições baixo
      }
    } catch (e) { errors.push(String(e)); }
  }
  return { method: token ? "oauth" : "rss", posts, errors, token };
}

/** Atualiza score e comentários via API oficial (/api/info). Só funciona com OAuth. */
export async function fetchEngagement(token: string, ids: string[]) {
  const out = new Map<string, { score: number; comments: number }>();
  for (let i = 0; i < ids.length; i += 100) {
    const r = await fetch(`https://oauth.reddit.com/api/info?id=${ids.slice(i, i + 100).map((x) => "t3_" + x).join(",")}`, { headers: { Authorization: `Bearer ${token}`, "User-Agent": UA() }, cache: "no-store" });
    if (!r.ok) throw new Error(`API info ${r.status}`);
    for (const p of fromListing((await r.json()) as Listing)) out.set(p.redditId, { score: p.score, comments: p.comments });
  }
  return out;
}
