import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sermon Series" };

async function getSeries() {
  const { data } = await supabase
    .from("sermons")
    .select("series_name, series_chapter")
    .eq("is_private", false)
    .eq("is_published", true)
    .not("series_name", "is", null)
    .order("series_name");

  if (!data) return [];

  const map = new Map<string, number>();
  for (const row of data) {
    if (row.series_name) {
      map.set(row.series_name, (map.get(row.series_name) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export default async function SeriesPage() {
  const series = await getSeries();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Sermon Series</h1>
      <p className="text-stone-500 mb-10">Multi-part teaching series by Pastor Doyle Smith.</p>

      {series.length === 0 ? (
        <p className="text-stone-400 text-center py-20">No series available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {series.map(({ name, count }) => (
            <Link
              key={name}
              href={`/sermons?series=${encodeURIComponent(name)}`}
              className="sermon-card block group"
            >
              <h2 className="font-serif font-semibold text-stone-800 text-lg group-hover:text-brand-700 mb-1">
                {name}
              </h2>
              <p className="text-stone-500 text-sm">{count} sermon{count !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
