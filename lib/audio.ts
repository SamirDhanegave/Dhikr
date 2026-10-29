export interface WordSegment {
  wordPosition: number;
  startTime: number;
  endTime: number;
}

export interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  segments: WordSegment[];
}

export interface SynchronizedAudio {
  audioUrl: string;
  verseTimings: VerseTiming[];
}

export function parseWordSegments(value: unknown): WordSegment[] | null {
  if (!Array.isArray(value)) return null;
  const segments: WordSegment[] = [];
  for (const rawSegment of value) {
    if (!Array.isArray(rawSegment) || rawSegment.length !== 3) continue;
    const [wordPosition, startTime, endTime] = rawSegment;
    if (typeof wordPosition !== "number" || !Number.isFinite(wordPosition) || wordPosition < 1 ||
      typeof startTime !== "number" || !Number.isFinite(startTime) || startTime < 0 ||
      typeof endTime !== "number" || !Number.isFinite(endTime) || endTime <= startTime) continue;
    segments.push({ wordPosition, startTime, endTime });
  }
  return segments;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSynchronizedAudio(value: unknown): value is SynchronizedAudio {
  if (!isRecord(value) || typeof value.audioUrl !== "string" || !Array.isArray(value.verseTimings)) return false;
  return value.verseTimings.every((timing) => {
    if (!isRecord(timing) || typeof timing.verseKey !== "string" ||
      typeof timing.timestampFrom !== "number" || !Number.isFinite(timing.timestampFrom) ||
      typeof timing.timestampTo !== "number" || !Number.isFinite(timing.timestampTo) ||
      !Array.isArray(timing.segments)) return false;
    return timing.segments.every((segment) =>
      isRecord(segment) &&
      typeof segment.wordPosition === "number" && Number.isFinite(segment.wordPosition) &&
      typeof segment.startTime === "number" && Number.isFinite(segment.startTime) &&
      typeof segment.endTime === "number" && Number.isFinite(segment.endTime));
  });
}

export function getVerseTimingAt(verseTimings: VerseTiming[], time: number): VerseTiming | undefined {
  return verseTimings.find((timing) => time >= timing.timestampFrom && time < timing.timestampTo);
}

export function getWordPositionAt(timing: VerseTiming | undefined, time: number): number | null {
  if (!timing) return null;
  const segment = timing.segments.find((word) => time >= word.startTime && time < word.endTime);
  return segment?.wordPosition ?? null;
}
