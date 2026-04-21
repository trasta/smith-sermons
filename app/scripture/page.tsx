import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BIBLE_BOOKS_OT, BIBLE_BOOKS_NT } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse by Scripture" };

async function getBooksWithSermons(): Promise<Set<string>> {
  const { data } = await supabase
    .from("scripture_references")
    .select("book, sermons!inner(is_private, is_published)")
    .eq("sermons.is_private", false)
    .eq("sermons.is_published", true);

  return new Set((data ?? []).map((r: { book: string }) => r.book));
}

function BookGrid({ books, activeBooks }: { books: string[]; activeBooks: Set<string> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {books.map((book) => {
        const hasSermons = activeBooks.has(book);
        return hasSermons ? (
          <Link
            key={book}
            href={`/scripture/${encodeURIComponent(book)}`}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            {book}
          </Link>
        ) : (
          <span
            key={book}
            className="px-3 py-2 rounded-lg text-sm text-stone-400 border border-stone-100 bg-stone-50"
          >
            {book}
          </span>
        );
      })}
    </div>
  );
}

export default async function ScripturePage() {
  const activeBooks = await getBooksWithSermons();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-2">Browse by Scripture</h1>
      <p className="text-stone-500 mb-10">
        Books highlighted in green have at least one sermon. Click to browse.
      </p>

      <div className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-stone-700 mb-4">Old Testament</h2>
        <BookGrid books={BIBLE_BOOKS_OT} activeBooks={activeBooks} />
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-stone-700 mb-4">New Testament</h2>
        <BookGrid books={BIBLE_BOOKS_NT} activeBooks={activeBooks} />
      </div>
    </div>
  );
}
