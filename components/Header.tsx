
"use client";

import Link from "next/link";
import { useSettings } from "./Providers";

export function Header() {
  const { s, set } = useSettings();

  const shareWebsite = async () => {
    const url = window.location.origin;
    const text = "Explore The Quran Study — read the Quran with English translation and audio.";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "The Quran Study",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        alert("Website link copied!");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        alert("Website link copied!");
      } catch {
        alert("Unable to share. Please try again.");
      }
    }
  };

  return (
    <header className="border-b border-line">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3"
      >
        <Link href="/" className="font-semibold text-brand">
          Quran Study
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/learn">Learn</Link>
          <Link href="/bookmarks">Bookmarks</Link>

          <button className="btn" onClick={shareWebsite}>
            Share
          </button>

          <button
            className="btn"
            aria-pressed={s.dark}
            onClick={() => set({ dark: !s.dark })}
          >
            {s.dark ? "Light" : "Dark"}
          </button>
        </div>
      </nav>
    </header>
  );
}
