export const TOTAL_AYAHS = 6236; // Hafs count; cross-checked against dataset
export function validateCorpus(counts: number[], chapters: Record<number, { ar: string[]; en: string[]; enNotes?: string[]; tr: string[] }>): string[] {
  const errs: string[] = [];
  if (counts.length !== 114) errs.push(`expected 114 surahs, got ${counts.length}`);
  const sum = counts.reduce((a, b) => a + b, 0);
  if (sum !== TOTAL_AYAHS) errs.push(`expected ${TOTAL_AYAHS} ayahs, got ${sum}`);
  counts.forEach((c, i) => {
    const ch = chapters[i + 1];
    if (!ch) return errs.push(`surah ${i + 1} missing`);
    for (const k of ["ar", "en", "tr"] as const) if (ch[k].length !== c) errs.push(`surah ${i + 1}: ${k} has ${ch[k].length}, expected ${c}`);
    if (ch.enNotes && ch.enNotes.length !== c) errs.push(`surah ${i + 1}: enNotes has ${ch.enNotes.length}, expected ${c}`);
    if (ch.ar.some((t) => !t?.trim())) errs.push(`surah ${i + 1}: empty Arabic verse`);
    if (ch.en.some((t) => !t?.trim())) errs.push(`surah ${i + 1}: empty English translation`);
  });
  return errs;
}
export function formatAudioUrl(tpl: string, surah: number, ayah: number): string {
  return tpl.replace(/\{surah(?::0?(\d)d)?\}/g, (_, w) => String(surah).padStart(+w || 0, "0")).replace(/\{ayah(?::0?(\d)d)?\}/g, (_, w) => String(ayah).padStart(+w || 0, "0"));
}
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const secs = String(total % 60).padStart(2, "0");
  const mins = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  return hours > 0 ? `${hours}:${String(mins).padStart(2, "0")}:${secs}` : `${Math.floor(total / 60)}:${secs}`;
}
