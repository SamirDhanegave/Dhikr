
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about The Quran Study and our goal of making Quran reading and study accessible.",
};

export default function AboutPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-medium text-[var(--brand)]">
          OUR PURPOSE
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          About The Quran Study
        </h1>
        <p className="text-base leading-7 text-[var(--muted)]">
          A simple, focused space to read, listen to, and learn from the Quran.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Why we built this</h2>
        <p className="leading-7 text-[var(--muted)]">
          The Quran Study aims to make engaging with the Quran more accessible
          through a clean, comfortable reading experience. We want you to spend
          less time navigating a website and more time focusing on the text.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What you can do</h2>
        <ul className="list-disc space-y-2 pl-5 leading-7 text-[var(--muted)]">
          <li>Read Quranic text in Arabic.</li>
          <li>Explore available English translations and transliteration.</li>
          <li>Listen to available Quran recitations.</li>
          <li>Bookmark passages and keep track of your reading progress.</li>
          <li>Explore learning resources and information about our sources.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Respect for the source</h2>
        <p className="leading-7 text-[var(--muted)]">
          The Quran is sacred text. Translations are interpretations of its
          meaning and are not a replacement for the original Arabic. We
          encourage readers to consult the listed sources and qualified
          scholars when seeking religious guidance.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Visit our{" "}
          <a
            href="/sources"
            className="font-medium text-[var(--brand)] underline underline-offset-4"
          >
            Sources &amp; Licenses
          </a>{" "}
          page for information about the content used on this website.
        </p>
      </section>

      <section className="border-t border-[var(--line)] pt-6">
        <p className="leading-7 text-[var(--muted)]">
          Thank you for visiting The Quran Study. May your time spent reading
          and reflecting be meaningful.
        </p>
      </section>
    </article>
  );
}
