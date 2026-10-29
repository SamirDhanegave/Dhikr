
# Dhikr

**Read. Learn. Reflect.**

Dhikr is a peaceful space to explore the Holy Quran, understand its meaning, and build a consistent reading habit.

Read verses with English translations, listen to Quran recitations, bookmark meaningful passages, and track your reading progress — all in one simple, distraction-free experience.

Reconnect with the Quran, one verse at a time.

## Features

- Read Quran verses with translations.
- Listen to Quran recitations with synchronized verse playback.
- Bookmark meaningful passages.
- Track reading progress locally in your browser.
- Resume reading from your last reached verse.

## Getting Started

### Requirements

- Node.js and npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate and validate Quran data:

   ```bash
   npm run data
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Configuration

The project supports these environment variables:

- `QURAN_DATA_BASE`
- `QURAN_TRANSLATION`
- `QURAN_TRANSLIT`
- `NEXT_PUBLIC_SITE_URL`

See `.env.example` for configuration details.

## Privacy and Sources

Reading progress and bookmarks are stored locally in the browser.

Quran translations, transliteration, and audio may be provided by external sources. Review their attribution, licensing, and reuse terms before redistributing content or deploying publicly.

## Built With

- Next.js
- React
- TypeScript
- Tailwind CSS

---

**Dhikr — Read. Learn. Reflect.**
