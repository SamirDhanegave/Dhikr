
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how The Quran Study handles information and privacy.",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-medium text-[var(--brand)]">
          YOUR PRIVACY
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Last updated: October 29, 2026
        </p>
        <p className="leading-7 text-[var(--muted)]">
          This policy explains how The Quran Study handles information when
          you visit and use our website.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Information we handle</h2>
        <p className="leading-7 text-[var(--muted)]">
          You can browse the website without creating an account. Features
          such as bookmarks and reading progress may store information in your
          browser's local storage so your preferences can remain available on
          that browser.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Local browser data may be removed when you clear your browser data,
          use a different browser or device, or use private browsing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Cookies and analytics</h2>
        <p className="leading-7 text-[var(--muted)]">
          Our hosting provider and any analytics tools enabled on the website
          may process technical information such as browser details, device
          information, requested pages, and usage data. Cookies or similar
          technologies may be used by those services depending on their
          configuration.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Check the documentation and privacy policies of any analytics or
          hosting services used by this website for details about their data
          practices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Third-party content and services</h2>
        <p className="leading-7 text-[var(--muted)]">
          Quran text, translations, recitations, or other resources may be
          provided through external sources or services. When your browser
          requests content from a third party, that service may receive
          technical information such as your IP address. Its own privacy
          policy applies to its handling of that information.
        </p>
        <p className="leading-7 text-[var(--muted)]">
          Please visit our{" "}
          <a
            href="/sources"
            className="font-medium text-[var(--brand)] underline underline-offset-4"
          >
            Sources &amp; Licenses
          </a>{" "}
          page for information about our content sources.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. How information is used</h2>
        <p className="leading-7 text-[var(--muted)]">
          Information processed through the website or its service providers
          may be used to operate the website, remember local preferences,
          understand performance, maintain security, and troubleshoot errors.
          The specific uses depend on which services are enabled.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Data retention and control</h2>
        <p className="leading-7 text-[var(--muted)]">
          You can remove locally stored bookmarks and progress by clearing
          the relevant website data in your browser, although this may also
          remove other saved preferences. Information handled by hosting or
          third-party providers is subject to their retention practices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Children's privacy</h2>
        <p className="leading-7 text-[var(--muted)]">
          The website is intended for general audiences. If you believe
          personal information has been submitted to us inappropriately,
          please contact us so the matter can be reviewed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Changes to this policy</h2>
        <p className="leading-7 text-[var(--muted)]">
          We may update this policy when the website or its services change.
          Updates will be published on this page with a revised date.
        </p>
      </section>

      <section className="space-y-3 border-t border-[var(--line)] pt-6">
        <h2 className="text-xl font-semibold">8. Contact</h2>
        <p className="leading-7 text-[var(--muted)]">
          If you have questions about this policy, please visit our{" "}
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
