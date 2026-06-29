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
  heroPrimary: "Mauro Gilardi, Swiss PGA Professional aus der Schweiz",
  portraitTournament: "Mauro Gilardi während eines internationalen Golfturniers",
  tournamentAction: "Schweizer Golfprofi Mauro Gilardi auf der ProGolf Tour",
  progolfTour: "Schweizer Golfprofi Mauro Gilardi auf der ProGolf Tour",
  golfEvent: "Mauro Gilardi bei einem Golf Event in der Schweiz",
  golfTeam: "Mauro Gilardi, Swiss PGA Professional mit Team",
} as const;

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
