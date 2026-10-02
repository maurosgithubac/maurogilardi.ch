/** Zentrale SEO-Konstanten — Metadaten, OG-Bilder, Entity-Keywords (kein sichtbarer UI-Text) */

export const SITE_URL = "https://www.maurogilardi.ch";

/** SEO-optimierte Bildpfade unter /public/brand-assets/images/ */
export const seoImages = {
  heroPrimary: "/brand-assets/images/mauro-gilardi-swiss-pga-professional.jpg",
  portraitTournament: "/brand-assets/images/mauro-gilardi-professional-golfer-switzerland.jpg",
  tournamentAction: "/brand-assets/images/mauro-gilardi-golf-tournament-switzerland.jpg",
  progolfTour: "/brand-assets/images/mauro-gilardi-progolf-tour-switzerland.jpg",
  golfEvent: "/brand-assets/images/mauro-gilardi-golf-event-schweiz.jpg",
  golfTeam: "/brand-assets/images/mauro-gilardi-golf-team-switzerland.jpg",
} as const;

export const seoImageAlts = {
  heroPrimary: "Mauro Gilardi, Swiss PGA Professional, vor einer Swiss-Golf-Fahne",
  portraitTournament: "Schweizer Golfprofi Mauro Gilardi im Gespräch auf der Driving Range",
  tournamentAction: "Mauro Gilardi beim Eisenschlag vor Zuschauern an einem Profiturnier",
  progolfTour: "Mauro Gilardi mit Siegertrophäe nach einem Turniersieg als Golfprofi",
  golfEvent: "Mauro Gilardi mit Gästen an einem Golf-Event im Fitting-Studio",
  golfTeam: "Mauro Gilardi mit seinem Coach im Trainingszentrum vor Bergkulisse",
} as const;

/**
 * Open-Graph-/Twitter-Bilder im Format 1200×630 (Zuschnitte der seoImages).
 * Gleiche Dateinamen wie die Originale, Ordner `og/`.
 */
export const seoOgImagePaths = {
  heroPrimary: "/brand-assets/images/og/mauro-gilardi-swiss-pga-professional.jpg",
  portraitTournament: "/brand-assets/images/og/mauro-gilardi-professional-golfer-switzerland.jpg",
  tournamentAction: "/brand-assets/images/og/mauro-gilardi-golf-tournament-switzerland.jpg",
  progolfTour: "/brand-assets/images/og/mauro-gilardi-progolf-tour-switzerland.jpg",
  golfEvent: "/brand-assets/images/og/mauro-gilardi-golf-event-schweiz.jpg",
  golfTeam: "/brand-assets/images/og/mauro-gilardi-golf-team-switzerland.jpg",
} as const satisfies Record<keyof typeof seoImages, string>;

export type SeoImageKey = keyof typeof seoOgImagePaths;

/** Offizielles Markenlogo — eine Quelle für Header, Admin, Schema & SEO */
export const brandLogo = {
  path: "/brand-assets/logos/mauro-gilardi-golf-logo.svg",
  alt: "Mauro Gilardi – Swiss PGA Professional Golf Logo",
  width: 180,
  height: 44,
} as const;

/** @deprecated Alias — bitte überall `brandLogo` verwenden */
export const seoLogo = brandLogo;

export const entityKeywords = [
  "Mauro Gilardi",
  "Mauro Gilardi Golf",
  "Gilardi Golf",
  "GilardiGolf",
  "Schweizer Golfprofi",
  "Swiss PGA Professional",
  "Professional Golfer",
  "Playing Professional",
  "Swiss Golf Team",
  "Schweizer Spitzensportler",
  "Golf Coach Schweiz",
  "Golf Referent Schweiz",
  "Golf Event Schweiz",
  "Pro Golf Tour",
  "Golf Professional Graubünden",
  "Golf Graubünden",
  "Golf Schweiz",
  "Golf Coach Graubünden",
] as const;

export function seoOgImages(
  path: string,
  alt: string,
): { url: string; width: number; height: number; alt: string }[] {
  return [{ url: path, width: 1200, height: 630, alt }];
}

export function seoTwitterImages(path: string) {
  return [path];
}

/** OG-Bild (1200×630) inkl. Alt-Text für einen der zentralen Bild-Schlüssel */
export function seoOgImage(key: SeoImageKey) {
  return seoOgImages(seoOgImagePaths[key], seoImageAlts[key]);
}
