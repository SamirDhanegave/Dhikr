export interface SurahMeta { id: number; name: string; translit: string; meaning: string; type: string; ayahs: number }
export interface Verse { n: number; ar: string; en: string; enNotes?: string; tr: string }
export interface Meta { surahs: SurahMeta[]; sources: { arabic: Src; translation: Src; transliteration: Src; audio: Src }; generatedAt: string }
export interface Src { name: string; license: string; url: string; note?: string }
