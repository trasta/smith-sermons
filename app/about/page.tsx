import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Pastor Doyle Smith",
  description: "Learn about Pastor Doyle Smith — his life, ministry, and published work.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Pastor bio */}
      <div className="flex flex-col sm:flex-row gap-8 mb-12">
        <div className="flex-shrink-0">
          <img
            src="/pastor-doyle.jpg"
            alt="Pastor Doyle Smith"
            className="w-48 h-48 rounded-xl object-cover shadow-md"
          />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-800 mb-4">
            Pastor Doyle Smith
          </h1>
          <div className="prose prose-stone text-stone-600 leading-relaxed space-y-4">
            <p>
              Doyle loved God and the Bible, God&apos;s Holy Word, as much or more than anyone else I&apos;ve
              ever known. Receiving a ThD in Systematic Theology from Southwestern Baptist Theological
              Seminary in 1972, he continued to study diligently for the remainder of his ministry.
              He pastored for over 50 years three churches in Arkansas, one in Texas and one in Kansas,
              where he remained for over 43 years. He once said that the goal of his ministry was to
              &ldquo;preach through the Bible.&rdquo;
            </p>
            <p className="text-sm text-stone-500 italic mt-2">— Carol Smith, wife</p>
          </div>
        </div>
      </div>

      {/* Book section */}
      <div className="border-t border-stone-200 pt-10">
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6">Published Work</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start bg-stone-50 rounded-xl p-6 border border-stone-200">
          <div className="flex-1">
            <h3 className="font-serif text-xl font-semibold text-stone-800 mb-2">
              Dialogue with the Source
            </h3>
            <p className="text-stone-600 leading-relaxed mb-4">
              A thought-provoking exploration of faith, scripture, and the living conversation
              between humanity and God.
            </p>
            <a
              href="https://outskirtspress.com/DialoguewiththeSource"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              View on Outskirts Press →
            </a>
          </div>
        </div>
      </div>

      {/* Link to sermons */}
      <div className="mt-10 text-center">
        <p className="text-stone-500 mb-4">Explore Pastor Smith&apos;s sermons, searchable by scripture, theme, and story.</p>
        <Link
          href="/sermons"
          className="inline-block border border-stone-300 text-stone-700 px-5 py-2.5 rounded-lg font-medium hover:bg-stone-50 transition-colors"
        >
          Browse All Sermons →
        </Link>
      </div>

    </div>
  );
}
