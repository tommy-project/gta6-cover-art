# VICE COAST — Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/tommy-project/cover-art/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/tommy-project/cover-art/reward.svg)](https://make.fun/c/gta6-cover-art-01)

An offline web app that turns your photos + a caption into striking GTA VI-style cover art — a multi-panel poster with an original illustrated tropical coastal city, sunset / neon colour grades, original vector characters and a vehicle, bold poster typography — and exports it as a high-resolution PNG in **1080×1080, 1080×1350, and 1920×1080**.

## How it works

1. Load up to two of your own photos (or try a sample) — they fill the poster panels. Zoom and pan the hero photo to frame it.
2. Type a title, subtitle and tagline.
3. Pick a layout (Sunset Heist, Neon Nights, Coastline, Wanted), a theme (Sunset, Neon Night, Day, Vice Pink), characters and a vehicle.
4. Hit **Export PNG** — the exact cover you see, at the size you picked.

Extras: seeded randomise (same seed = same cover), Surprise Me, Undo / Reset, warmth + glow controls, film grain + vignette.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080
```

No network, no account, no upload — your photos never leave the machine. All artwork is original, drawn in code with Canvas 2D. No Rockstar logo, artwork or fonts are used.

## Entry

Built for the make.fun competition **gta6-cover-art-01** — "Make GTA 6 Cover Art". `main.ts` (Node 22) copies `app/` + `screenshots/` to `/output` and writes `dossier.json` via the vendored `vendor/makefun-app.ts`.

## Competition result

Final rank #2,467 of 7,362 entries, $0 (0 matches played — the entry was
screened out of the judged playoff).
