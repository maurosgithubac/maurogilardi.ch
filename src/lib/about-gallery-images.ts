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

/**
 * Beschreibende Alt-Texte pro Datei (SEO + Screenreader). Kamera-Dateinamen wie
 * «FB_IMG_…» oder «1L9A…» sagen nichts aus — deshalb gepflegte Beschreibungen.
 * Neue Bilder hier ergänzen; ohne Eintrag greift ein neutraler Fallback.
 */
const GALLERY_ALTS: Record<string, string> = {
  "183.jpg": "Mauro Gilardi zeigt mit dem Schläger die Spiellinie an",
  "195.jpg": "Mauro Gilardi beim Annäherungsschlag vor Zuschauern an einem Turnier",
  "197.jpg": "Mauro Gilardi kniet auf dem Grün und liest die Puttlinie",
  "198.jpg": "Mauro Gilardi beim Putten während einer Turnierrunde",
  "1L9A8797.JPG": "Mauro Gilardi, Swiss PGA Professional, vor einer Swiss-Golf-Fahne",
  "1L9A8970.JPG": "Mauro Gilardi beim Putten im Trainingscamp",
  "1L9A9274.JPG": "Mauro Gilardi mit dem Swiss Golf Team auf dem Golfplatz",
  "1L9A9440.JPG": "Mauro Gilardi im Gespräch mit seinem Coach auf der Driving Range",
  "1L9A9629.JPG": "Mauro Gilardi im Durchschwung beim Abschlag",
  "1L9A9630.JPG": "Mauro Gilardi im Finish nach dem Abschlag",
  "1L9A9644.JPG": "Mauro Gilardi liest auf dem Grün die Puttlinie",
  "1L9A9647.JPG": "Mauro Gilardi beim Putten auf dem Übungsgrün",
  "FB_IMG_1749420674850.jpg": "Junioren mit Mauro Gilardi vor der Resultattafel eines Turniers",
  "FB_IMG_1749420679146.jpg": "Junioren begleiten einen Flight bei Regen über den Golfplatz",
  "FB_IMG_1749420683938.jpg": "Mauro Gilardi beim Abschlag zwischen den Bäumen",
  "GRF00856 - Kopie.jpg": "Mauro Gilardi im Finish vor Bergkulisse in Graubünden",
  "GRF00873.jpg": "Mauro Gilardi auf dem Fairway vor Bergpanorama",
  "GRF00878 - Kopie.jpg": "Mauro Gilardi auf dem Golfplatz vor Bergkulisse im Abendlicht",
  "GRF00895 - Kopie.jpg": "Mauro Gilardi mit Golfbag am Teich vor Felswand",
  "IMG_4049.jpg": "Mauro Gilardi am Abschlag beim Omega European Masters in Crans-Montana",
  "Mauro Gilardi_5068.jpg": "Mauro Gilardi mit Caddie beim Omega European Masters",
  "PXL_20250608_160138697.MP.jpg": "Resultattafel eines Turniers mit dem Namen Gilardi",
  "dynamic_bunker.jpg": "Mauro Gilardi beim Schlag aus dem Bunker",
  "mauro gilardi-17.jpg": "Mauro Gilardi im Durchschwung vor blauem Himmel",
  "mauro gilardi_LowRes-5.jpg": "Mauro Gilardi beim Abschlag mit Weitblick über das Tal",
  "mauro&friends-103.jpg": "Mauro Gilardi mit Gästen auf dem Fairway",
  "mauro&friends-11.jpg": "Mauro Gilardi im Porträt beim Schläger-Fitting",
  "mauro&friends-13.jpg": "Mauro Gilardi zeigt Gästen das Schläger-Fitting im Indoor-Studio",
  "mauro&friends-145.jpg": "Mauro Gilardi mit einem Flight beim Golfanlass",
  "mauro&friends-163.jpg": "Mauro Gilardi mit Gästen beim Golfanlass vor Bergkulisse",
  "mauro&friends-243.jpg": "Gruppenbild von Mauro Gilardi mit einem Flight auf dem Grün",
  "mauro&friends-27.jpg": "Golfer mit Trolleys auf dem Fairway beim Golfanlass",
  "mauro&friends-285.jpg": "Mauro Gilardi mit einer Golferin beim Golfanlass",
  "mauro&friends-286.jpg": "Mauro Gilardi mit zwei Gästen beim Golfanlass",
  "mauro&friends-34.jpg": "Mauro Gilardi mit einem Gast und Golftrolley auf dem Fairway",
  "mauro&friends-379.jpg": "Mauro Gilardi mit einem Flight beim Golfanlass im Herbst",
  "mauro&friends-4.jpg": "Golf-Clinic mit Mauro Gilardi im Fitting-Studio",
  "mauro&friends-44.jpg": "Mauro Gilardi mit einem Viererflight beim Golfanlass",
  "mauro&friends-453.jpg": "Mauro Gilardi mit drei Golfern auf dem Abschlag",
  "mauro&friends-527.jpg": "Mauro Gilardi mit Gästen beim Golfanlass",
  "mauro&friends-8.jpg": "Mauro Gilardi beim Schläger-Fitting mit Blick auf die Berge",
  "mauro-1.jpg": "Porträt von Mauro Gilardi auf dem Golfplatz",
  "mauro-11.jpg": "Mauro Gilardi konzentriert auf dem Golfplatz",
  "mauro-15.jpg": "Mauro Gilardi im Finish nach dem Drive",
  "mauro-26.jpg": "Mauro Gilardi mit Alignment-Stick im Training",
  "mauro-3.jpg": "Porträt von Mauro Gilardi im roten Poloshirt",
  "mauro-4.jpg": "Mauro Gilardi beim Eisenschlag während eines Turniers",
  "mauro-6.jpg": "Mauro Gilardi neben seinem Golfbag auf der Runde",
  "mauro-82.jpg": "Mauro Gilardi beim Aufschwung mit dem Driver",
  "portrait closeup.jpg": "Porträt von Mauro Gilardi, Schweizer Golfprofi",
  "swing_dynamic.jpg": "Mauro Gilardi im dynamischen Durchschwung",
};

export function aboutGalleryAltFromFilename(filename: string): string {
  return GALLERY_ALTS[filename] ?? "Mauro Gilardi, Schweizer Golfprofi – Impression aus der Galerie";
}
