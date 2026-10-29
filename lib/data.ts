import fs from "node:fs"; import path from "node:path";
import type { Meta, SurahMeta, Verse } from "./types";
const dir = path.join(process.cwd(), "data");
export function getMeta(): Meta {
  const f = path.join(dir, "meta.json");
  if (!fs.existsSync(f)) throw new Error("Quran data missing. Run `npm run data` (needs network access to the dataset).");
  return JSON.parse(fs.readFileSync(f, "utf8"));
}
export function getSurah(n: number): Verse[] { return JSON.parse(fs.readFileSync(path.join(dir, "quran", `${n}.json`), "utf8")); }
export const validSurah = (n: number) => Number.isInteger(n) && n >= 1 && n <= 114;

export interface AyahOfDay {
  date: string;
  surah: SurahMeta;
  verse: Verse;
  arabicSource: Meta["sources"]["arabic"];
  translationSource: Meta["sources"]["translation"];
}

export function getAyahOfDay(date: Date, meta: Meta = getMeta()): AyahOfDay | null {
  const sources = meta?.sources;
  const arabic = sources?.arabic;
  const translation = sources?.translation;
  if (!meta || !Array.isArray(meta.surahs) || !arabic || !translation ||
    typeof arabic.name !== "string" || typeof arabic.license !== "string" || typeof arabic.url !== "string" ||
    typeof translation.name !== "string" || typeof translation.license !== "string" ||
    typeof translation.url !== "string" || typeof translation.note !== "string") return null;

  if (!arabic.name.includes("Tanzil") || !arabic.name.includes('"uthmani"') ||
    !arabic.license.includes("CC BY 3.0") || !arabic.url.startsWith("https://") ||
    !translation.name.includes("Noor International Center") || !translation.name.includes("(en-saheeh)") ||
    !translation.note.trim() || !translation.url.startsWith("https://quranenc.com/") ||
    !translation.license.includes("permits download and re-publication") ||
    !translation.license.includes("no modification/addition/deletion") ||
    !translation.license.includes("credit the publisher and QuranEnc.com")) return null;

  const totalVerses = meta.surahs.reduce((total, surah) => total + surah.ayahs, 0);
  if (meta.surahs.length !== 114 || meta.surahs.some((surah, index) =>
    surah.id !== index + 1 || !Number.isInteger(surah.ayahs) || surah.ayahs < 1) ||
    totalVerses !== 6236 || !Number.isFinite(date.getTime())) return null;

  // Use UTC dates so every visitor sees the same verse throughout the day.
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  let verseIndex = ((dayNumber % totalVerses) + totalVerses) % totalVerses;
  for (const surah of meta.surahs) {
    if (verseIndex < surah.ayahs) {
      const verse = getSurah(surah.id).find((candidate) => candidate.n === verseIndex + 1);
      if (typeof verse?.ar !== "string" || !verse.ar.trim() ||
        typeof verse.en !== "string" || !verse.en.trim()) return null;
      return {
        date: date.toISOString().slice(0, 10),
        surah,
        verse,
        arabicSource: arabic,
        translationSource: translation,
      };
    }
    verseIndex -= surah.ayahs;
  }
  return null;
}
