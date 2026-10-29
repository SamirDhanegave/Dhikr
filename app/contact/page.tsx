
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Quran Study about website issues, content corrections, and feedback.",
};

export default function ContactPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-medium text-[var(--brand)]">
          WE'RE LISTENING
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Contact Us
        </h1>
        <p className="leading-7 text-[var(--muted)]">
          Found an issue or have an idea that could make The Quran Study
          better? We'd appreciate hearing from you.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How can we help?</h2>

        <div className="space-y-4">
          <div className="border-b border-[var(--line)] pb-4">
            <h3 className="font-medium">Content corrections</h3>
            <p className="mt-1 leading-7 text-[var(--muted)]">
              Report a possible issue with Quranic text, a translation,
              transliteration, or recitation. Include the Surah and verse
              number when possible.
            </p>
          </div>

          <div className="border-b border-[var(--line)] pb-4">
            <h3 className="font-medium">Technical issues</h3>
            <p className="mt-1 leading-7 text-[var(--muted)]">
              Let us know if reading, audio playback, bookmarks, or reading
              progress isn't working as expected.
            </p>
          </div>

          <div className="border-b border-[var(--line)] pb-4">
            <h3 className="font-medium">Feedback and suggestions</h3>
            <p className="mt-1 leading-7 text-[var(--muted)]">
              Suggestions for making the website more accessible, useful,
              and comfortable to use are welcome.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">Get in touch</h2>
        <p className="leading-7 text-[var(--muted)]">
          Our direct contact details will be published here once available.
          Please check back for updates.
        </p>
      </section>

      <p className="text-sm leading-6 text-[var(--muted)]">
        For information about the content used on this website, visit{" "}
        <a
          href="/sources"
          className="font-medium text-[var(--brand)] underline underline-offset-4"
        >
          Sources &amp; Licenses
        </a>
        .
      </p>
    </article>
  );
}
