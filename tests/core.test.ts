import { describe, it, expect } from "vitest";
import { getAyahOfDay, getMeta } from "../lib/data";
import { EMPTY_READING_PROGRESS, recordReadAyah, sanitizeReadingProgress } from "../lib/progress";
import { validateCorpus, formatAudioUrl, formatDuration, TOTAL_AYAHS } from "../lib/validate";
import { getVerseTimingAt, getWordPositionAt, isSynchronizedAudio, parseWordSegments, type VerseTiming } from "../lib/audio";
const mk = (c: number[]): Record<number, { ar: string[]; en: string[]; enNotes?: string[]; tr: string[] }> =>
  Object.fromEntries(c.map((n, i) => [i + 1, { ar: Array(n).fill("x"), en: Array(n).fill("x"), tr: Array(n).fill("x") }]));
describe("validateCorpus", () => {
  const counts = Array(114).fill(0).map((_, i) => (i === 0 ? TOTAL_AYAHS - 113 : 1));
  it("accepts a consistent corpus", () => expect(validateCorpus(counts, mk(counts))).toEqual([]));
  it("rejects wrong surah count", () => expect(validateCorpus(counts.slice(1), mk(counts.slice(1))).length).toBeGreaterThan(0));
  it("rejects wrong verse total", () => expect(validateCorpus([...counts.slice(0, 113), 2], mk([...counts.slice(0, 113), 2])).join()).toContain("6236"));
  it("rejects translation length mismatch", () => { const c = mk(counts); c[5].en.pop(); expect(validateCorpus(counts, c).join()).toContain("surah 5: en"); });
  it("rejects empty Arabic", () => { const c = mk(counts); c[2].ar[0] = " "; expect(validateCorpus(counts, c).join()).toContain("empty"); });
  it("rejects empty English translation", () => { const c = mk(counts); c[2].en[0] = " "; expect(validateCorpus(counts, c).join()).toContain("empty English translation"); });
  it("rejects translation notes length mismatch", () => { const c = mk(counts); c[2].enNotes = []; expect(validateCorpus(counts, c).join()).toContain("enNotes"); });
});
describe("Ayah of the Day", () => {
  it("selects a stable, valid verse for each UTC date", () => {
    const today = getAyahOfDay(new Date("2026-10-29T01:00:00Z"));
    const sameDay = getAyahOfDay(new Date("2026-10-29T23:00:00Z"));
    const tomorrow = getAyahOfDay(new Date("2026-10-30T00:00:00Z"));
    expect(today).not.toBeNull();
    expect(sameDay?.surah.id).toBe(today?.surah.id);
    expect(sameDay?.verse.n).toBe(today?.verse.n);
    expect(tomorrow?.date).toBe("2026-10-30");
    expect(`${tomorrow?.surah.id}:${tomorrow?.verse.n}`).not.toBe(`${today?.surah.id}:${today?.verse.n}`);
    expect(today?.verse.ar.trim()).not.toBe("");
    expect(today?.verse.en.trim()).not.toBe("");
  });
  it("shows no verse if translation reuse terms cannot be verified", () => {
    const verified = getAyahOfDay(new Date("2026-10-29T00:00:00Z"));
    const meta = getMeta();
    expect(verified).not.toBeNull();
    expect(getAyahOfDay(new Date("2026-10-29T00:00:00Z"), {
      ...meta,
      sources: {
        ...meta.sources,
        translation: { ...meta.sources.translation, license: "Unknown" },
      },
    })).toBeNull();
  });
});
describe("reading progress", () => {
  const surahCounts = getMeta().surahs.map((surah) => surah.ayahs);

  it("starts empty and does not complete a Surah merely by opening it", () => {
    expect(sanitizeReadingProgress(null, surahCounts)).toEqual(EMPTY_READING_PROGRESS);
    const opened = sanitizeReadingProgress({ version: 1, lastRead: null, readAyahs: [], completedSurahs: [] }, surahCounts);
    expect(opened.lastRead).toBeNull();
    expect(opened.completedSurahs).toEqual([]);
  });

  it("records the last position and counts each ayah only once", () => {
    const once = recordReadAyah(EMPTY_READING_PROGRESS, 2, 25, surahCounts);
    const twice = recordReadAyah(once, 2, 25, surahCounts);
    expect(twice.lastRead).toEqual({ s: 2, a: 25 });
    expect(twice.readAyahs).toEqual(["2:25"]);
    expect(twice.completedSurahs).toEqual([]);
  });

  it("marks a Surah complete only when its final ayah is reached", () => {
    const beforeEnd = recordReadAyah(EMPTY_READING_PROGRESS, 1, 6, surahCounts);
    expect(beforeEnd.completedSurahs).toEqual([]);
    const completed = recordReadAyah(beforeEnd, 1, 7, surahCounts);
    expect(completed.completedSurahs).toEqual([1]);
    expect(sanitizeReadingProgress(completed, surahCounts).completedSurahs).toEqual([1]);
  });

  it("migrates the previous last-position format without inventing read history", () => {
    const migrated = sanitizeReadingProgress({ s: 2, a: 25 }, surahCounts);
    expect(migrated.lastRead).toEqual({ s: 2, a: 25 });
    expect(migrated.readAyahs).toEqual([]);
    expect(migrated.completedSurahs).toEqual([]);
  });

  it("discards invalid positions, duplicate verses, and invalid completion claims", () => {
    const sanitized = sanitizeReadingProgress({
      version: 1,
      lastRead: { s: 999, a: 1 },
      readAyahs: ["2:25", "2:25", "2:999", "bad"],
      completedSurahs: [2, 1, 999],
    }, surahCounts);
    expect(sanitized.lastRead).toBeNull();
    expect(sanitized.readAyahs).toEqual(["2:25"]);
    expect(sanitized.completedSurahs).toEqual([]);
    expect(sanitizeReadingProgress("{", surahCounts)).toEqual(EMPTY_READING_PROGRESS);
  });
});
describe("formatAudioUrl", () => { it("pads", () => expect(formatAudioUrl("a/{surah:03d}{ayah:03d}.mp3", 2, 255)).toBe("a/002255.mp3")); });
describe("formatDuration", () => {
  it("formats durations under an hour as minutes and seconds", () => expect(formatDuration(75)).toBe("1:15"));
  it("formats durations over an hour as hours, minutes, and seconds", () => expect(formatDuration(3975)).toBe("1:06:15"));
  it("formats exact hours with zero-padded minutes and seconds", () => expect(formatDuration(7200)).toBe("2:00:00"));
  it("handles unknown and invalid durations", () => {
    expect(formatDuration(Infinity)).toBe("0:00");
    expect(formatDuration(-1)).toBe("0:00");
  });
});
describe("word timing", () => {
  const timings: VerseTiming[] = [{
    verseKey: "1:1",
    timestampFrom: 0,
    timestampTo: 2500,
    segments: [
      { wordPosition: 1, startTime: 100, endTime: 600 },
      { wordPosition: 2, startTime: 650, endTime: 1200 },
    ],
  }];
  it("finds the verse and word active at a timestamp", () => {
    expect(getVerseTimingAt(timings, 700)?.verseKey).toBe("1:1");
    expect(getWordPositionAt(timings[0], 700)).toBe(2);
  });
  it("returns no word during gaps or outside timed segments", () => {
    expect(getWordPositionAt(timings[0], 625)).toBeNull();
    expect(getWordPositionAt(undefined, 700)).toBeNull();
    expect(getVerseTimingAt(timings, 2500)).toBeUndefined();
  });
  it("validates synchronized audio payloads", () => {
    expect(isSynchronizedAudio({ audioUrl: "https://audio.example/1.mp3", verseTimings: timings })).toBe(true);
    expect(isSynchronizedAudio({ audioUrl: "", verseTimings: [{ ...timings[0], segments: [{ wordPosition: "1" }] }] })).toBe(false);
  });
  it("keeps valid word intervals when upstream includes incomplete segments", () => {
    expect(parseWordSegments([[1, 0, 500], [2], [3, 600], [4, 700, 650]])).toEqual([
      { wordPosition: 1, startTime: 0, endTime: 500 },
    ]);
  });
});
