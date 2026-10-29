import "./globals.css"; import type { Metadata } from "next"; import { Amiri_Quran } from "next/font/google";
import { Providers } from "@/components/Providers"; import { Header } from "@/components/Header";
const arabic = Amiri_Quran({ subsets: ["arabic"], weight: "400", variable: "--font-arabic", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Quran Study — read, listen, learn", template: "%s | Quran Study" },
  description: "Read the Quran in Arabic with English translation and transliteration, listen to recitation, and learn.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={arabic.variable}><body className="font-sans antialiased"><Providers>
    <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a><Header />
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs text-muted"><a href="/sources">Sources &amp; licenses</a></footer></Providers></body></html>);
}
