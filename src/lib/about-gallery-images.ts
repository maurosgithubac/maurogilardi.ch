import fs from "fs/promises";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "brand-assets", "gallerie");

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

/**
 * Liest Bilddateien aus public/brand-assets/gallerie (Sortierung: Dateiname, de-CH).
 */
export async function listAboutGalleryFilenames(): Promise<string[]> {
  try {
    const names = await fs.readdir(GALLERY_DIR);
    return names
      .filter((f) => IMAGE_EXT.test(f) && !f.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "de-CH", { numeric: true, sensitivity: "base" }));
  } catch {
    return [];
  }
}

export function aboutGalleryImageSrc(filename: string): string {
  return `/brand-assets/gallerie/${encodeURIComponent(filename)}`;
}

export function aboutGalleryAltFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/i, "").replace(/[-_]+/g, " ").trim();
  return base.length > 0 ? base : "Galeriebild";
}
