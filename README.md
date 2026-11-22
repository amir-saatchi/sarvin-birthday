# Sarvin's 5th Birthday Website

A magical **Unicorn, Rainbow, Fairy Princess & Kawaii Pastel** 5th birthday website built with **Next.js (App Router), TypeScript, Tailwind CSS, and React Three Fiber**.

## Features

- **Welcome Gift Box Overlay**: Unlocks browser audio and launches rainbow confetti on tap.
- **Persistent Music Player**: Plays across all pages without restarting. Includes a built-in dreamy Happy Birthday music-box fallback until you add your own MP3s.
- **Landing Page (`/`)**: 3D interactive 5-candle birthday cake (tap all 5 glowing candles to blow them out!), 3D unicorn & rainbow arch, heartfelt birthday note, and game cards.
- **Game 1 — 3D Rainbow Balloon Pop (`/games/balloon-pop`)**: Tap floating 3D pastel balloons and golden fairy stars (+2 points) to earn Rainbow Crowns.
- **Game 2 — 3D Unicorn Cloud Catcher (`/games/unicorn-catch`)**: Slide the 3D unicorn (touch, mouse, arrow buttons, or keyboard arrows) to catch 15 cupcakes, strawberries, gems, and stars.

## How to Add Your Own Music

1. Place your `.mp3` file(s) inside `public/audio/` (for example: `public/audio/birthday-song.mp3`).
2. Open `src/config/music.ts` and add them to `MUSIC_TRACKS`:

```ts
export const MUSIC_TRACKS: MusicTrack[] = [
  { title: "Sarvin's Birthday Song", src: "/audio/birthday-song.mp3" },
];
```

## How to Customize Texts & Language

All Persian (and English) UI texts, birthday wishes, and game labels live in `src/config/translate.ts` (no hardcoded Persian strings in component files). Edit `TRANSLATIONS.fa` to customize any text, or change `ACTIVE_LOCALE` between `"fa"` and `"en"`.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

Push this repository to GitHub and import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected with zero extra configuration.
