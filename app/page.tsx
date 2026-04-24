import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SermonCard from "@/components/SermonCard";
import SearchBar from "@/components/SearchBar";
import DailyDevotional from "@/components/DailyDevotional";
import type { SermonSummary } from "@/lib/types";

async function getRecentSermons(): Promise<SermonSummary[]> {
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
    .order("date", { ascending: false, nullsFirst: false })
    .limit(6);

  return (data as SermonSummary[]) ?? [];
}

export default async function HomePage() {
  const recentSermons = await getRecentSermons();

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Pastor Doyle Smith
          </h1>
          <p className="text-brand-200 text-lg mb-10">
            A lifetime of preaching — searchable by scripture, theme, and story.
          </p>
          <SearchBar />
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/scripture" className="text-brand-200 hover:text-white underline underline-offset-2">
              Browse by Scripture
            </Link>
            <span className="text-brand-500">·</span>
            <Link href="/series" className="text-brand-200 hover:text-white underline underline-offset-2">
              Browse by Series
            </Link>
            <span className="text-brand-500">·</span>
            <Link href="/sermons" className="text-brand-200 hover:text-white underline underline-offset-2">
              All Sermons
            </Link>
          </div>
        </div>
      </section>

      <DailyDevotional />

      {/* Recent Sermons */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl font-semibold text-stone-800">
            Recent Sermons
          </h2>
          <Link href="/sermons" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        {recentSermons.length === 0 ? (
          <p className="text-stone-500 text-center py-12">
            Sermons are being added — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </section>

      {/* Podcast / Subscribe strip */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 border border-stone-200 rounded-xl px-6 py-5">
          <div>
            <p className="font-semibold text-stone-800">Listen in your podcast app</p>
            <p className="text-stone-500 text-sm mt-0.5">
              Subscribe to receive new sermons automatically in Apple Podcasts, Spotify, and more.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://podcasts.apple.com/search?term=Pastor+Doyle+Smith"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Apple Podcasts
            </a>
            <a
              href="https://open.spotify.com/search/Pastor%20Doyle%20Smith"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1DB954] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1aa347] transition-colors"
            >
              Spotify
            </a>
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-stone-300 text-stone-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              RSS Feed
            </a>
          </div>
        </div>
      </section>

      {/* Browse by section */}
      <section className="bg-stone-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl font-semibold text-stone-800 mb-8 text-center">
            Find a Sermon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/scripture" className="bg-white rounded-xl p-6 border border-stone-200 hover:border-brand-300 hover:shadow-md transition-all text-center group">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-serif font-semibold text-lg text-stone-800 group-hover:text-brand-700">
                By Scripture
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Find sermons on any Bible passage
              </p>
            </Link>
            <Link href="/sermons?filter=series" className="bg-white rounded-xl p-6 border border-stone-200 hover:border-brand-300 hover:shadow-md transition-all text-center group">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-serif font-semibold text-lg text-stone-800 group-hover:text-brand-700">
                By Series
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Follow a multi-part teaching series
              </p>
            </Link>
            <Link href="/sermons?filter=theme" className="bg-white rounded-xl p-6 border border-stone-200 hover:border-brand-300 hover:shadow-md transition-all text-center group">
              <div className="text-3xl mb-3">🏷️</div>
              <h3 className="font-serif font-semibold text-lg text-stone-800 group-hover:text-brand-700">
                By Theme
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Explore topics like grace, faith, and prayer
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
