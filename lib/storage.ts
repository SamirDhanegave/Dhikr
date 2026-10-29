"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_READING_PROGRESS, recordReadAyah, sanitizeReadingProgress, type ReadingProgress } from "./progress";
export interface Settings { ar: number; en: number; dark: boolean; showTr: boolean }
export const DEFAULTS: Settings = { ar: 32, en: 17, dark: false, showTr: true };
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export function readJSON<T>(key: string, fallback: T): T { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } }
export function writeJSON(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full/blocked: degrade silently */ } }
export const bookmarkKey = (s: number, a: number) => `${s}:${a}`;
export function toggle(list: string[], k: string) { return list.includes(k) ? list.filter((x) => x !== k) : [...list, k]; }
export function useLocal<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [val, setVal] = useState<T>(init); const [ready, setReady] = useState(false);
  useEffect(() => { setVal(readJSON(key, init)); setReady(true); /* eslint-disable-next-line */ }, [key]);
  const set = useCallback((v: T | ((p: T) => T)) => setVal((p) => { const n = typeof v === "function" ? (v as (p: T) => T)(p) : v; writeJSON(key, n); return n; }), [key]);
  return [val, set, ready];
}

export function useReadingProgress(surahCounts: number[]): [
  ReadingProgress,
  (surah: number, ayah: number) => void,
  () => void,
  boolean,
] {
  const [stored, setStored, ready] = useLocal<unknown>("q.progress", EMPTY_READING_PROGRESS);
  const countsKey = surahCounts.join(",");
  const counts = useMemo(() => countsKey.split(",").map(Number), [countsKey]);
  const progress = useMemo(() => sanitizeReadingProgress(stored, counts), [stored, counts]);
  const recordRead = useCallback((surah: number, ayah: number) => {
    setStored((value: unknown) => recordReadAyah(sanitizeReadingProgress(value, counts), surah, ayah, counts));
  }, [counts, setStored]);
  const reset = useCallback(() => setStored({ ...EMPTY_READING_PROGRESS }), [setStored]);
  return [progress, recordRead, reset, ready];
}
