// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the full studio with a photo loaded, ?shot=neon and
// ?shot=portrait show two more cover variants. window.__shotReady is set
// once the scene has painted, so a screenshot tool can wait for it.
export async function runShot(shot, query, load) {
  const caption = query.get('caption') ?? 'VICE COAST';
  if (shot === 'cover') {
    // Portrait export (1080x1350): the photos frame properly here, unlike
    // the ultra-wide landscape panels, so this is the cover screenshot.
    document.body.classList.add('shot-cover');
    await load(
      { title: caption, subtitle: 'SUNSET HEIST', tagline: 'LEONIDA · EST. 2026', layout: 'sunset-heist', theme: 'sunset', characters: 'duo', vehicle: 'car', seed: 7, size: '1080x1350' },
      { photo1: query.get('photo') ?? 'pier', photo2: 'boulevard' },
    );
  } else if (shot === 'neon') {
    // Same framing as the cover, neon theme — wide-hero layouts crop faces,
    // so every cover shot uses the portrait sunset-heist framing.
    document.body.classList.add('shot-cover');
    await load(
      { title: 'NEON NIGHTS', subtitle: 'VICE AFTER DARK', tagline: 'LEONIDA · EST. 2026', layout: 'sunset-heist', theme: 'neon', characters: 'duo', vehicle: 'car', seed: 21, size: '1080x1350' },
      { photo1: 'pier', photo2: 'boulevard' },
    );
  } else if (shot === 'portrait') {
    document.body.classList.add('shot-cover');
    await load(
      { title: 'VICE COAST', subtitle: 'COASTLINE', tagline: 'LEONIDA · EST. 2026', layout: 'sunset-heist', theme: 'vice', characters: 'duo', vehicle: 'boat', seed: 42, size: '1080x1350' },
      { photo1: 'pier', photo2: 'boulevard' },
    );
  } else {
    // editor (default): full studio, pier photo loaded, sunset theme.
    await load(
      { title: caption, subtitle: 'SUNSET HEIST', tagline: 'LEONIDA · EST. 2026', layout: 'sunset-heist', theme: 'sunset', characters: 'duo', vehicle: 'car', seed: 7, size: '1080x1350' },
      { photo1: query.get('photo') ?? 'pier', photo2: 'boulevard' },
    );
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
