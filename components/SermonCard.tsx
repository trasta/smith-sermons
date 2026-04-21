import Link from "next/link";
import type { SermonSummary } from "@/lib/types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Date unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SermonCard({ sermon }: { sermon: SermonSummary }) {
  const scriptures = sermon.scripture_references?.slice(0, 2) ?? [];
  const themes = sermon.sermon_tags?.filter((t) => t.tag_type === "theme").slice(0, 3) ?? [];
  const title = sermon.title ?? sermon.series_name
    ? `${sermon.series_name}${sermon.series_chapter ? ` — Ch. ${sermon.series_chapter}` : ""}`
    : "Untitled Sermon";

  return (
    <Link href={`/sermons/${sermon.sermon_id}`} className="sermon-card block">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-stone-400 font-mono">{sermon.sermon_id}</span>
        {sermon.duration_seconds && (
          <span className="text-xs text-stone-400">{formatDuration(sermon.duration_seconds)}</span>
        )}
      </div>

      <h3 className="font-serif font-semibold text-stone-800 text-base leading-snug mb-1 line-clamp-2">
        {sermon.title || title}
      </h3>

      <p className="text-xs text-stone-400 mb-3">
        {formatDate(sermon.date)} · {sermon.service_type}
      </p>

      {scriptures.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {scriptures.map((ref) => (
            <span key={ref.id} className="tag tag-scripture">
              {ref.reference_text}
            </span>
          ))}
        </div>
      )}

      {themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {themes.map((tag) => (
            <span key={tag.id} className="tag tag-theme">
              {tag.tag_value}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
