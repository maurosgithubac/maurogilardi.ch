/**
 * Statische Sponsoren-Logos (public/brand-assets/images/Sponsors/).
 * Präfix im Dateinamen: 1_ Hauptsponsoren, 2_ Ausrüster & Marken, 3_ weitere Sponsoren.
 */

export type SiteSponsor = {
  id: string;
  /** Vollständiger Pfad ab /public */
  imageSrc: string;
  /** Anzeige- und Alt-Text */
  displayName: string;
  /** `null` = keine Verlinkung; mit `/` = interne Route (z. B. Sponsoring) */
  href: string | null;
};

export type SiteSponsorTier = {
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  sponsors: SiteSponsor[];
};

const SPONSOR_IMG = (file: string) => `/brand-assets/images/Sponsors/${file}`;

/** Ebene 1 — Hauptsponsoren */
const tier1: SiteSponsor[] = [
  {
    id: "casutt",
    imageSrc: SPONSOR_IMG("1_Casutt.png"),
    displayName: "Casutt Druck & Werbetechnik",
    href: "https://www.casutt-gruppe.ch/",
  },
  {
    id: "fosgt",
    imageSrc: SPONSOR_IMG("1_FOSGT.png"),
    displayName: "Friends Of Swiss Golf Talents",
    href: "https://friendsofswissgolftalents.ch/",
  },
  {
    id: "goennervereinigung",
    imageSrc: SPONSOR_IMG("1_Gönnerverenigung.png"),
    displayName: "MG Gönnervereinigung",
    href: "/sponsoring",
  },
  {
    id: "spispo",
    imageSrc: SPONSOR_IMG("1_SpiSpo.png"),
    displayName: "Spitzensport der Schweizer Armee",
    href: "https://www.vtg.admin.ch/de/spitzensport",
  },
  {
    id: "swissgolf",
    imageSrc: SPONSOR_IMG("1_SwissGolf.png"),
    displayName: "Swiss Golf Team",
    href: "https://www.swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
  },
  {
    id: "thegolfers",
    imageSrc: SPONSOR_IMG("1_TheGolfers.png"),
    displayName: "The Golfers Malans",
    href: "https://www.thegolfers.ch/",
  },
];

/** Ebene 2 — Ausrüster & Marken */
const tier2: SiteSponsor[] = [
  {
    id: "jlindeberg",
    imageSrc: SPONSOR_IMG("2_Jlindeberg.png"),
    displayName: "J.Lindeberg Clothing",
    href: "https://www.jlindeberg.com/",
  },
  {
    id: "printbox",
    imageSrc: SPONSOR_IMG("2_printbox.png"),
    displayName: "Printbox Druck & Stick",
    href: "https://www.printbox.ch/",
  },
];

/** Ebene 3 — Weitere Sponsoren */
const tier3: SiteSponsor[] = [
  {
    id: "gcde",
    imageSrc: SPONSOR_IMG("3_GCDE.png"),
    displayName: "Golf Club Domat-Ems",
    href: "https://www.golfdomatems.ch/",
  },
  {
    id: "sgpsc",
    imageSrc: SPONSOR_IMG("3_SGPSC.png"),
    displayName: "Swiss Golf Pro Supporter Club",
    href: "https://www.sgpsc.ch/",
  },
  {
    id: "unic-talent",
    imageSrc: SPONSOR_IMG("3_UnicTalent.png"),
    displayName: "Unic Talent Foundation",
    href: "https://www.unic-talent.ch/",
  },
  {
    id: "update-fitness",
    imageSrc: SPONSOR_IMG("3_UpdateFitness.png"),
    displayName: "Update Fitness",
    href: "https://www.update-fitness.ch/",
  },
];

export const siteSponsorTiers: SiteSponsorTier[] = [
  {
    tier: 1,
    title: "Hauptsponsoren",
    description: "Grösstes Engagement auf meinem Weg.",
    sponsors: tier1,
  },
  {
    tier: 2,
    title: "Ausrüster & Marken",
    description: "Marken und Services rund ums Spiel.",
    sponsors: tier2,
  },
  {
    tier: 3,
    title: "Weitere Sponsoren",
    description: "Vereine, Stiftungen und weitere Unterstützung.",
    sponsors: tier3,
  },
];

export function allSiteSponsorsFlat(): SiteSponsor[] {
  return siteSponsorTiers.flatMap((t) => t.sponsors);
}

/** Startseiten-Marquee: sichtbare Logos aus Ebene 1 und 2 */
export function homeMarqueeSponsorCards(): {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string;
}[] {
  return [...tier1, ...tier2].map((s) => ({
    id: s.id,
    name: s.displayName,
    website_url: s.href,
    logo_url: s.imageSrc,
  }));
}
