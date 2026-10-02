/**
 * Gönnerturnier-Fotos fürs Web aufbereiten.
 *
 * Quelle (Originale, nicht im Repo):  public/brand-assets/images/Goennerverein/<Fotograf>_<Jahr>/*.jpg
 * Ziel (optimiert, im Repo):          public/brand-assets/images/goennerturnier/<jahr>-<nr>.jpg
 * Bildliste für die Website:          src/content/goennerturnier-photos.ts
 *
 * - Schwarzweiss direkt in den Pixeln (Brand-System: Fotos in Graustufen, nicht per CSS-Filter)
 * - Fotografen-Handle als kleines weisses Wasserzeichen unten rechts
 * - Max. 1600px lange Kante, JPEG (mozjpeg), Metadaten (EXIF/GPS) entfernt
 * - Alle Jahre gemischt (feste Zufallsreihenfolge → Server und Browser identisch)
 *
 * Neues Jahr: Ordner "<Fotograf>_<Jahr>" ablegen, Handle unten ergänzen, dann:
 *   node scripts/build-goennerturnier-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/brand-assets/images/Goennerverein";
const OUT = "public/brand-assets/images/goennerturnier";
const MANIFEST = "src/content/goennerturnier-photos.ts";
const MAX_EDGE = 1600;

/** Ordner-Präfix → Instagram-Handle des Fotografen */
const PHOTOGRAPHERS = {
  stauffi: "@stauffi",
  emanuel_stotzer: "@emanuelstotzer",
};

/** Kleines weisses Wasserzeichen unten rechts, mit weichem Schatten für helle Bildstellen */
function watermarkSvg(width, height, handle) {
  const size = Math.max(14, Math.round(Math.min(width, height) * 0.03));
  const margin = Math.round(size * 1.1);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><filter id="s" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="${size * 0.18}" flood-color="#000" flood-opacity="0.55"/></filter></defs>
  <text x="${width - margin}" y="${height - margin}" text-anchor="end" font-family="Playfair Display, Georgia, 'Times New Roman', serif"
    font-size="${size}" font-weight="600" letter-spacing="${size * 0.04}" fill="#ffffff" fill-opacity="0.88" filter="url(#s)">${handle}</text>
</svg>`);
}

/** Deterministischer Zufall (mulberry32) — gleiche Mischung bei jedem Lauf mit gleichen Dateien */
function seededShuffle(list, seed = 2026) {
  let a = seed;
  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const photos = [];
for (const dir of fs.readdirSync(SRC).sort()) {
  const full = path.join(SRC, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  const m = dir.match(/^(.+)_(\d{4})$/);
  if (!m) {
    console.warn(`Übersprungen (Ordnername nicht "<Fotograf>_<Jahr>"): ${dir}`);
    continue;
  }
  const handle = PHOTOGRAPHERS[m[1].toLowerCase()];
  if (!handle) throw new Error(`Unbekannter Fotograf "${m[1]}" — in PHOTOGRAPHERS ergänzen.`);
  const year = Number(m[2]);

  const files = fs
    .readdirSync(full)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "de", { numeric: true }));

  let bytes = 0;
  for (const [i, file] of files.entries()) {
    const name = `${year}-${String(i + 1).padStart(2, "0")}.jpg`;
    const resized = await sharp(path.join(full, file))
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .grayscale()
      .linear(1.08, -8) // leichter Kontrast-Boost wie im Dossier
      .toBuffer({ resolveWithObject: true });
    const { width, height } = resized.info;
    const info = await sharp(resized.data)
      .composite([{ input: watermarkSvg(width, height, handle), top: 0, left: 0 }])
      .jpeg({ quality: 76, mozjpeg: true })
      .toFile(path.join(OUT, name));
    bytes += info.size;
    photos.push({ src: `/brand-assets/images/goennerturnier/${name}`, width, height, year, photographer: handle });
  }
  console.log(`${year} (${handle}): ${files.length} Fotos, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

const mixed = seededShuffle(photos);

const ts = `// Automatisch erzeugt von scripts/build-goennerturnier-photos.mjs — nicht von Hand bearbeiten.

export type GoennerturnierPhoto = {
  src: string;
  width: number;
  height: number;
  year: number;
  /** Fotograf (Instagram-Handle) — als Wasserzeichen im Bild und im Alt-Text */
  photographer: string;
};

/** Alle Jahre gemischt (feste Zufallsreihenfolge) */
export const goennerturnierPhotos: GoennerturnierPhoto[] = ${JSON.stringify(mixed, null, 2)};

/** Fotografen für den Credit-Hinweis */
export const goennerturnierPhotographers: string[] = ${JSON.stringify([...new Set(photos.map((p) => p.photographer))])};
`;
fs.writeFileSync(MANIFEST, ts);
console.log(`${mixed.length} Fotos gemischt → ${MANIFEST}`);
