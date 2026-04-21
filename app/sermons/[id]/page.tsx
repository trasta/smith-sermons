import { supabase } from "@/lib/supabase";
import AudioPlayer from "@/components/AudioPlayer";
import type { Sermon } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

async function getSermon(sermonId: string): Promise<Sermon | null> {
  const { data } = await supabase
    .from("sermons")
    .select(`
      *,
      scripture_references ( * ),
      sermon_tags ( * )
    `)
    .eq("sermon_id", sermonId)
    .eq("is_private", false)
    .single();

  return (data as Sermon) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const sermon = await getSermon(params.id);
  if (!sermon) return { title: "Sermon not found" };
  return {
    title: sermon.title ?? `Sermon ${sermon.sermon_id}`,
    description: sermon.transcript?.slice(0, 160),
  };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Date unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default async function SermonPage({
  params,
}: {
  params: { id: string };
}) {
  const sermon = await getSermon(params.id);
  if (!sermon) notFound();

  const scriptures = sermon.scripture_references ?? [];
  const themes = sermon.sermon_tags?.filter((t) => t.tag_type === "theme") ?? [];
  const characters = sermon.sermon_tags?.filter((t) => t.tag_type === "character") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono text-stone-400">{sermon.sermon_id}</span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1 mb-2 leading-tight">
          {sermon.title ?? (sermon.series_name
            ? `${sermon.series_name} — Chapter ${sermon.series_chapter}`
            : "Untitled Sermon")}
        </h1>
        <p className="text-stone-500">{formatDate(sermon.date)} · {sermon.service_type}</p>
        {sermon.speaker && (
          <p className="text-stone-500 text-sm mt-0.5">Pastor {sermon.speaker}</p>
        )}
      </div>

      {/* Audio Player */}
      <div className="mb-8">
        <AudioPlayer src={sermon.audio_url} title={sermon.title ?? "Sermon"} />
      </div>

      {/* Scripture References */}
      {scriptures.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-3">
            Scripture Passage{scriptures.length > 1 ? "s" : ""}
          </h2>
          <div className="flex flex-wrap gap-2">
            {scriptures.map((ref) => (
              <span key={ref.id} className="tag tag-scripture text-sm">
                {ref.reference_text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {(themes.length > 0 || characters.length > 0) && (
        <div className="mb-8 flex flex-wrap gap-4">
          {themes.length > 0 && (
            <div>
              <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-2">Themes</h2>
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => (
                  <span key={t.id} className="tag tag-theme">{t.tag_value}</span>
                ))}
              </div>
            </div>
          )}
          {characters.length > 0 && (
            <div>
              <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-2">Biblical Figures</h2>
              <div className="flex flex-wrap gap-2">
                {characters.map((t) => (
                  <span key={t.id} className="tag tag-character">{t.tag_value}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      {sermon.transcript && (
        <div className="border-t border-stone-200 pt-8">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">Transcript</h2>
          <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed text-sm whitespace-pre-wrap">
            {sermon.transcript}
          </div>
        </div>
      )}
    </div>
  );
}
