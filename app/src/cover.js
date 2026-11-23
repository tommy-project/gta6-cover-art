// VICE COAST — the cover renderer. Every pixel is drawn in code: an original
// tropical coastal city at sunset, multi-panel photo collage, original vector
// characters, a vehicle, and bold poster typography. No copied artwork, no
// Rockstar logo, no external assets. Deterministic: the same state + seed
// always draws the same cover (seeded RNG only, never Math.random/Date).
export const THEMES = {
  sunset: { sky: ['#2b1055', '#c33d7a', '#ff7a3d', '#ffc46b'], sun: '#ffd76b', sunCore: '#fff3c4', sea: '#1c2a5e', seaLight: '#ff7a3d', far: '#3a1c5e', near: '#1d0f33', neon1: '#ff5da2', neon2: '#ffb13d', accent: '#ff5da2', ink: '#160a24' },
  neon: { sky: ['#0a0620', '#3d0f5e', '#c2187a', '#ff2e88'], sun: '#ff5da2', sunCore: '#ffe3f1', sea: '#0a1030', seaLight: '#22e6ff', far: '#241040', near: '#0d0620', neon1: '#22e6ff', neon2: '#ff2e88', accent: '#22e6ff', ink: '#0a0618' },
  day: { sky: ['#1e6fa8', '#4fb3c9', '#ffd98a', '#fff3c4'], sun: '#fff3c4', sunCore: '#ffffff', sea: '#0e5a7a', seaLight: '#7fe3ff', far: '#2a5a7a', near: '#123a52', neon1: '#ff7a3d', neon2: '#ffd76b', accent: '#ff7a3d', ink: '#0d2a3d' },
  vice: { sky: ['#2a0a3d', '#8a1a6e', '#ff2e88', '#ff8ac2'], sun: '#ff8ac2', sunCore: '#ffe3f1', sea: '#2a0a4a', seaLight: '#ff5da2', far: '#3d145e', near: '#180a2e', neon1: '#ff2e88', neon2: '#b13dff', accent: '#ff2e88', ink: '#180a2e' },
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fitFont(ctx, text, maxWidth, startSize, weight = 900) {
  let size = startSize;
  ctx.font = `${weight} ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  }
  return size;
}

function drawPalm(ctx, x, y, s, lean, pal) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
  ctx.strokeStyle = pal.near; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -52, -4, -96); ctx.stroke();
  ctx.strokeStyle = '#0f2a1e'; ctx.lineWidth = 7;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.05 + i * 0.14);
    ctx.beginPath(); ctx.moveTo(-4, -96);
    ctx.quadraticCurveTo(-4 + Math.cos(a) * 46, -96 + Math.sin(a) * 18, -4 + Math.cos(a) * 78, -96 + Math.sin(a) * 62);
    ctx.stroke();
  }
  ctx.fillStyle = '#3d1c1c';
  ctx.beginPath(); ctx.arc(2, -92, 7, 0, Math.PI * 2); ctx.arc(-10, -88, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSkyline(ctx, w, yBase, hgt, pal, rng, dark, lit) {
  ctx.fillStyle = dark;
  let x = -10;
  while (x < w + 10) {
    const bw = 26 + rng() * 74;
    const bh = hgt * (0.35 + rng() * 0.65);
    ctx.fillRect(x, yBase - bh, bw, bh);
    if (rng() > 0.6) { ctx.fillRect(x + bw * 0.3, yBase - bh - 14 - rng() * 22, 4, 14 + rng() * 22); }
    if (lit) {
      ctx.fillStyle = rng() > 0.5 ? pal.neon1 : '#ffd76b';
      for (let k = 0; k < 5; k++) {
        if (rng() > 0.45) ctx.fillRect(x + 5 + rng() * (bw - 12), yBase - bh + 8 + rng() * (bh - 16), 4, 5);
      }
      ctx.fillStyle = dark;
    }
    x += bw + 2 + rng() * 10;
  }
}

function drawSun(ctx, w, h, pal, glow) {
  // The sun sits in the open mid band (below the panels, above the sea),
  // so it is always visible — never hidden behind a photo panel.
  const cx = w * 0.5, cy = h * 0.60, r = Math.min(w, h) * 0.16;
  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
  halo.addColorStop(0, pal.sun + '55'); halo.addColorStop(1, pal.sun + '00');
  ctx.fillStyle = halo; ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, pal.sunCore); g.addColorStop(0.55, pal.sun); g.addColorStop(1, pal.neon1);
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = pal.sky[0];
  let yy = cy + r * 0.08;
  for (let i = 0; i < 5; i++) { ctx.fillRect(cx - r, yy, r * 2, 3 + i * 3.4); yy += r * 0.16; }
  ctx.restore();
}

function drawCar(ctx, x, y, s, pal) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = pal.neon1; ctx.shadowBlur = 22;
  ctx.fillStyle = pal.neon1; ctx.beginPath(); ctx.ellipse(0, 26, 150, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#120a1e';
  ctx.beginPath();
  ctx.moveTo(-150, 18); ctx.lineTo(-138, -6); ctx.lineTo(-78, -14); ctx.lineTo(-52, -38);
  ctx.lineTo(28, -38); ctx.lineTo(62, -14); ctx.lineTo(138, -6); ctx.lineTo(150, 18);
  ctx.quadraticCurveTo(120, 26, 60, 24); ctx.lineTo(-60, 24); ctx.quadraticCurveTo(-120, 26, -150, 18);
  ctx.fill();
  ctx.fillStyle = '#7fe3ff';
  ctx.beginPath(); ctx.moveTo(-46, -32); ctx.lineTo(22, -32); ctx.lineTo(48, -14); ctx.lineTo(-66, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd76b'; ctx.beginPath(); ctx.arc(138, 4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff2e4d'; ctx.beginPath(); ctx.arc(-140, 4, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0612';
  for (const wx of [-92, 92]) { ctx.beginPath(); ctx.arc(wx, 20, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c9c4d1'; ctx.beginPath(); ctx.arc(wx, 20, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#0a0612'; }
  ctx.restore();
}

function drawBoat(ctx, x, y, s, pal) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#f4eef7';
  ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(130, 0); ctx.lineTo(96, 34); ctx.lineTo(-96, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = pal.neon1; ctx.fillRect(-130, -2, 260, 6);
  ctx.fillStyle = '#120a1e'; ctx.fillRect(-58, -58, 116, 56);
  ctx.fillStyle = '#7fe3ff'; ctx.fillRect(-48, -50, 96, 22);
  ctx.strokeStyle = '#f4eef7'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(0, -96); ctx.stroke();
  ctx.fillStyle = pal.neon2; ctx.beginPath(); ctx.moveTo(0, -96); ctx.lineTo(44, -72); ctx.lineTo(0, -66); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawWoman(ctx, x, y, s, pal) {
  // Solid silhouette with a neon rim light — a poster figure, not a cartoon.
  // One dark shape, wide shoulders, a bob haircut, one hand on the hip.
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#0d0a18';
  ctx.beginPath(); ctx.moveTo(-18, -92); ctx.lineTo(16, -92); ctx.lineTo(24, 96); ctx.lineTo(9, 96); ctx.lineTo(0, -30); ctx.lineTo(-9, 96); ctx.lineTo(-24, 96); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-36, -168); ctx.quadraticCurveTo(0, -184, 36, -168); ctx.lineTo(30, -92); ctx.lineTo(-30, -92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0d0a18'; ctx.lineWidth = 20; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-32, -162); ctx.quadraticCurveTo(-54, -120, -40, -76); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(32, -162); ctx.quadraticCurveTo(54, -138, 46, -102); ctx.stroke();
  ctx.fillStyle = '#0d0a18';
  ctx.beginPath(); ctx.arc(0, -196, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -202, 24, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(26, -174, 20, -166); ctx.lineTo(13, -186); ctx.lineTo(-13, -186); ctx.lineTo(-20, -166); ctx.quadraticCurveTo(-26, -174, -24, -202); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = pal.neon1; ctx.lineWidth = 5; ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.moveTo(34, -168); ctx.quadraticCurveTo(38, -130, 30, -94); ctx.stroke();
  ctx.beginPath(); ctx.arc(14, -202, 20, -0.9, 0.6); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawMan(ctx, x, y, s, pal) {
  // Solid silhouette with a neon rim light, backwards cap, one hand in pocket.
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#0d0a18';
  ctx.beginPath(); ctx.moveTo(-18, -88); ctx.lineTo(16, -88); ctx.lineTo(24, 96); ctx.lineTo(9, 96); ctx.lineTo(0, -28); ctx.lineTo(-9, 96); ctx.lineTo(-24, 96); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-38, -170); ctx.quadraticCurveTo(0, -188, 38, -170); ctx.lineTo(32, -88); ctx.lineTo(-32, -88); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0d0a18'; ctx.lineWidth = 20; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-34, -164); ctx.quadraticCurveTo(-58, -118, -44, -72); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(34, -164); ctx.quadraticCurveTo(58, -132, 48, -96); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -198, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -212, 19, Math.PI, 0); ctx.fill(); ctx.fillRect(-19, -214, 38, 6); ctx.fillRect(14, -212, 16, 5);
  ctx.strokeStyle = pal.neon2; ctx.lineWidth = 5; ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.moveTo(-36, -170); ctx.quadraticCurveTo(-40, -130, -32, -90); ctx.stroke();
  ctx.beginPath(); ctx.arc(-14, -200, 19, Math.PI * 0.6, Math.PI * 1.1); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function layoutPanels(layout, w, h) {
  // Panels live in the upper 2/3 only: the sky, sun and skyline stay visible
  // above and between them, and the bottom third is kept clear for the
  // vehicle, the characters and the title — nothing overlaps the title.
  const P = [];
  if (layout === 'neon-nights') {
    P.push({ x: 0.06, y: 0.10, w: 0.88, h: 0.32, photo: 'photo1', tilt: 0 });
    P.push({ x: 0.06, y: 0.44, w: 0.42, h: 0.13, photo: 'photo2', tilt: -1 });
    P.push({ x: 0.52, y: 0.44, w: 0.42, h: 0.13, photo: 'photo1', tilt: 1 });
  } else if (layout === 'coastline') {
    P.push({ x: 0.05, y: 0.10, w: 0.90, h: 0.32, photo: 'photo1', tilt: 0 });
    P.push({ x: 0.05, y: 0.44, w: 0.28, h: 0.13, photo: 'photo2', tilt: 2 });
    P.push({ x: 0.36, y: 0.44, w: 0.28, h: 0.13, photo: 'photo1', tilt: -2 });
    P.push({ x: 0.67, y: 0.44, w: 0.28, h: 0.13, photo: 'photo2', tilt: 0 });
  } else if (layout === 'wanted') {
    P.push({ x: 0.06, y: 0.10, w: 0.42, h: 0.22, photo: 'photo1', tilt: -1 });
    P.push({ x: 0.52, y: 0.10, w: 0.42, h: 0.22, photo: 'photo2', tilt: 1 });
    P.push({ x: 0.06, y: 0.34, w: 0.42, h: 0.22, photo: 'photo2', tilt: 1 });
    P.push({ x: 0.52, y: 0.34, w: 0.42, h: 0.22, photo: 'photo1', tilt: -1 });
  } else {
    // Sunset Heist: two panels only, each photo once — no repeated crop.
    P.push({ x: 0.06, y: 0.10, w: 0.56, h: 0.38, photo: 'photo1', tilt: -1 });
    P.push({ x: 0.66, y: 0.10, w: 0.28, h: 0.38, photo: 'photo2', tilt: 1.5 });
  }
  return P.map(p => ({ ...p, x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h }));
}

function drawPhotoPanel(ctx, panel, photo, state, pal) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(((panel.tilt || 0) + state.tilt) * Math.PI / 180 * 0.35);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#f4eef7'; ctx.fillRect(-7, -7, w + 14, h + 14);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  if (photo && photo.naturalWidth) {
    const zoom = state.zoom || 1.15;
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * zoom;
    const pw = photo.naturalWidth * scale, ph = photo.naturalHeight * scale;
    const pan = (state.pan || 0) / 100 * w * 0.3;
    ctx.drawImage(photo, (w - pw) / 2 + pan, (h - ph) / 2, pw, ph);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, pal.neon2); g.addColorStop(1, pal.neon1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffd76b';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.34, Math.min(w, h) * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `900 ${Math.round(h * 0.16)}px "Arial Black", sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText('YOUR PHOTO', w / 2, h * 0.62);
    ctx.font = `700 ${Math.round(h * 0.07)}px sans-serif`;
    ctx.fillText('TAP PHOTO 1 / 2 TO LOAD ONE', w / 2, h * 0.74);
  }
  const tint = ctx.createLinearGradient(0, h * 0.55, 0, h);
  tint.addColorStop(0, 'rgba(255,90,120,0)'); tint.addColorStop(1, 'rgba(120,20,90,0.35)');
  ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawTitleBlock(ctx, w, h, state, pal) {
  const title = (state.title || 'VICE COAST').trim().toUpperCase() || 'VICE COAST';
  const sub = (state.subtitle || '').trim().toUpperCase();
  const tag = (state.tagline || '').trim().toUpperCase();
  ctx.textAlign = 'center';
  // Tagline lives at the very top, in clear sky — never behind the title.
  if (tag) {
    ctx.font = `700 ${Math.round(h * 0.016)}px sans-serif`;
    try { ctx.letterSpacing = '4px'; } catch { /* older canvas */ }
    ctx.fillStyle = '#ffe9f4';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 6;
    ctx.fillText(tag, w / 2, h * 0.055);
    ctx.shadowBlur = 0;
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  // Subtitle pill sits just above the title, below the characters' feet.
  if (sub) {
    ctx.font = `900 ${Math.round(h * 0.024)}px "Arial Black", sans-serif`;
    const sw = Math.min(w * 0.62, ctx.measureText(sub).width + h * 0.06);
    const sy = h * 0.845;
    ctx.save();
    ctx.fillStyle = pal.neon1;
    const bx = w / 2 - sw / 2, bw = sw, bh = h * 0.038, r = bh / 2;
    ctx.beginPath(); ctx.roundRect(bx, sy, bw, bh, r); ctx.fill();
    ctx.fillStyle = '#160a24';
    fitFont(ctx, sub, bw * 0.92, h * 0.024);
    ctx.textBaseline = 'middle';
    ctx.fillText(sub, w / 2, sy + bh / 2 + 1);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
  const size = fitFont(ctx, title, w * 0.94, h * 0.085);
  const ty = h * 0.965;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = size * 0.22; ctx.shadowOffsetY = size * 0.06;
  ctx.strokeStyle = pal.ink; ctx.lineWidth = size * 0.14;
  ctx.strokeText(title, w / 2, ty);
  const grad = ctx.createLinearGradient(0, ty - size, 0, ty);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.55, '#ffd76b'); grad.addColorStop(1, pal.neon1);
  ctx.fillStyle = grad; ctx.fillText(title, w / 2, ty);
  ctx.restore();
}

function drawBadge(ctx, w, h, pal, rng) {
  // Top-right corner, in clear sky above the panels — never over a face.
  const cx = w * 0.92, cy = h * 0.05, r = Math.min(w, h) * 0.056;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.1);
  ctx.fillStyle = '#ffd76b'; ctx.strokeStyle = pal.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = pal.ink; ctx.textAlign = 'center';
  ctx.font = `900 ${Math.round(r * 0.34)}px "Arial Black", sans-serif`;
  ctx.fillText('LEONIDA', 0, -r * 0.02);
  ctx.font = `700 ${Math.round(r * 0.28)}px sans-serif`;
  ctx.fillText('EST. 2026', 0, r * 0.42);
  ctx.restore();
}

/** Draws the whole cover onto `canvas` from `state` and `photos` ({photo1, photo2}). */
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const pal = THEMES[state.theme] || THEMES.sunset;
  const rng = mulberry32((state.seed || 7) * 2654435761 + 97);
  const warmth = (state.warmth ?? 50) / 100;
  const glow = (state.glow ?? 60) / 100;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, pal.sky[0]); sky.addColorStop(0.45, pal.sky[1]); sky.addColorStop(0.75, pal.sky[2]); sky.addColorStop(1, pal.sky[3]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // stars for night themes
  if (state.theme === 'neon' || state.theme === 'vice') {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.3 + rng() * 0.6; ctx.fillRect(rng() * w, rng() * h * 0.3, 2, 2); }
    ctx.globalAlpha = 1;
  }
  // Mid band, fully visible between the panels and the foreground:
  // far skyline first, then the sun in front of it, then sea + near skyline.
  drawSkyline(ctx, w, h * 0.60, h * 0.10, pal, rng, pal.far, false);
  drawSun(ctx, w, h, pal, glow);
  ctx.fillStyle = pal.sea; ctx.fillRect(0, h * 0.60, w, h * 0.10);
  ctx.fillStyle = pal.seaLight; ctx.globalAlpha = 0.35;
  for (let i = 0; i < 10; i++) { const y = h * 0.61 + i * h * 0.009; ctx.fillRect(w * (0.42 + rng() * 0.08), y, w * (0.08 + rng() * 0.1), 2); }
  ctx.globalAlpha = 1;
  drawSkyline(ctx, w, h * 0.70, h * 0.07, pal, rng, pal.near, true);
  // Road foreground, bottom third.
  const fg = ctx.createLinearGradient(0, h * 0.70, 0, h);
  fg.addColorStop(0, pal.near); fg.addColorStop(1, '#0a0612');
  ctx.fillStyle = fg; ctx.fillRect(0, h * 0.70, w, h * 0.30);
  ctx.strokeStyle = pal.neon1; ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke(); ctx.globalAlpha = 1;

  // Palms frame the mid band, at its left and right edges.
  drawPalm(ctx, w * 0.03, h * 0.71, Math.min(w, h) / 1080 * 1.0, 0.18, pal);
  drawPalm(ctx, w * 0.97, h * 0.71, Math.min(w, h) / 1080 * 0.9, -0.22, pal);

  // Photo panels (upper part only).
  for (const panel of layoutPanels(state.layout || 'sunset-heist', w, h)) {
    drawPhotoPanel(ctx, panel, photos ? photos[panel.photo] : null, state, pal);
  }

  // Vehicle on the road, characters standing on it — feet at 0.83, clear
  // of the subtitle pill (0.845) and the title below it.
  const u = Math.min(w, h) / 1080;
  if (state.vehicle === 'boat') drawBoat(ctx, w * 0.5, h * 0.64, u * 0.9, pal);
  else if (state.vehicle === 'car') drawCar(ctx, w * 0.5, h * 0.75, u * 1.05, pal);
  if (state.characters === 'duo') { drawWoman(ctx, w * 0.16, h * 0.83, u * 1.05, pal); drawMan(ctx, w * 0.84, h * 0.83, u * 1.10, pal); }
  else if (state.characters === 'woman') drawWoman(ctx, w * 0.84, h * 0.83, u * 1.15, pal);
  else if (state.characters === 'man') drawMan(ctx, w * 0.84, h * 0.83, u * 1.15, pal);

  drawBadge(ctx, w, h, pal, rng);
  drawTitleBlock(ctx, w, h, state, pal);

  // warmth wash + grain + vignette
  if (warmth > 0.02) { ctx.fillStyle = `rgba(255,110,40,${(warmth * 0.12).toFixed(3)})`; ctx.fillRect(0, 0, w, h); }
  if (state.grain !== false) {
    const grng = mulberry32((state.seed || 7) * 97 + 13);
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 900; i++) { ctx.fillStyle = grng() > 0.5 ? '#ffffff' : '#000000'; ctx.fillRect(grng() * w, grng() * h, 2, 2); }
    ctx.globalAlpha = 1;
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
}

export function defaultState() {
  return { title: 'VICE COAST', subtitle: 'SUNSET HEIST', tagline: 'LEONIDA · EST. 2026', layout: 'sunset-heist', theme: 'sunset', characters: 'duo', vehicle: 'car', warmth: 50, glow: 60, grain: true, seed: 7, zoom: 1.15, pan: 0, tilt: 4, size: '1080x1350' };
}
