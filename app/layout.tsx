import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Pastor Doyle Smith — Sermons",
    template: "%s | Pastor Doyle Smith Sermons",
  },
  description:
    "A collection of sermons by Pastor Doyle Smith, searchable by scripture, theme, and topic.",
  openGraph: {
    title: "Pastor Doyle Smith — Sermons",
    description:
      "A collection of sermons by Pastor Doyle Smith, searchable by scripture, theme, and topic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Analytics />
        <footer className="bg-stone-800 text-stone-300 py-10 mt-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="font-serif text-lg text-white mb-1">
              Pastor Doyle Smith
            </p>
            <p className="text-sm text-stone-400">
              A collection of sermons preserved for future generations.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
