// VICE COAST — gta6-cover-art-01 entry program (Node 22, standard library only).
// The entry is the static offline app in app/ beside this file. This program
// hands it in: it copies app/ and screenshots/ into the grader's /output and
// writes /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library in vendor/makefun-app.ts (copied from the kit, unchanged).
// It is deterministic: the same tree always produces the same bytes.
// Run locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with: node serve.ts  (then open http://localhost:8080)
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps (from the kit's reference/gate.json): text_max_bytes shapes
// the dossier text; the other caps refuse an entry the scorer would refuse —
// more than 4 screenshots, a screenshot over 256 KiB, more than 993 files or
// 48 MiB under app/, or an app/ path over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
