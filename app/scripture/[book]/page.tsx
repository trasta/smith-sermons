import { supabase } from "@/lib/supabase";
import SermonCard from "@/components/SermonCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SermonSummary } from "@/lib/types";
import type { Metadata } from "next";

async function getSermonsByBook(book: string): Promise<SermonSummary[]> {
  const { data } = await supabase
    .from("scripture_references")
    .select(`
      book,
      sermons!inner (
        id, sermon_id, title, date, service_type, speaker,
        series_name, series_chapter, audio_url, duration_seconds,
        is_private, is_published,
        scripture_references ( id, sermon_id, book, chapter, verse_start, verse_end, reference_text ),
        sermon_tags ( id, sermon_id, tag_type, tag_value )
      )
    `)
    .eq("book", book)
    .eq("sermons.is_private", false)
    .eq("sermons.is_published", true);

  if (!data || data.length === 0) return [];

  // Deduplicate sermons (a sermon may cite the same book multiple times)
  const seen = new Set<string>();
  const sermons: SermonSummary[] = [];
  for (const row of data) {
    const s = (row as any).sermons;
    if (s && !seen.has(s.id)) {
      seen.add(s.id);
      sermons.push(s as SermonSummary);
    }
  }

  // Sort by date descending, nulls last
  sermons.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return sermons;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string }>;
}): Promise<Metadata> {
  const { book } = await params;
  const decoded = decodeURIComponent(book);
  return { title: `${decoded} Sermons | Pastor Doyle Smith` };
}

export default async function ScriptureBookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book } = await params;
  const decoded = decodeURIComponent(book);
  const sermons = await getSermonsByBook(decoded);

  if (sermons.length === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/scripture"
          className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-block"
        >
          ← Browse by Scripture
        </Link>
        <h1 className="font-serif text-3xl font-bold text-stone-800">
          {decoded}
        </h1>
        <p className="text-stone-500 mt-1">
          {sermons.length} sermon{sermons.length !== 1 ? "s" : ""} referencing {decoded}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sermons.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
    </div>
  );
}
