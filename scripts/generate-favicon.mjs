/**
 * Master raster: `public/brand-assets/logos/logo.png` (Datei kann JPEG sein trotz .png — wird per sharp gelesen).
 * Erzeugt: public/favicon.ico, src/app/icon.png, src/app/apple-icon.png
 */

import { writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MASTER = join(root, "public", "brand-assets", "logos", "logo.png");

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** @param {number} px — Füllt den Quadranten; Bild wird nicht künstlich verkleinert/«schmaler» mit Rändern — Überschuss wird beschnitten. */
function resizedPng(px) {
  return sharp(MASTER).resize(px, px, { fit: "cover", position: "centre" }).flatten({ background: WHITE }).png();
}

async function main() {
  const pid = `${Date.now()}`;
  const tmpPaths = [];

  try {
    const sizes = [16, 32, 48, 128];
    for (const s of sizes) {
      const p = join(tmpdir(), `mg-ico-${pid}-${s}.png`);
      await resizedPng(s).toFile(p);
      tmpPaths.push(p);
    }

    const icoBuf = await pngToIco(tmpPaths);
    writeFileSync(join(root, "public", "favicon.ico"), icoBuf);

    await resizedPng(512).toFile(join(root, "src", "app", "icon.png"));

    await resizedPng(180).toFile(join(root, "src", "app", "apple-icon.png"));

    console.log("Generated public/favicon.ico, src/app/icon.png, src/app/apple-icon.png");
  } finally {
    for (const p of tmpPaths) {
      try {
        unlinkSync(p);
      } catch {
        /* ignore */
      }
    }
  }
}

await main().catch((e) => {
  console.error(e);
  process.exit(1);
});
