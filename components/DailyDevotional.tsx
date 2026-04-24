import Link from "next/link";

const FEED_URL =
  "https://doylesmithdaily.blogspot.com/feeds/posts/default?alt=rss&max-results=500";

interface BlogPost {
  title: string;
  link: string;
  pubDate: Date;
  excerpt: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractItems(xml: string): BlogPost[] {
  const items: BlogPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = block.match(/<description>([\s\S]*?)<\/description>/);

    if (!titleMatch || !linkMatch || !dateMatch) continue;

    const title = stripHtml(titleMatch[1]).replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
    const link = linkMatch[1].trim();
    const pubDate = new Date(dateMatch[1].trim());
    const rawDesc = descMatch ? descMatch[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "") : "";
    const excerpt = stripHtml(rawDesc).slice(0, 320);

    if (!isNaN(pubDate.getTime())) {
      items.push({ title, link, pubDate, excerpt });
    }
  }

  return items;
}

function pickTodaysPost(posts: BlogPost[]): BlogPost | null {
  if (posts.length === 0) return null;

  const now = new Date();
  const todayMonth = now.getMonth(); // 0-indexed
  const todayDay = now.getDate();

  // Try to find a post whose month/day matches today
  const match = posts.find(
    (p) => p.pubDate.getMonth() === todayMonth && p.pubDate.getDate() === todayDay
  );
  if (match) return match;

  // Fallback: cycle through posts by day-of-year
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return posts[dayOfYear % posts.length];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export default async function DailyDevotional() {
  let post: BlogPost | null = null;

  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 }, // refresh at most once per hour
    });
    if (res.ok) {
      const xml = await res.text();
      const posts = extractItems(xml);
      post = pickTodaysPost(posts);
    }
  } catch {
    // Silently fail — widget just won't render
  }

  if (!post) return null;

  return (
    <section className="bg-amber-50 border-y border-amber-200 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">✝️</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Daily Devotional
            </p>
            <p className="text-xs text-amber-600">{formatDate(post.pubDate)}</p>
          </div>
        </div>

        <h2 className="font-serif text-xl font-bold text-stone-800 mb-3 leading-snug">
          {post.title}
        </h2>

        <p className="text-stone-600 leading-relaxed text-sm mb-4">
          {post.excerpt}
          {post.excerpt.length >= 320 ? "…" : ""}
        </p>

        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
        >
          Read full devotional →
        </a>
      </div>
    </section>
  );
}
