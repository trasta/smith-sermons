"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search by scripture, theme, topic, or keyword...'
        className="flex-1 px-4 py-3 rounded-lg text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button type="submit" className="btn-primary px-6 py-3 rounded-lg whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
