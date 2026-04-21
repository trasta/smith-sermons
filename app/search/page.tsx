import { supabase } from "@/lib/supabase";
import SermonCard from "@/components/SermonCard";
import SearchBar from "@/components/SearchBar";
import type { SermonSummary } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Sermons" };

async function searchSermons(query: string): Promise<SermonSummary[]> {
  if (!query) return [];

  const { data } = await supabase
    .from("sermons")
    .select(`
      id, sermon_id, title, date, service_type, speaker,
      series_name, series_chapter, audio_url, duration_seconds,
      scripture_references ( id, sermon_id, book, chapter, verse_start, verse_end, reference_text ),
      sermon_tags ( id, sermon_id, tag_type, tag_value )
    `)
    .eq("is_private", false)
    .eq("is_published", true)
    .or(`title.ilike.%${query}%,transcript.ilike.%${query}%`)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(50);

  return (data as SermonSummary[]) ?? [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q ?? "";
  const results = await searchSermons(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Search Sermons</h1>
      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      {query && (
        <p className="text-stone-500 mb-6">
          {results.length === 0
            ? `No results found for "${query}"`
            : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      )}
    </div>
  );
}
