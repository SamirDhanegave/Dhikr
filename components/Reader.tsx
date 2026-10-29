"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SurahMeta, Verse } from "@/lib/types";
import type { SynchronizedAudio, VerseTiming } from "@/lib/audio";
import { getVerseTimingAt, getWordPositionAt, isSynchronizedAudio } from "@/lib/audio";
import { bookmarkKey, clamp, toggle, useLocal, useReadingProgress } from "@/lib/storage";
import { formatDuration } from "@/lib/validate";
import { useSettings } from "./Providers";

export function Reader({ surah, verses, surahCounts }: { surah: SurahMeta; verses: Verse[]; surahCounts: number[] }) {
  const { s, set } = useSettings();
  const router = useRouter();
  const [marks, setMarks] = useLocal<string[]>("q.bookmarks", []);
  const [, recordRead] = useReadingProgress(surahCounts);
  const [autoNext, setAutoNext] = useLocal<boolean>("q.autoNext", true);
  const [audio, setAudio] = useState<SynchronizedAudio | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [cur, setCur] = useState(0);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState({ t: 0, d: 0 });
  const [rep, setRep] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [mode, setMode] = useState<"surah" | "verse">("surah");
  const key = useRef("");
  const done = useRef(0);
  const verseBoundaryHandled = useRef(false);
  const visibleAyah = useRef(0);
  const lastTrackedAyah = useRef(0);
  const hasReadIntent = useRef(false);
  const preserveExplicitPosition = useRef(false);
  const au = useRef<HTMLAudioElement | null>(null);

  const trackAyah = useCallback((ayah: number) => {
    if (!Number.isInteger(ayah) || ayah < 1 || ayah > surah.ayahs || lastTrackedAyah.current === ayah) return;
    lastTrackedAyah.current = ayah;
    recordRead(surah.id, ayah);
  }, [recordRead, surah.ayahs, surah.id]);

  useEffect(() => {
    if (au.current) au.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const controller = new AbortController();
    setAudio(null);
    setAudioReady(false);
    setLoading(true);
    setErr("");
    fetch(`/api/audio/${surah.id}`, { signal: controller.signal })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok || !isSynchronizedAudio(result)) {
          const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not load synchronized recitation audio and word timings.";
          throw new Error(message);
        }
        return result;
      })
      .then(setAudio)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErr(error instanceof Error ? error.message : "Could not load synchronized recitation audio and word timings.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [surah.id]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (!hasReadIntent.current || preserveExplicitPosition.current) return;
      const entry = entries.filter((candidate) => candidate.isIntersecting)
        .sort((first, second) => {
          const firstRect = first.target.getBoundingClientRect();
          const secondRect = second.target.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const firstDistance = Math.abs(firstRect.top + firstRect.height / 2 - viewportCenter);
          const secondDistance = Math.abs(secondRect.top + secondRect.height / 2 - viewportCenter);
          return firstDistance - secondDistance;
        })[0];
      if (entry) trackAyah(Number((entry.target as HTMLElement).dataset.n));
    }, { rootMargin: "0px 0px -70% 0px" });
    document.querySelectorAll("[data-n]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [surah.id, trackAyah]);

  useEffect(() => {
    const markReadingIntent = () => {
      hasReadIntent.current = true;
      preserveExplicitPosition.current = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) markReadingIntent();
    };
    window.addEventListener("wheel", markReadingIntent, { passive: true });
    window.addEventListener("touchmove", markReadingIntent, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    const match = /^#ayah-(\d+)$/.exec(window.location.hash);
    if (match) {
      const ayah = Number(match[1]);
      if (ayah >= 1 && ayah <= surah.ayahs) {
        hasReadIntent.current = true;
        preserveExplicitPosition.current = true;
        trackAyah(ayah);
        document.getElementById(`ayah-${ayah}`)?.scrollIntoView({ block: "center" });
      }
    }
    return () => {
      window.removeEventListener("wheel", markReadingIntent);
      window.removeEventListener("touchmove", markReadingIntent);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [surah.ayahs, trackAyah]);

  const timingFor = useCallback((ayah: number): VerseTiming | undefined =>
    audio?.verseTimings[ayah - 1], [audio]);

  const playAt = useCallback((time: number) => {
    const player = au.current;
    if (!player || !audioReady) return;
    player.currentTime = time / 1000;
    player.play().catch(() => setErr("Playback blocked or failed."));
  }, [audioReady]);

  const loadVerseTrack = useCallback((ayah: number, playbackMode: "surah" | "verse", resetRepeat = true) => {
    const timing = timingFor(ayah);
    if (!timing) {
      setErr("Word timings are unavailable for this verse.");
      return;
    }
    setErr("");
    setMode(playbackMode);
    setCur(ayah);
    setActiveWord(null);
    verseBoundaryHandled.current = false;
    if (resetRepeat) done.current = 0;
    key.current = playbackMode === "surah" ? "surah" : `verse-${ayah}`;
    visibleAyah.current = ayah;
    hasReadIntent.current = true;
    preserveExplicitPosition.current = true;
    trackAyah(ayah);
    document.getElementById(`ayah-${ayah}`)?.scrollIntoView({ block: "center" });
    playAt(timing.timestampFrom);
  }, [playAt, timingFor, trackAyah]);

  const load = useCallback((ayah: number) => loadVerseTrack(ayah, "verse"), [loadVerseTrack]);
  const loadSurah = useCallback(() => {
    setMode("surah");
    done.current = 0;
    key.current = "surah";
    loadVerseTrack(1, "surah");
  }, [loadVerseTrack]);

  useEffect(() => {
    if (!audioReady || new URLSearchParams(window.location.search).get("autoplay") !== "1") return;
    loadSurah();
    router.replace(`/surah/${surah.id}`, { scroll: false });
  }, [audioReady, loadSurah, router, surah.id]);

  const next = useCallback(() => {
    if (cur < verses.length) load(cur + 1);
  }, [cur, load, verses.length]);

  const finishVerse = useCallback(() => {
    if (verseBoundaryHandled.current) return;
    verseBoundaryHandled.current = true;
    const player = au.current;
    const timing = timingFor(cur);
    if (!player || !timing) return;

    done.current++;
    if (rep === 0 || done.current < rep) {
      verseBoundaryHandled.current = false;
      playAt(timing.timestampFrom);
    } else if (autoNext && cur < verses.length) {
      next();
    } else {
      setActiveWord(null);
      player.pause();
    }
  }, [autoNext, cur, next, playAt, rep, timingFor, verses.length]);

  const finishSurah = useCallback(() => {
    done.current++;
    if (rep === 0 || done.current < rep) {
      playAt(0);
    } else if (autoNext && surah.id < 114) {
      router.push(`/surah/${surah.id + 1}?autoplay=1`);
    } else {
      setPlaying(false);
      setActiveWord(null);
    }
  }, [autoNext, playAt, rep, router, surah.id]);

  const onTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const player = event.currentTarget;
    const time = player.currentTime * 1000;
    setPos({ t: player.currentTime, d: player.duration });

    const activeTiming = mode === "surah"
      ? getVerseTimingAt(audio?.verseTimings ?? [], time)
      : timingFor(cur);
    if (mode === "verse" && playing) trackAyah(cur);
    if (mode === "surah" && activeTiming) {
      const ayah = Number(activeTiming.verseKey.split(":")[1]);
      setCur((previous) => previous === ayah ? previous : ayah);
      trackAyah(ayah);
      if (visibleAyah.current !== ayah) {
        visibleAyah.current = ayah;
        document.getElementById(`ayah-${ayah}`)?.scrollIntoView({ block: "center" });
      }
    }
    setActiveWord(getWordPositionAt(activeTiming, time));

    if (mode === "verse") {
      const selectedTiming = timingFor(cur);
      if (selectedTiming && time >= selectedTiming.timestampTo) finishVerse();
    }
  };

  const skip = (seconds: number) => {
    const player = au.current;
    if (!player) return;
    if (mode === "surah") player.currentTime = clamp(player.currentTime + seconds, 0, player.duration || 0);
    else {
      const timing = timingFor(cur);
      if (timing) player.currentTime = clamp(player.currentTime + seconds, timing.timestampFrom / 1000, timing.timestampTo / 1000);
    }
  };

  const toggleP = () => {
    const player = au.current;
    if (!player) return;
    if (!key.current) return loadSurah();
    if (playing) player.pause();
    else player.play().catch(() => setErr("Playback blocked or failed."));
  };

  const selectedTiming = timingFor(cur);
  const seekMin = mode === "verse" && selectedTiming ? selectedTiming.timestampFrom / 1000 : 0;
  const seekMax = mode === "verse" && selectedTiming
    ? Math.min(selectedTiming.timestampTo / 1000, pos.d || Infinity)
    : pos.d;
  const seekValue = clamp(pos.t, seekMin, Math.max(seekMin, seekMax));
  const displayTime = mode === "verse" ? Math.max(0, pos.t - seekMin) : pos.t;
  const displayDuration = mode === "verse" && selectedTiming
    ? Math.max(0, seekMax - seekMin)
    : pos.d;

  return (
    <div>
      <div className="mb-4">
        <Link className="btn inline-flex" href="/">← Back to Home</Link>
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">{surah.id}. {surah.translit}</h1>
        <p className="ar text-4xl" lang="ar">{surah.name}</p>
        <p className="text-muted">{surah.meaning} · {surah.type} · {surah.ayahs} verses</p>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm" role="group" aria-label="Reading settings">
        <span>Arabic <button className="btn" aria-label="Decrease Arabic size" onClick={() => set({ ar: clamp(s.ar - 2, 20, 64) })}>A−</button> <button className="btn" aria-label="Increase Arabic size" onClick={() => set({ ar: clamp(s.ar + 2, 20, 64) })}>A+</button></span>
        <span>English <button className="btn" aria-label="Decrease English size" onClick={() => set({ en: clamp(s.en - 1, 12, 30) })}>A−</button> <button className="btn" aria-label="Increase English size" onClick={() => set({ en: clamp(s.en + 1, 12, 30) })}>A+</button></span>
        <label><input type="checkbox" checked={s.showTr} onChange={(event) => set({ showTr: event.target.checked })} /> Transliteration</label>
      </div>
      <ol className="divide-y divide-line">
        {verses.map((verse) => {
          const words = verse.ar.trim().split(/\s+/);
          return <li key={verse.n} id={`ayah-${verse.n}`} data-n={verse.n} aria-current={cur === verse.n ? "true" : undefined}
            className={`scroll-mt-24 py-6 ${cur === verse.n ? "border-l-4 border-brand bg-surface pl-3" : ""}`}>
            <div className="mb-2 flex items-center justify-between text-sm text-muted">
              <a href={`#ayah-${verse.n}`} aria-label={`Verse ${surah.id}:${verse.n} link`}
                onClick={() => {
                  hasReadIntent.current = true;
                  preserveExplicitPosition.current = true;
                  trackAyah(verse.n);
                  document.getElementById(`ayah-${verse.n}`)?.scrollIntoView({ block: "center" });
                }}>{surah.id}:{verse.n}</a>
              <span className="flex gap-2">
                <button className="btn" onClick={() => load(verse.n)} aria-label={`Play verse ${verse.n}`} disabled={!audioReady}>Play</button>
                <button className="btn" aria-pressed={marks.includes(bookmarkKey(surah.id, verse.n))}
                  onClick={() => setMarks((items) => toggle(items, bookmarkKey(surah.id, verse.n)))}>
                  {marks.includes(bookmarkKey(surah.id, verse.n)) ? "Bookmarked" : "Bookmark"}
                </button>
              </span>
            </div>
            <p className="ar" lang="ar" dir="rtl" style={{ fontSize: s.ar }}>
              {words.map((word, index) => (
                <span key={`${verse.n}-${index}`}>
                  <span className={cur === verse.n && activeWord === index + 1 ? "rounded bg-brand px-1 text-white" : ""}>{word}</span>
                  {index < words.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
            {s.showTr && <p className="mt-2 italic text-muted" style={{ fontSize: s.en - 2 }}>{verse.tr}</p>}
            <p className="mt-2" lang="en" style={{ fontSize: s.en }}>{verse.en}</p>
            {verse.enNotes && <details className="mt-2 text-sm text-muted"><summary className="cursor-pointer">Translation notes</summary><p className="mt-1 whitespace-pre-wrap">{verse.enNotes}</p></details>}
          </li>;
        })}
      </ol>
      <nav className="mt-6 flex justify-between" aria-label="Surah navigation">
        {surah.id > 1 ? <Link className="btn" href={`/surah/${surah.id - 1}`}>← Previous Surah</Link> : <span />}
        {surah.id < 114 && <Link className="btn" href={`/surah/${surah.id + 1}`}>Next Surah →</Link>}
      </nav>
      <div className="sticky bottom-0 mt-6 border-t border-line bg-bg py-3" role="region" aria-label="Audio player">
        <audio ref={au} src={audio?.audioUrl} preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => mode === "surah" ? finishSurah() : finishVerse()}
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = playbackRate;
            setAudioReady(true);
            setLoading(false);
            setPos({ t: event.currentTarget.currentTime, d: event.currentTarget.duration });
          }}
          onCanPlay={() => setLoading(false)}
          onError={() => { setLoading(false); setAudioReady(false); setPlaying(false); setErr("Synchronized recitation audio could not be loaded."); }}
          onTimeUpdate={onTimeUpdate} />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {mode === "surah"
            ? <button className="btn" aria-label="Back 10 seconds" onClick={() => skip(-10)} disabled={!audioReady}>−10s</button>
            : <button className="btn" disabled={!audioReady || cur <= 1} onClick={() => load(cur - 1)}>Prev</button>}
          <button className="btn bg-brand" onClick={toggleP} aria-label={playing ? "Pause" : "Play"} disabled={!audioReady}>
            {loading ? "Loading…" : playing ? "Pause" : "Play"}
          </button>
          {mode === "surah"
            ? <button className="btn" aria-label="Forward 10 seconds" onClick={() => skip(10)} disabled={!audioReady}>+10s</button>
            : <button className="btn" disabled={!audioReady || cur >= verses.length} onClick={() => next()}>Next</button>}
          <button className="btn" aria-pressed={mode === "surah"} onClick={loadSurah} disabled={!audioReady}>Full Surah</button>
          <input type="range" aria-label="Seek" min={seekMin} max={seekMax || 0} step={0.1} value={seekValue}
            onChange={(event) => { if (au.current) au.current.currentTime = +event.target.value; }}
            className="min-w-[8rem] flex-1" disabled={!audioReady} />
          <span>{mode === "surah" && cur > 0 ? `${surah.id}:${cur} · ` : ""}{formatDuration(displayTime)} / {formatDuration(displayDuration)}</span>
          <label>Speed <select className="btn" aria-label="Playback speed" value={playbackRate}
            onChange={(event) => setPlaybackRate(Number(event.target.value))}>
            <option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option><option value={2}>2×</option>
          </select></label>
          <label>Repeat <select className="btn" value={rep} onChange={(event) => setRep(+event.target.value)}><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option></select></label>
          <label><input type="checkbox" checked={autoNext} onChange={(event) => setAutoNext(event.target.checked)} /> Auto next</label>
        </div>
        {loading && !audioReady && !err && <p className="mt-2 text-sm text-muted">Preparing word-synchronized recitation…</p>}
        {err && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">{err}</p>}
      </div>
    </div>
  );
}
