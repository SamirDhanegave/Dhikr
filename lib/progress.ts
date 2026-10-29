import { TOTAL_AYAHS } from "./validate";

export interface ReadingPosition {
  s: number;
  a: number;
}

export interface ReadingProgress {
  version: 1;
  lastRead: ReadingPosition | null;
  readAyahs: string[];
  completedSurahs: number[];
}

export const EMPTY_READING_PROGRESS: ReadingProgress = {
  version: 1,
  lastRead: null,
  readAyahs: [],
  completedSurahs: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validPosition(value: unknown, surahCounts: number[]): ReadingPosition | null {
  if (!isRecord(value) || !Number.isInteger(value.s) || !Number.isInteger(value.a)) return null;
  const s = value.s as number;
  const a = value.a as number;
  return s >= 1 && s <= surahCounts.length && a >= 1 && a <= surahCounts[s - 1] ? { s, a } : null;
}

function validCounts(surahCounts: number[]): boolean {
  return surahCounts.length === 114 &&
    surahCounts.every((count) => Number.isInteger(count) && count > 0) &&
    surahCounts.reduce((sum, count) => sum + count, 0) === TOTAL_AYAHS;
}

export function sanitizeReadingProgress(value: unknown, surahCounts: number[]): ReadingProgress {
  if (!validCounts(surahCounts) || !isRecord(value)) return { ...EMPTY_READING_PROGRESS };

  const legacyPosition = value.version === undefined ? validPosition(value, surahCounts) : null;
  const lastRead = value.version === 1
    ? validPosition(value.lastRead, surahCounts)
    : legacyPosition;
  const readAyahs = new Set<string>();

  if (value.version === 1 && Array.isArray(value.readAyahs)) {
    for (const key of value.readAyahs) {
      if (typeof key !== "string") continue;
      const match = /^([1-9]\d*):([1-9]\d*)$/.exec(key);
      if (!match) continue;
      const position = validPosition({ s: Number(match[1]), a: Number(match[2]) }, surahCounts);
      if (position) readAyahs.add(`${position.s}:${position.a}`);
    }
  }

  const completedSurahs = new Set<number>();
  if (value.version === 1 && Array.isArray(value.completedSurahs)) {
    for (const id of value.completedSurahs) {
      if (Number.isInteger(id) && typeof id === "number" && id >= 1 && id <= surahCounts.length &&
        readAyahs.has(`${id}:${surahCounts[id - 1]}`)) completedSurahs.add(id);
    }
  }

  for (const id of Array.from({ length: surahCounts.length }, (_, index) => index + 1)) {
    if (readAyahs.has(`${id}:${surahCounts[id - 1]}`)) completedSurahs.add(id);
  }

  return {
    version: 1,
    lastRead,
    readAyahs: [...readAyahs],
    completedSurahs: [...completedSurahs].sort((a, b) => a - b),
  };
}

export function recordReadAyah(
  progress: ReadingProgress,
  s: number,
  a: number,
  surahCounts: number[],
): ReadingProgress {
  const position = validPosition({ s, a }, surahCounts);
  if (!position) return progress;

  const readAyahs = new Set(progress.readAyahs);
  readAyahs.add(`${position.s}:${position.a}`);
  const completedSurahs = new Set(progress.completedSurahs);
  if (position.a === surahCounts[position.s - 1]) completedSurahs.add(position.s);

  return {
    version: 1,
    lastRead: position,
    readAyahs: [...readAyahs],
    completedSurahs: [...completedSurahs].sort((first, second) => first - second),
  };
}
