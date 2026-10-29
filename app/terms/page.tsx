
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the terms for using The Quran Study website.",
};

export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-medium text-[var(--brand)]">
          PLEASE READ
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Terms of Use
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Last updated: October 29, 2026
        </p>
        <p className="leading-7 text-[var(--muted)]">
          These terms apply to your use of The Quran Study website. By using
          the website, you agree to use it responsibly and in accordance with
          applicable law.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. About the website</h2>
        <p className="leading-7 text-[var(--muted)]">
          The Quran Study provides tools for reading Quranic text, exploring
          available translations and transliteration, listening to recitations,
          bookmarking passages, tracking reading progress, and accessing
          learning resources.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Religious content</h2>
        <p className="leading-7 text-[var(--muted)]">
          Translations are renderings of meaning and may differ between
          translators. They should not be treated as identical to the original
          Arabic text. The website is a reading and learning resource, not a
          substitute for qualified religious scholarship or personal religious
          guidance.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          If you notice a possible error in text, translation, or recitation,
          please let us know through the Contact page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Permitted use</h2>
        <p className="leading-7 text-[var(--muted)]">
          You may use the website for personal reading, study, and other lawful
          purposes. You must not attempt to disrupt the website, bypass its
          security, misuse its services, or use it in a way that violates
          applicable laws or the rights of others.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Content and attribution</h2>
        <p className="leading-7 text-[var(--muted)]">
          Quran text, translations, audio recordings, fonts, and other
          resources may be subject to different ownership rights, licenses,
          and attribution requirements. Your use or redistribution of those
          materials must respect the applicable terms.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Refer to our{" "}
          <a
            href="/sources"
            className="font-medium text-[var(--brand)] underline underline-offset-4"
          >
            Sources &amp; Licenses
          </a>{" "}
          page for relevant information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Availability and accuracy</h2>
        <p className="leading-7 text-[var(--muted)]">
          We aim to provide a useful and reliable experience, but we cannot
          guarantee uninterrupted availability, error-free operation, or that
          all content will always be complete or accurate. Features and
          external services may change or become unavailable.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Please verify important religious references against trusted sources.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Third-party services</h2>
        <p className="leading-7 text-[var(--muted)]">
          The website may rely on third-party hosting, content, or other
          services. We do not control the operation or policies of external
          services, and your use of them may be subject to their own terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Changes to the website or terms</h2>
        <p className="leading-7 text-[var(--muted)]">
          We may modify website features or update these terms as the project
          evolves. Updated terms will be published on this page with a revised
          date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">8. Contact</h2>
        <p className="leading-7 text-[var(--muted)]">
          For questions about these terms, please use our{" "}
          <a
            href="/contact"
            className="font-medium text-[var(--brand)] underline underline-offset-4"
          >
            Contact page
          </a>
          .
        </p>
      </section>
    </article>
  );
}
