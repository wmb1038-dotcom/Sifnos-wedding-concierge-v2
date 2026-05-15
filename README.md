# Sifnos Wedding Concierge — v2

A multi-tab mobile companion for **Carolina &amp; Christina's wedding on Sifnos, 4 September 2026**.

> Ζήτω η αγάπη! &mdash; *Long live love.*

## What's inside

Five tabs, one chat:

- **Today** — Countdown / live schedule / Sifnos weather / smart daily suggestion
- **Wedding** — Full agenda, venue, dress, bus, FAQ, the couple's story
- **Sifnos** — Hand-drawn interactive island map + filterable directory of Caro &amp; Chris's picks
- **Travel** — Ferries, getting around, packing list, currency, Greek phrasebook, emergency
- **Ask** — A friendly AI concierge, contextually aware of which tab you came from

Front-end: **React + Vite**. Back-end: a single **Python serverless function** (`api/chat.py`) proxying to **Google Gemini**. Weather from **Open-Meteo** (no key needed). Deployed to **Vercel** (free tier covers a wedding-week's traffic easily).

## Local development (one-time setup)

1. Install [Node.js 20+](https://nodejs.org) and the [Vercel CLI](https://vercel.com/docs/cli):
   ```bash
   npm i -g vercel
   ```
2. Copy the env template and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   - `GEMINI_API_KEY` — free from <https://aistudio.google.com/apikey>
   - `RSVP_CODE` — whatever code you'll give your guests (case-insensitive)
3. Install front-end deps:
   ```bash
   npm install
   ```
4. Start the dev server (runs both Vite and the Python function on one port):
   ```bash
   vercel dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

> **Note:** Run `vercel dev`, not `npm run dev`. `vercel dev` is what gives you the `/api/chat` endpoint locally. Plain `vite dev` will serve only the front end.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In the Vercel dashboard, "Add New Project" → import the repo. Vercel will auto-detect Vite.
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `RSVP_CODE`
   - (optional) `GEMINI_MODEL` — defaults to `gemini-2.5-flash`
4. Deploy. Your concierge is live.

## Editing content

All the wedding/island content lives in `src/data/`. The site rebuilds whenever you edit those files (no React knowledge needed for content tweaks).

- `src/data/wedding.js` — schedule, venue, dress, bus route, story, RSVP info
- `src/data/places.js` — every restaurant, beach, sunset spot, etc. shown on the Sifnos tab and the island map
- `src/data/travel.js` — ferries, getting-around, packing list, phrasebook, emergency info, FAQ

The AI concierge's knowledge lives in `api/chat.py` — three big string constants at the top (`WEDDING_INFO`, `COUPLE_PICKS`, `PHRASES`, `EMERGENCY`). Keep this in sync with the front-end data so guests get the same answers whether they read the tabs or ask the bot.

## What still needs Caro &amp; Chris's input

A few items are stubbed with TBD until the couple confirms:

- `BUS_ROUTE.stops` in `src/data/wedding.js` — exact pickup times
- Any last-minute additions to the restaurant/beach lists

The map pin coordinates are approximate (they're stylized teardrops on a hand-drawn island outline, not surveyor-accurate placements).

## Cost expectations

- **Vercel Hobby tier**: free, covers the project comfortably.
- **Open-Meteo**: free, no key, no rate-limit issues at this scale.
- **Gemini 2.5 Flash**: a wedding-week of traffic costs single-digit dollars at most. (`gemini-3-flash-preview` is similarly priced when in preview.)
