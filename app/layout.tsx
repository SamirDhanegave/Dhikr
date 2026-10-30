import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Amiri_Quran } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

const arabic = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thequranstudy.vercel.app"
  ),
  title: {
    default: "Quran Study — read, listen, learn",
    template: "%s | Quran Study",
  },
  description:
    "Read the Quran in Arabic with English translation and transliteration, listen to recitation, and learn.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={arabic.variable}>
      <body className="font-sans antialiased">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to content
          </a>

          <Header />

          <main
            id="main"
            className="mx-auto max-w-3xl px-4 py-8"
          >
            {children}

            
          </main>

          <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs text-[var(--muted)]">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap gap-x-5 gap-y-3 border-t border-[var(--line)] pt-5"
            >
              <a href="/about" className="hover:text-[var(--brand)]">
                About
              </a>

              <a href="/privacy" className="hover:text-[var(--brand)]">
                Privacy Policy
              </a>

              <a href="/terms" className="hover:text-[var(--brand)]">
                Terms of Use
              </a>

              <a href="/contact" className="hover:text-[var(--brand)]">
                Contact
              </a>

              <a href="/sources" className="hover:text-[var(--brand)]">
                Sources &amp; Licenses
              </a>
            </nav>

            <p className="mt-4">
              © {new Date().getFullYear()} The Quran Study
            </p>
          </footer>
        </Providers>
      </body>
            <GoogleAnalytics gaId="G-FRCXCL5X9V" />
    </html>
  );
}
