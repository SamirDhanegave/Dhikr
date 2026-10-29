import { NextResponse } from "next/server";
import { getMeta } from "@/lib/data";
import { parseWordSegments, type SynchronizedAudio, type VerseTiming } from "@/lib/audio";

interface UpstreamAudioFile {
  chapter_id?: unknown;
  audio_url?: unknown;
  verse_timings?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseVerseTimings(value: unknown, surah: number, ayahCount: number): VerseTiming[] | null {
  if (!Array.isArray(value) || value.length !== ayahCount) return null;
  const timings: VerseTiming[] = [];
  for (let index = 0; index < value.length; index++) {
    const verse = value[index];
    if (!isRecord(verse) || verse.verse_key !== `${surah}:${index + 1}` ||
      !finiteNumber(verse.timestamp_from) || !finiteNumber(verse.timestamp_to) ||
      verse.timestamp_from < 0 || verse.timestamp_to <= verse.timestamp_from) return null;
    const segments = parseWordSegments(verse.segments);
    if (!segments) return null;
    timings.push({
      verseKey: verse.verse_key,
      timestampFrom: verse.timestamp_from,
      timestampTo: verse.timestamp_to,
      segments,
    });
  }
  return timings;
}

export async function GET(_request: Request, { params }: { params: { surah: string } }) {
  const surah = Number(params.surah);
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "Invalid Surah number." }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `https://api.qurancdn.com/api/qdc/audio/reciters/7/audio_files?chapter_number=${surah}&segments=true`,
      { next: { revalidate: 86400 } },
    );
    if (!upstream.ok) throw new Error(`Quran audio service returned ${upstream.status}.`);
    const payload: unknown = await upstream.json();
    if (!isRecord(payload) || !Array.isArray(payload.audio_files)) {
      throw new Error("Quran audio service returned an invalid response.");
    }

    const file = payload.audio_files.find((candidate): candidate is UpstreamAudioFile & { chapter_id: number; audio_url: string } =>
      isRecord(candidate) && candidate.chapter_id === surah && typeof candidate.audio_url === "string");
    const ayahCount = getMeta().surahs[surah - 1].ayahs;
    const verseTimings = file ? parseVerseTimings(file.verse_timings, surah, ayahCount) : null;
    if (!file || !verseTimings) throw new Error("Word timings are missing or incomplete.");

    const audioUrl = new URL(file.audio_url);
    if (audioUrl.protocol !== "https:" || audioUrl.hostname !== "download.quranicaudio.com") {
      throw new Error("Quran audio service returned an unexpected audio host.");
    }

    const response: SynchronizedAudio = { audioUrl: audioUrl.toString(), verseTimings };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Could not load word-synchronized Quran audio.", error);
    return NextResponse.json({ error: "Could not load synchronized recitation audio and word timings." }, { status: 502 });
  }
}
