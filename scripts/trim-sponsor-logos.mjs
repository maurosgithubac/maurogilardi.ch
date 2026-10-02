/**
 * Erzeugt beschnittene Sponsoren-Logos (ohne den Leerraum der 500×500-Quadrate)
 * für Laufband und Logo-Raster: public/brand-assets/images/Sponsors/trim/<datei>.png
 *
 *   node scripts/trim-sponsor-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/brand-assets/images/Sponsors";
const OUT = path.join(SRC, "trim");
const PAD = 12;

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(SRC)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
  const target = path.join(OUT, file.replace(/\.(jpe?g|webp)$/i, ".png"));
  const { data, info } = await sharp(path.join(SRC, file)).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
  await sharp(data)
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(target);
  console.log(`${file}: ${info.width}×${info.height} → ${path.relative(".", target)}`);
}
