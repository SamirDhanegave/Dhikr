// Downloads Quran data from a trusted static-JSON dataset, VALIDATES it, and writes data/. Never invents text.
import fs from "node:fs"; import path from "node:path";
const BASE = process.env.QURAN_DATA_BASE || "https://quran-json.risanb.com";
const SCRIPT = process.env.QURAN_SCRIPT || "uthmani", TRANS = process.env.QURAN_TRANSLATION || "en-saheeh", TLIT = process.env.QURAN_TRANSLIT || "en";
const out = path.resolve("data");
const hasCompleteData = () => {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(out, "meta.json"), "utf8"));
    if (!Array.isArray(meta.surahs) || meta.surahs.length !== 114) return false;
    if (!meta.sources?.arabic?.name?.includes(`"${SCRIPT}"`) ||
        !meta.sources?.translation?.name?.includes(`(${TRANS})`) ||
        !meta.sources?.transliteration?.name) return false;
    for (let id = 1; id <= 114; id++) {
      const verses = JSON.parse(fs.readFileSync(path.join(out, "quran", `${id}.json`), "utf8"));
      if (!Array.isArray(verses) || verses.length !== meta.surahs[id - 1].ayahs) return false;
      if (verses.some((v, i) => v.n !== i + 1 || !v.ar?.trim() || !v.en?.trim() || typeof v.enNotes !== "string" || !v.tr?.trim())) return false;
    }
    return true;
  } catch {
    return false;
  }
};
if (process.argv.includes("--if-missing") && hasCompleteData()) process.exit(0);
const get = async (p) => { const r = await fetch(`${BASE}${p}`); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
const pick = (o, ...k) => k.map((x) => o[x]).find((v) => v !== undefined);
const list = (j) => (Array.isArray(j) ? j : j.chapters ?? j.data ?? j.editions);
const chapters = list(await get("/chapters.json"));
const [tIdx, lIdx] = await Promise.all([get("/translations/index.json"), get("/transliteration/index.json").catch(() => null)]);
const findIn = (idx, key) => { const l = list(idx) ?? Object.values(idx); return l.find((x) => [x.key, x.id, x.code, x.slug, x.edition, x.path?.replace(/\/+$/, "").split("/").pop()].includes(key)) ?? {}; };
const tInfo = findIn(tIdx, TRANS), lInfo = lIdx ? findIn(lIdx, TLIT) : {};
const licenseText = (info) => info.license && typeof info.license === "object" ? info.license.text ?? "see dataset index" : String(info.license ?? info.licence ?? "see dataset index");
fs.mkdirSync(path.join(out, "quran"), { recursive: true });
const counts = [], surahs = [], corpus = {};
for (const c of chapters) {
  const id = pick(c, "id", "number"); const n = pick(c, "verses_count", "total_verses", "verse_count", "ayahs", "numberOfVerses");
  if (!Number.isInteger(n)) throw new Error(`cannot read verse count for chapter ${id}; adjust accessor`);
  counts.push(n);
  surahs.push({ id, name: pick(c, "name", "name_arabic") ?? "", translit: pick(c, "transliteration", "name_simple", "name_latin") ?? "", meaning: pick(c, "translation", "meaning", "name_translation") ?? "", type: pick(c, "type", "revelation_type") ?? "", ayahs: n });
  const [ar, en, tr] = await Promise.all([get(`/text/${SCRIPT}/chapters/${id}.json`), get(`/translations/${TRANS}/chapters/${id}.json`), get(`/transliteration/${TLIT}/chapters/${id}.json`)]);
  corpus[id] = { ar: ar.verses.map((v) => v.text), en: en.verses.map((v) => v.text ?? v.translation), enNotes: en.verses.map((v) => v.footnotes ?? ""), tr: tr.verses.map((v) => v.text ?? v.transliteration) };
}
const { validateCorpus } = await import("../lib/validate.ts");
const errs = validateCorpus(counts, corpus);
if (errs.length) { console.error("VALIDATION FAILED:\n" + errs.join("\n")); process.exit(1); }
for (const [id, c] of Object.entries(corpus)) fs.writeFileSync(path.join(out, "quran", `${id}.json`), JSON.stringify(c.ar.map((a, i) => ({ n: i + 1, ar: a, en: c.en[i], enNotes: c.enNotes[i], tr: c.tr[i] }))));
fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify({ surahs, generatedAt: new Date().toISOString(), sources: {
  arabic: { name: `Tanzil/dataset script "${SCRIPT}"`, license: "CC BY 3.0 (verbatim only) — verify in dataset /meta/sources.json", url: `${BASE}/meta/sources.json` },
  translation: { name: `${tInfo.author ?? tInfo.translator ?? TRANS} (${TRANS})`, license: licenseText(tInfo), url: tInfo.source ?? tInfo.license?.url ?? `${BASE}/translations/index.json`, note: `version ${tInfo.version ?? "?"}` },
  transliteration: { name: lInfo.name ?? `Dataset transliteration "${TLIT}"`, license: licenseText(lInfo), url: lInfo.source ?? lInfo.license?.url ?? `${BASE}/transliteration/index.json`, note: lInfo.review ?? "Machine-generated; not yet reviewed by a qualified reader." },
  audio: {
    name: "Alafasy chapter recitation with verse/word timestamps (QDC; linked, not hosted)",
    license: "CONFIRM permission and reuse terms with Quran.com/Quranicaudio providers before launch",
    url: "https://api.qurancdn.com/api/qdc/audio/reciters/7/audio_files?chapter_number={surah}&segments=true",
    note: "The reader streams the paired audio URL and uses its verse_timings for word highlighting."
  } } }, null, 1));
console.log(`OK: ${counts.length} surahs, ${counts.reduce((a, b) => a + b, 0)} ayahs validated.`);
