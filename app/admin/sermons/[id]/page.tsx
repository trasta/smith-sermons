"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const SERVICE_TYPES = [
  "Sunday Morning Worship",
  "Sunday Evening Service",
  "Wednesday Evening Service",
  "Special Service",
  "Funeral Service",
  "Unknown",
];

interface ScriptureRef {
  id?: string;
  book: string;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
  reference_text: string;
}

interface Tag {
  id?: string;
  tag_type: "theme" | "character" | "topic";
  tag_value: string;
}

interface SermonData {
  sermon_id: string;
  title: string;
  date: string;
  service_type: string;
  speaker: string;
  series_name: string | null;
  series_chapter: number | null;
  original_filename: string;
  scripture_references: ScriptureRef[];
  sermon_tags: Tag[];
}

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [refs, setRefs] = useState<ScriptureRef[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // New tag / ref inputs
  const [newRef, setNewRef] = useState({ book: "", chapter: "", verse_start: "", verse_end: "", reference_text: "" });
  const [newTag, setNewTag] = useState({ tag_type: "theme" as Tag["tag_type"], tag_value: "" });

  useEffect(() => {
    fetch(`/api/admin/sermons/${id}/data`)
      .then((r) => r.json())
      .then((data) => {
        setSermon(data);
        setTitle(data.title || "");
        setDate(data.date || "");
        setServiceType(data.service_type || "");
        setSpeaker(data.speaker || "");
        setRefs(data.scripture_references || []);
        setTags(data.sermon_tags || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sermon.");
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch(`/api/admin/sermons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date,
        service_type: serviceType,
        speaker,
        scripture_references: refs,
        tags,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const body = await res.json();
      setError(body.error || "Save failed.");
    }
    setSaving(false);
  }

  function addRef() {
    if (!newRef.book.trim()) return;
    const refText = newRef.reference_text.trim() ||
      `${newRef.book}${newRef.chapter ? ` ${newRef.chapter}` : ""}${newRef.verse_start ? `:${newRef.verse_start}` : ""}${newRef.verse_end && newRef.verse_end !== newRef.verse_start ? `-${newRef.verse_end}` : ""}`;
    setRefs([...refs, {
      book: newRef.book.trim(),
      chapter: newRef.chapter ? parseInt(newRef.chapter) : null,
      verse_start: newRef.verse_start ? parseInt(newRef.verse_start) : null,
      verse_end: newRef.verse_end ? parseInt(newRef.verse_end) : null,
      reference_text: refText,
    }]);
    setNewRef({ book: "", chapter: "", verse_start: "", verse_end: "", reference_text: "" });
  }

  function removeRef(index: number) {
    setRefs(refs.filter((_, i) => i !== index));
  }

  function addTag() {
    if (!newTag.tag_value.trim()) return;
    setTags([...tags, { tag_type: newTag.tag_type, tag_value: newTag.tag_value.trim() }]);
    setNewTag({ ...newTag, tag_value: "" });
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  if (loading) return <div className="p-10 text-stone-500">Loading…</div>;
  if (!sermon) return <div className="p-10 text-red-500">{error || "Sermon not found."}</div>;

  const themeTagList    = tags.filter((t) => t.tag_type === "theme");
  const characterTagList = tags.filter((t) => t.tag_type === "character");
  const topicTagList    = tags.filter((t) => t.tag_type === "topic");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-stone-400 hover:text-stone-600 text-sm">← All Sermons</Link>
        <span className="font-mono text-stone-400">{sermon.sermon_id}</span>
        <Link href={`/sermons/${sermon.sermon_id}`} target="_blank" className="text-blue-500 text-sm hover:underline">
          View public page ↗
        </Link>
      </div>

      <h1 className="font-serif text-2xl font-bold text-stone-800 mb-1">
        {sermon.series_name
          ? `${sermon.series_name} — Chapter ${sermon.series_chapter}`
          : sermon.title || sermon.original_filename}
      </h1>
      <p className="text-stone-400 text-sm mb-8">{sermon.original_filename}</p>

      {/* Core fields */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">Sermon Details</h2>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sermon title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Speaker</label>
          <input
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Scripture References */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">Scripture References</h2>

        <div className="space-y-2 mb-4">
          {refs.length === 0 && <p className="text-stone-400 text-sm italic">No scripture references.</p>}
          {refs.map((ref, i) => (
            <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <span className="text-emerald-800 text-sm font-medium">{ref.reference_text}</span>
              <button onClick={() => removeRef(i)} className="text-red-400 hover:text-red-600 ml-3 text-lg leading-none">×</button>
            </div>
          ))}
        </div>

        {/* Add reference */}
        <div className="border-t border-stone-100 pt-4">
          <p className="text-xs text-stone-500 mb-2">Add reference</p>
          <div className="grid grid-cols-5 gap-2 mb-2">
            <input value={newRef.book} onChange={(e) => setNewRef({ ...newRef, book: e.target.value })}
              placeholder="Book" className="col-span-2 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={newRef.chapter} onChange={(e) => setNewRef({ ...newRef, chapter: e.target.value })}
              placeholder="Ch." type="number" className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={newRef.verse_start} onChange={(e) => setNewRef({ ...newRef, verse_start: e.target.value })}
              placeholder="Vs." type="number" className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={newRef.verse_end} onChange={(e) => setNewRef({ ...newRef, verse_end: e.target.value })}
              placeholder="End" type="number" className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <input value={newRef.reference_text} onChange={(e) => setNewRef({ ...newRef, reference_text: e.target.value })}
              placeholder="Display text (e.g. John 3:16-17) — auto-generated if left blank"
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={addRef} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Add</button>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">Tags</h2>

        {(["theme", "character", "topic"] as const).map((type) => {
          const list = tags.filter((t) => t.tag_type === type);
          return (
            <div key={type} className="mb-4">
              <p className="text-xs text-stone-500 uppercase mb-2">{type}s</p>
              <div className="flex flex-wrap gap-2">
                {list.length === 0 && <span className="text-stone-400 text-sm italic">None</span>}
                {list.map((t, i) => {
                  const globalIndex = tags.indexOf(t);
                  return (
                    <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                      ${type === "theme" ? "bg-blue-100 text-blue-800" : ""}
                      ${type === "character" ? "bg-amber-100 text-amber-800" : ""}
                      ${type === "topic" ? "bg-purple-100 text-purple-800" : ""}
                    `}>
                      {t.tag_value}
                      <button onClick={() => removeTag(globalIndex)} className="ml-1 opacity-60 hover:opacity-100">×</button>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add tag */}
        <div className="border-t border-stone-100 pt-4 flex gap-2">
          <select
            value={newTag.tag_type}
            onChange={(e) => setNewTag({ ...newTag, tag_type: e.target.value as Tag["tag_type"] })}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="theme">Theme</option>
            <option value="character">Character</option>
            <option value="topic">Topic</option>
          </select>
          <input
            value={newTag.tag_value}
            onChange={(e) => setNewTag({ ...newTag, tag_value: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Tag value"
            className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addTag} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Add</button>
        </div>
      </section>

      {/* Save */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-emerald-600 font-medium">✓ Saved</span>}
      </div>
    </div>
  );
}
