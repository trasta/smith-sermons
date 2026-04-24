"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/sermons",   label: "All Sermons" },
  { href: "/scripture", label: "Scripture"   },
  { href: "/series",    label: "Series"      },
  { href: "/search",    label: "Search"      },
  { href: "/about",     label: "About"       },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-brand-900 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-serif font-bold text-lg tracking-tight hover:text-brand-200 transition-colors">
          Pastor Doyle Smith
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? "text-white underline underline-offset-4"
                  : "text-brand-300 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-brand-800"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-800 px-4 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-brand-200 hover:text-white text-sm py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
