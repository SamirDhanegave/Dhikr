import type { Metadata } from "next"; import { notFound } from "next/navigation";
import { getMeta, getSurah, validSurah } from "@/lib/data"; import { Reader } from "@/components/Reader";
export const generateStaticParams = () => Array.from({ length: 114 }, (_, i) => ({ n: String(i + 1) }));
export function generateMetadata({ params }: { params: { n: string } }): Metadata {
  const n = +params.n; if (!validSurah(n)) return {}; const s = getMeta().surahs[n - 1];
  return { title: `Surah ${s.translit} (${s.id}) — Arabic, translation & audio`, description: `Read Surah ${s.translit} (${s.meaning}), ${s.ayahs} verses, with English translation and recitation.`, alternates: { canonical: `/surah/${n}` } };
}
export default function Page({ params }: { params: { n: string } }) {
  const n = +params.n; if (!validSurah(n)) notFound();
  const surahs = getMeta().surahs;
  const s = surahs[n - 1];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Chapter", name: `Surah ${s.translit}`, position: n }) }} /><Reader surah={s} verses={getSurah(n)} surahCounts={surahs.map((surah) => surah.ayahs)} /></>;
}
