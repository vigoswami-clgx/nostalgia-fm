# nostalgia-fm

Single-page nostalgia music site built with Next.js App Router, TypeScript, Tailwind CSS v4, and the YouTube IFrame Player API.

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Required background assets

Drop these two files into `/home/runner/work/nostalgia-fm/nostalgia-fm/public/bg/`:

- `scene-wide.png`
- `scene-tall.png`

(Only filenames are required in git. Asset files are intentionally not committed.)

## Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

## Production run

```bash
npm run build && npm start
```

## Deploy to Vercel (one-click)

1. Push your branch/PR to GitHub.
2. Import this repo in Vercel (`vercel.com/new`).
3. Keep defaults and deploy.

Vercel auto-detects Next.js and creates preview + production URLs.

## Add tracks

Edit `lib/tracks.ts` and add one line per track in any playlist array using this exact shape:

```ts
{ id: "song-001", title: "Song Title", artist: "Artist Name", film: "Film Name", year: 1988, duration: 248, videoId: "dQw4w9WgXcQ" },
```

## Note on YouTube embeds

YouTube playback/embedding behavior can differ between `localhost` and deployed domains based on rights-holder restrictions.
