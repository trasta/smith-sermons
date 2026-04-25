import { supabase } from "@/lib/supabase";
import SermonCard from "@/components/SermonCard";
import Link from "next/link";
import type { SermonSummary } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "All Sermons" };

async function getSermons(series?: string): Promise<SermonSummary[]> {
  let query = supabase
    .from("sermons")
    .select(`
      id, sermon_id, title, date, service_type, speaker,
      series_name, series_chapter, audio_url, duration_seconds,
      scripture_references ( id, sermon_id, book, chapter, verse_start, verse_end, reference_text ),
      sermon_tags ( id, sermon_id, tag_type, tag_value )
    `)
    .eq("is_private", false)
    .eq("is_published", true);

  if (series) {
    query = query.eq("series_name", series);
  }

  const { data } = await query.order("date", { ascending: true, nullsFirst: false });

  return (data as SermonSummary[]) ?? [];
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ series?: string }>;
}) {
  const params = await searchParams;
  const series = params.series;
  const sermons = await getSermons(series);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        {series ? (
          <>
            <Link href="/series" className="text-sm text-stone-400 hover:text-stone-600 mb-2 inline-block">
              ← All Series
            </Link>
            <h1 className="font-serif text-3xl font-bold text-stone-800 mb-1">{series}</h1>
            <p className="text-stone-500">{sermons.length} sermon{sermons.length !== 1 ? "s" : ""}</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold text-stone-800 mb-1">All Sermons</h1>
            <p className="text-stone-500">{sermons.length} sermons available</p>
          </>
        )}
      </div>

      {sermons.length === 0 ? (
        <p className="text-stone-400 text-center py-20">No sermons found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sermons.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      )}
    </div>
  );
}
