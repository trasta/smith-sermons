import { createServiceClient } from "@/lib/supabase";
import type { Sermon } from "@/lib/types";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRFC2822(dateStr: string | null): string {
  if (!dateStr) return new Date().toUTCString();
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("sermons")
    .select("*, scripture_references(*), sermon_tags(*)")
    .eq("is_private", false)
    .eq("is_published", true)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(200);

  const sermons: Sermon[] = (data as Sermon[]) ?? [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smithsermons.com";

  const items = sermons
    .map((sermon) => {
      const title = sermon.title ?? (sermon.series_name
        ? `${sermon.series_name} — Chapter ${sermon.series_chapter}`
        : `Sermon ${sermon.sermon_id}`);

      const scriptures = sermon.scripture_references?.map((r) => r.reference_text).join(", ") ?? "";
      const description = [
        scriptures ? `Scripture: ${scriptures}` : "",
        sermon.transcript ? sermon.transcript.slice(0, 500) + "..." : "",
      ].filter(Boolean).join("\n\n");

      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${siteUrl}/sermons/${sermon.sermon_id}</link>
      <guid isPermaLink="true">${siteUrl}/sermons/${sermon.sermon_id}</guid>
      <pubDate>${formatRFC2822(sermon.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      <enclosure url="${escapeXml(sermon.audio_url)}" type="audio/mpeg" length="${sermon.file_size_bytes ?? 0}" />
      ${sermon.duration_seconds ? `<itunes:duration>${sermon.duration_seconds}</itunes:duration>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Pastor Doyle Smith — Sermons</title>
    <link>${siteUrl}</link>
    <language>en-us</language>
    <description>A collection of sermons by Pastor Doyle Smith, searchable by scripture, theme, and topic.</description>
    <itunes:author>Pastor Doyle Smith</itunes:author>
    <itunes:image href="${siteUrl}/podcast-artwork.jpg" />
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity" />
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
