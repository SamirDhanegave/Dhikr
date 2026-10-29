"use client";
import Link from "next/link"; import { useRouter } from "next/navigation"; import { useEffect, useMemo, useState } from "react";
import type { AyahOfDay } from "@/lib/data"; import type { SurahMeta } from "@/lib/types"; import { bookmarkKey, toggle, useLocal, useReadingProgress } from "@/lib/storage";
import { TOTAL_AYAHS } from "@/lib/validate";
const FEATURED = [1, 2, 18, 36, 55, 67, 112, 113, 114]; // navigation shortcuts only (numbers)
export function Home({ surahs, ayahOfDay }: { surahs: SurahMeta[]; ayahOfDay: AyahOfDay | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [marks, setMarks] = useLocal<string[]>("q.bookmarks", []);
  const surahCounts = useMemo(() => surahs.map((surah) => surah.ayahs), [surahs]);
  const [progress, , resetProgress, progressReady] = useReadingProgress(surahCounts);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const refreshAtMidnight = () => {
      const now = new Date();
      const nextMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      timer = setTimeout(() => {
        if (cancelled) return;
        router.refresh();
        refreshAtMidnight();
      }, nextMidnight - now.getTime() + 1000);
    };
    refreshAtMidnight();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [router]);
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const res = useMemo(() => { const n = norm(q); if (!n) return []; return surahs.filter((s) => String(s.id) === q.trim() || norm(s.translit).includes(n) || norm(s.meaning).includes(n) || s.name.includes(q.trim())).slice(0, 8); }, [q, surahs]);
  const item = (s: SurahMeta) => (<Link key={s.id} href={`/surah/${s.id}`} className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 hover:border-brand"><span><span className="mr-3 text-muted">{s.id}</span>{s.translit} <span className="text-muted">· {s.meaning}</span></span><span className="ar text-xl" lang="ar">{s.name}</span></Link>);
  const lastRead = progress.lastRead;
  const lastSurah = lastRead ? surahs[lastRead.s - 1] : undefined;
  const overallPercent = Math.round(progress.readAyahs.length / TOTAL_AYAHS * 100);
  const surahPercent = lastRead && lastSurah ? Math.round(lastRead.a / lastSurah.ayahs * 100) : 0;
  const reset = () => {
    if (window.confirm("Reset your Quran reading progress? Your bookmarks will not be changed.")) resetProgress();
  };
  const progressBar = (label: string, value: number) => (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
  return (<div className="space-y-8">
    <h1 className="text-3xl font-semibold">Read, listen, and learn</h1>
    <section aria-labelledby="continue-reading-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <h2 id="continue-reading-title" className="text-xl font-semibold">Continue Your Reading</h2>
      {!progressReady ? <p className="mt-4 text-sm text-muted" role="status">Loading your reading position…</p>
        : lastRead && lastSurah ? <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Surah {lastSurah.translit} <span className="text-muted">({lastSurah.meaning})</span></p>
              <p className="mt-1 text-sm text-muted">Last read: Surah {lastSurah.translit}, Ayah {lastRead.a} of {lastSurah.ayahs}</p>
            </div>
            <span className="ar text-2xl" lang="ar" dir="rtl">{lastSurah.name}</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted"><span>Surah progress</span><span>{surahPercent}%</span></div>
            {progressBar(`Surah ${lastSurah.translit} progress`, surahPercent)}
          </div>
          <Link className="btn mt-5 inline-flex border-brand" href={`/surah/${lastRead.s}#ayah-${lastRead.a}`}>Continue Reading · Ayah {lastRead.a}</Link>
        </> : <div className="mt-4">
          <p className="text-sm text-muted">Your reading position will appear here as you read or navigate through verses.</p>
          <Link className="btn mt-4 inline-flex border-brand" href="#surah-directory">Start Reading</Link>
        </div>}
    </section>
    <section aria-labelledby="reading-progress-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="reading-progress-title" className="text-xl font-semibold">Your Reading Progress</h2>
          <p className="mt-1 text-sm text-muted">Saved on this device. Progress counts unique ayahs, once each.</p>
        </div>
        {progressReady && (progress.lastRead || progress.readAyahs.length > 0 || progress.completedSurahs.length > 0) &&
          <button className="btn text-sm" onClick={reset}>Reset Progress</button>}
      </div>
      {!progressReady ? <p className="mt-4 text-sm text-muted" role="status">Loading your progress…</p> : <>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div><p className="text-2xl font-semibold">{progress.completedSurahs.length}</p><p className="text-sm text-muted">Surahs completed</p></div>
          <div><p className="text-2xl font-semibold">{progress.readAyahs.length.toLocaleString()} <span className="text-base font-normal text-muted">/ {TOTAL_AYAHS.toLocaleString()}</span></p><p className="text-sm text-muted">Unique ayahs read</p></div>
          <div><p className="text-2xl font-semibold">{overallPercent}%</p><p className="text-sm text-muted">Overall Quran progress</p></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted"><span>Unique ayahs read</span><span>{overallPercent}%</span></div>
          {progressBar("Overall Quran reading progress", overallPercent)}
        </div>
      </>}
    </section>
    <section aria-labelledby="ayah-of-day-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand">AYAH OF THE DAY</p>
      <h2 id="ayah-of-day-title" className="mt-2 text-2xl font-semibold">A moment with the Quran</h2>
      {ayahOfDay ? <>
        <p className="mt-2 text-sm text-muted">Daily verse</p>
        <p className="ar mt-6 text-right text-3xl leading-[2.2] sm:text-4xl" lang="ar" dir="rtl">{ayahOfDay.verse.ar}</p>
        <p className="mt-5 font-serif text-lg leading-8">{ayahOfDay.verse.en}</p>
        {ayahOfDay.verse.enNotes && <details className="mt-3 text-sm text-muted"><summary className="cursor-pointer">Translation notes</summary><p className="mt-1 whitespace-pre-wrap">{ayahOfDay.verse.enNotes}</p></details>}
        <p className="mt-4 text-sm text-muted">{ayahOfDay.surah.translit} ({ayahOfDay.surah.id}:{ayahOfDay.verse.n}) · {ayahOfDay.surah.name}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="btn border-brand" href={`/surah/${ayahOfDay.surah.id}#ayah-${ayahOfDay.verse.n}`}>Read context</Link>
          <button className="btn" aria-label={marks.includes(bookmarkKey(ayahOfDay.surah.id, ayahOfDay.verse.n)) ? "Remove Ayah of the Day from bookmarks" : "Save Ayah of the Day"}
            aria-pressed={marks.includes(bookmarkKey(ayahOfDay.surah.id, ayahOfDay.verse.n))}
            onClick={() => setMarks((items) => toggle(items, bookmarkKey(ayahOfDay.surah.id, ayahOfDay.verse.n)))}>
            {marks.includes(bookmarkKey(ayahOfDay.surah.id, ayahOfDay.verse.n)) ? "Saved" : "Bookmark"}
          </button>
        </div>
        <div className="mt-6 space-y-1 border-t border-line pt-4 text-xs leading-5 text-muted">
          <p>Arabic text: <a className="underline underline-offset-2" href={ayahOfDay.arabicSource.url} target="_blank" rel="noreferrer">Tanzil, Uthmani script</a> ({ayahOfDay.arabicSource.license.split(" — ")[0]}; verbatim).</p>
          <p>English translation: <a className="underline underline-offset-2" href={ayahOfDay.translationSource.url} target="_blank" rel="noreferrer">{ayahOfDay.translationSource.name}, {ayahOfDay.translationSource.note}</a>, provided by QuranEnc.com and reproduced without modification under its stated reuse terms.</p>
        </div>
      </> : <p className="mt-4 text-sm text-muted" role="status">Today’s verse is unavailable because its text or source licensing could not be verified.</p>}
    </section>
    <div><label htmlFor="sq" className="mb-1 block text-sm text-muted">Search a Surah by name or number</label>
      <input id="sq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Yasin, 18, Light" className="w-full rounded-lg border border-line bg-surface px-4 py-3" aria-controls="sr" />
      <div id="sr" aria-live="polite" className="mt-2 space-y-2">{res.map(item)}{q && !res.length && <p className="text-muted">No Surah found.</p>}</div></div>
    <section><h2 className="mb-3 text-xl font-semibold">Featured</h2><div className="space-y-2">{surahs.filter((s) => FEATURED.includes(s.id)).map(item)}</div></section>
    <section id="surah-directory" aria-labelledby="surah-directory-title" className="scroll-mt-6">
      <h2 id="surah-directory-title" className="mb-3 text-xl font-semibold">All 114 Surahs</h2>
      <div className="grid gap-2 sm:grid-cols-2">{surahs.map(item)}</div>
    </section></div>);
}
