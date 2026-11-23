// VICE COAST — wires the studio: state, history (undo/reset), photo loading,
// live preview, seeded randomise, and full-resolution PNG export in three sizes.
import { drawCover, defaultState } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const seedEl = document.getElementById('seed-val');
const stageLabel = document.getElementById('stage-label');
const exportSizeEl = document.getElementById('export-size');

let state = defaultState();
let photos = { photo1: null, photo2: null };
let history = [];
let sampleChoice = 'pier';

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function pushHistory() {
  history.push(JSON.stringify(state));
  if (history.length > 40) history.shift();
}

function applySize() {
  const [w, h] = state.size.split('x').map(Number);
  canvas.width = w; canvas.height = h;
  stageLabel.textContent = `LIVE PREVIEW · ${w} × ${h}`;
  exportSizeEl.textContent = `${w} × ${h}`;
}

function syncControls() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('title', state.title); set('subtitle', state.subtitle); set('tagline', state.tagline);
  set('layout', state.layout); set('theme', state.theme); set('characters', state.characters);
  set('vehicle', state.vehicle); set('zoom', state.zoom); set('pan', state.pan);
  set('tilt', state.tilt); set('warmth', state.warmth); set('glow', state.glow);
  document.getElementById('grain').checked = state.grain !== false;
  document.getElementById('zoom-val').textContent = `${Number(state.zoom).toFixed(2)}×`;
  document.getElementById('pan-val').textContent = String(state.pan);
  document.getElementById('tilt-val').textContent = `${state.tilt}°`;
  document.getElementById('warmth-val').textContent = String(state.warmth);
  document.getElementById('glow-val').textContent = String(state.glow);
  seedEl.textContent = String(state.seed);
  document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b.dataset.size === state.size));
}

function redraw() {
  applySize();
  drawCover(canvas, state, photos);
  syncControls();
}

function change(mutator, label) {
  pushHistory();
  mutator();
  redraw();
  if (label) statusEl.textContent = label;
}

async function loadSample(name) {
  sampleChoice = name;
  try {
    photos.photo1 = await loadImage(`samples/${name}.jpg`);
    document.querySelectorAll('[data-sample]').forEach(b => b.classList.toggle('on', b.dataset.sample === name));
    redraw();
    statusEl.textContent = `Sample ${name} loaded into the hero panel.`;
  } catch { statusEl.textContent = 'Sample photo could not be loaded.'; }
}

async function loadFile(input, key) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    photos[key] = await loadImage(URL.createObjectURL(file));
    redraw();
    statusEl.textContent = `${file.name} loaded — drag the zoom and position sliders to frame it.`;
  } catch { statusEl.textContent = 'That file could not be read as an image.'; }
}

function bind(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
}

bind('photo1', 'change', e => loadFile(e.target, 'photo1'));
bind('photo2', 'change', e => loadFile(e.target, 'photo2'));
bind('title', 'input', e => change(() => { state.title = e.target.value; }));
bind('subtitle', 'input', e => change(() => { state.subtitle = e.target.value; }));
bind('tagline', 'input', e => change(() => { state.tagline = e.target.value; }));
bind('layout', 'change', e => change(() => { state.layout = e.target.value; }, 'Layout changed.'));
bind('theme', 'change', e => change(() => { state.theme = e.target.value; }, 'Theme changed.'));
bind('characters', 'change', e => change(() => { state.characters = e.target.value; }, 'Characters changed.'));
bind('vehicle', 'change', e => change(() => { state.vehicle = e.target.value; }, 'Vehicle changed.'));
bind('zoom', 'input', e => change(() => { state.zoom = Number(e.target.value); }));
bind('pan', 'input', e => change(() => { state.pan = Number(e.target.value); }));
bind('tilt', 'input', e => change(() => { state.tilt = Number(e.target.value); }));
bind('warmth', 'input', e => change(() => { state.warmth = Number(e.target.value); }));
bind('glow', 'input', e => change(() => { state.glow = Number(e.target.value); }));
bind('grain', 'change', e => change(() => { state.grain = e.target.checked; }));

document.querySelectorAll('[data-sample]').forEach(b => b.addEventListener('click', () => loadSample(b.dataset.sample)));
bind('clear-photos', 'click', () => change(() => { photos = { photo1: null, photo2: null }; }, 'Photos cleared — art-only cover.'));
document.querySelectorAll('.size-btn').forEach(b => b.addEventListener('click', () => change(() => { state.size = b.dataset.size; }, `Preview size ${b.dataset.size}.`)));

bind('dice', 'click', () => change(() => { state.seed = 1 + Math.floor(Math.random() * 999); }, 'New seed — same seed, same cover.'));
bind('surprise', 'click', () => change(() => {
  const layouts = ['sunset-heist', 'neon-nights', 'coastline', 'wanted'];
  const themes = ['sunset', 'neon', 'day', 'vice'];
  state.seed = 1 + Math.floor(Math.random() * 999);
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.theme = themes[Math.floor(Math.random() * themes.length)];
  state.characters = ['duo', 'woman', 'man'][Math.floor(Math.random() * 3)];
  state.vehicle = ['car', 'boat', 'none'][Math.floor(Math.random() * 3)];
}, 'Surprise cover generated — Undo brings the last one back.'));
bind('undo', 'click', () => {
  const prev = history.pop();
  if (!prev) { statusEl.textContent = 'Nothing to undo yet.'; return; }
  state = JSON.parse(prev);
  redraw();
  statusEl.textContent = 'Undone.';
});
bind('reset', 'click', () => change(() => { state = defaultState(); photos = { photo1: null, photo2: null }; }, 'Back to the default cover.'));

bind('export', 'click', () => {
  const [w, h] = state.size.split('x').map(Number);
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  drawCover(off, state, photos);
  off.toBlob(blob => {
    if (!blob) { statusEl.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-coast-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved vice-coast-${w}x${h}.png (${Math.round(blob.size / 1024)} KB).`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (nextState, nextPhotos) => {
    if (nextState) state = { ...defaultState(), ...nextState };
    if (nextPhotos) {
      for (const [key, name] of Object.entries(nextPhotos)) {
        if (name) photos[key] = await loadImage(`samples/${name}.jpg`);
      }
    }
    redraw();
  });
} else {
  loadSample('pier');
}
