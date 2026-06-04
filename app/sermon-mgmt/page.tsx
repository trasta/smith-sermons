import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Sermon List" };

export default async function AdminPage() {
  const sb = createServiceClient();

  const { data: sermons } = await sb
    .from("sermons")
    .select("id, sermon_id, title, date, service_type, series_name, series_chapter, original_filename")
    .order("sermon_id", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-800">Admin — Sermons</h1>
          <p className="text-stone-500 mt-1">{sermons?.length ?? 0} sermons in database</p>
        </div>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">← Back to site</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-stone-600 font-semibold w-20">ID</th>
              <th className="text-left px-4 py-3 text-stone-600 font-semibold">Title</th>
              <th className="text-left px-4 py-3 text-stone-600 font-semibold w-28">Date</th>
              <th className="text-left px-4 py-3 text-stone-600 font-semibold w-40">Service Type</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(sermons ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-stone-400">{s.sermon_id}</td>
                <td className="px-4 py-3 text-stone-800">
                  {s.series_name
                    ? `${s.series_name} Ch.${s.series_chapter}`
                    : s.title || (
                        <span className="text-stone-400 italic">
                          {s.original_filename?.replace(/\.mp3$/i, "")}
                        </span>
                      )}
                </td>
                <td className="px-4 py-3 text-stone-500">{s.date ?? "—"}</td>
                <td className="px-4 py-3 text-stone-500">{s.service_type ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/sermon-mgmt/sermons/${s.sermon_id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
