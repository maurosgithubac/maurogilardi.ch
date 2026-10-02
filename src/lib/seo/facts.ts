/**
 * Zentrale, maschinenlesbare Faktenquelle für JSON-LD und /llms.txt.
 *
 * Nur Fakten, die bereits in `src/content/*` stehen (Zeitstrahl, Medien, Sponsoren, Gönner-Modelle).
 * Nichts hinzuerfinden — neue Erfolge zuerst in `career.ts` / `media-press.ts` pflegen, dann hier verlinken.
 */

import { careerStats } from "@/content/career";
import { seasonCampaign } from "@/content/campaign";
import { enrichAndSortPressItems, pressItems, type EnrichedPressItem } from "@/content/media-press";
import { siteContent } from "@/content/siteContent";
import { socialProfiles } from "@/content/socialProfiles";
import { SITE_URL } from "@/lib/seo/constants";

/* ——— Stabile Entity-IDs (nie ändern: externe Graphen/KI-Indizes referenzieren sie) ——— */

export const PERSON_ID = `${SITE_URL}/#mauro-gilardi`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PORTRAIT_ID = `${SITE_URL}/#portrait`;
export const ORG_IDS = {
  swissPga: `${SITE_URL}/#org-swiss-pga`,
  swissGolf: `${SITE_URL}/#org-swiss-golf`,
  swissGolfTeam: `${SITE_URL}/#org-swiss-golf-team`,
  proGolfTour: `${SITE_URL}/#org-pro-golf-tour`,
  homeClub: `${SITE_URL}/#org-golfclub-domat-ems`,
  goennervereinigung: `${SITE_URL}/#org-mg-goennervereinigung`,
} as const;
/** OfferCatalog der Gönner-Modelle (definiert auf /sponsoring) */
export const GOENNER_CATALOG_ID = `${SITE_URL}/sponsoring#goenner-modelle`;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Externe Profile, die eindeutig Mauro Gilardi bezeichnen (Quelle: socialProfiles.ts, media-press.ts). */
export const personProfileUrls = {
  instagram: socialProfiles.instagram.url,
  linkedin: socialProfiles.linkedin.url,
  proGolfTour: "https://www.progolftour.de/spieler-profil/55943",
  swissPga: "https://swisspga.ch/spieler-detail/156?year=2025",
  owgr: "https://www.owgr.com/playerprofile/mauro-gilardi-27006",
  dataGolf: "https://datagolf.com/player-profiles?dg_id=27006",
  friendsOfSwissGolfTalents: "https://friendsofswissgolftalents.ch/talent/mauro-gilardi/",
} as const;

/** `sameAs` nur für Profile DIESER Person — keine Verbands-Startseiten (die sind memberOf/affiliation). */
export const personSameAsUrls: string[] = Object.values(personProfileUrls);

export const personFacts = {
  name: "Mauro Gilardi",
  givenName: "Mauro",
  familyName: "Gilardi",
  brand: "Gilardi Golf",
  email: siteContent.contact.email,
  /** Laut Zeitstrahl (career.ts) — nur das Jahr ist bekannt, daher kein schema.org birthDate */
  birthYear: 1999,
  nationality: "Schweiz",
  region: "Graubünden",
  homeClub: { name: "Golfclub Domat/Ems", url: "https://www.golfdomatems.ch/" },
  proSince: careerStats.proSince,
  pgtWins: careerStats.pgtWins,
  pgtRankingCurrent: careerStats.pgtRankingCurrent,
  pgtRankingYear: careerStats.pgtRankingYear,
  seasonBudgetChf: careerStats.seasonBudgetChf,
  campaignYear: seasonCampaign.year,
  goal: "Etablierung auf der DP World Tour",
} as const;

/** Kurzbeschreibung (de-CH) für Person-Schema und llms.txt */
export const personSummary =
  "Mauro Gilardi (Jahrgang 1999) ist ein Schweizer Profigolfer aus Graubünden, Swiss PGA Playing Professional und Mitglied des Swiss Golf Teams. " +
  "Profi seit 2022, zwei Siege auf der Pro Golf Tour (The Cuber Open 2025, Staan Open 2026), Swiss Golf Open Champion 2025. " +
  "2026 schaffte er als Rang 4 der Order of Merit der Pro Golf Tour den Aufstieg in die HotelPlanner Tour (Saison 2027), eine Stufe unter der DP World Tour. " +
  "Seit 2026 Vorstandsmitglied der Swiss PGA und Head of Playing Professional Commission.";

/** Titel und Turniersiege (Quelle: career.ts, media-press.ts) — neueste zuerst */
export const personAwards: string[] = [
  "Aufstieg in die HotelPlanner Tour 2027 als Rang 4 der Order of Merit der Pro Golf Tour (2026)",
  "Sieg Staan Open, Pro Golf Tour, Niederlande (August 2026, im Playoff)",
  "Swiss Golf Open Champion (2025)",
  "Sieg The Cuber Open, Pro Golf Tour (2025, erster Profisieg)",
  "Bronzemedaille European Amateur Team Championship mit dem Schweizer Team (2020)",
  "Sieg Österreichische Internationale Meisterschaften (2020)",
  "Sieg Engadin International Amateur Championship (2017)",
];

/** Kernfakten als Stichworte für llms.txt */
export const personKeyFacts: string[] = [
  "Name: Mauro Gilardi (Marke «Gilardi Golf», Instagram @gilardigolf)",
  "Nationalität: Schweiz; Heimatregion: Graubünden; Club: Golfclub Domat/Ems",
  "Jahrgang: 1999; Golf seit 2005; Profi seit 2022 (Wechsel vom Amateur- ins Profigolf)",
  "Verbände: Swiss PGA (Playing Professional; seit 2026 Board Member und Head of Playing Professional Commission), Swiss Golf Team",
  "Tour 2026: Pro Golf Tour (PGT) — Rang 4 der Order of Merit, damit Aufstieg in die HotelPlanner Tour",
  "Tour 2027: HotelPlanner Tour (vormals Challenge Tour), eine Stufe unter der DP World Tour",
  "Profisiege: The Cuber Open 2025 (erster PGT-Sieg), Staan Open 2026 (Playoff-Sieg, Niederlande)",
  "Titel: Swiss Golf Open Champion 2025 (Platzrekord 64, Gesamt −21, Domat/Ems)",
  "Saison 2025: sieben Top-15-Resultate auf der PGT, 13. Rang im PGT-Jahresranking, 17. Rang Swiss Challenge (Challenge-Tour-Event)",
  "Amateur: Sieg Engadin International Amateur Championship 2017; Bronze Team-EM 2020; Sieg Österreichische Internationale Meisterschaften 2020",
  "Ausbildung/Hintergrund: Informatik; erste Spitzensport-RS in Magglingen (2021); Start CAS Elite Sports Management (2026)",
  "Ziel: sich auf der DP World Tour etablieren",
  `Saisonbudget: rund ${formatChf(careerStats.seasonBudgetChf)} CHF pro Saison, getragen von Gönnern, Sponsoren und Partnern`,
];

export function formatChf(value: number): string {
  return value.toLocaleString("de-CH").replace(/[’’]/g, "'");
}

/** Wichtige Seiten — für llms.txt und Breadcrumb-Namen */
export const keyPages: { path: string; title: string; summary: string }[] = [
  { path: "/", title: "Startseite", summary: "Überblick: Kennzahlen, Meilensteine, nächste Turniere, neueste Blogbeiträge." },
  { path: "/ueber-mich", title: "Über mich", summary: "Profil, Werdegang, Werte und Projekte neben der Tour." },
  { path: "/erfolge", title: "Erfolge", summary: "Karriere-Zeitstrahl von 1999 bis 2026 mit allen Titeln und Meilensteinen." },
  { path: "/blog", title: "Blog", summary: "Tour-Tagebuch: Turnierberichte, Training und Entscheidungen aus erster Hand." },
  { path: "/2027", title: "Saison 2027", summary: "Kampagne zur Finanzierung der ersten Saison auf der HotelPlanner Tour." },
  { path: "/sponsoring", title: "Gönner werden", summary: "Gönner-Modelle (100er Club, Birdie, Eagle, Albatros) und Anfrageformular." },
  { path: "/partner", title: "Für Unternehmen", summary: "Sponsoring und Partnerschaften für Firmen, ab 2'000 CHF pro Jahr." },
  { path: "/ueber-mich/sponsoren", title: "Sponsoren", summary: "Aktuelle Sponsoren, Ausrüster und Unterstützer." },
  { path: "/ueber-mich/media", title: "Medien", summary: "Presseberichte, Tour-Meldungen und offizielle Spielerprofile." },
  { path: "/ueber-mich/faq", title: "FAQ", summary: "Häufige Fragen zu Touren, Swiss PGA, Swiss Golf und Gönnervereinigung." },
  { path: "/ueber-mich/equipment", title: "Equipment", summary: "Schläger im Bag und Fitting-Partner." },
  { path: "/ueber-mich/gallerie", title: "Galerie", summary: "Bilder von Tour, Training und Events." },
  { path: "/impressum", title: "Impressum", summary: "Verantwortliche Stelle und Kontakt." },
];

/* ——— Medienberichte ——— */

/** schema.org-Typ eines Eintrags aus media-press.ts (Profil, Ergebnis-/Turnierseite oder Artikel) */
export function pressItemType(item: Pick<EnrichedPressItem, "title" | "href">): "ProfilePage" | "WebPage" | "NewsArticle" {
  if (/profil|ranking|order of merit|kader/i.test(item.title)) return "ProfilePage";
  if (/wikipedia\.org|tournament-details|\/results|turnierseite|ergebnis|resultat|golfplatz/i.test(`${item.href} ${item.title}`)) {
    return "WebPage";
  }
  return "NewsArticle";
}

/**
 * Redaktionelle Berichte (keine Profile/Ergebnislisten), neueste zuerst — Quelle: media-press.ts.
 * Innerhalb eines Jahres gilt die gepflegte Reihenfolge in `pressItems` (dort chronologisch, neueste oben).
 */
export function keyPressReports(limit = 10, minYear = 2025): EnrichedPressItem[] {
  const curatedIndex = new Map(pressItems.map((item, i) => [item.href, i] as const));
  return enrichAndSortPressItems()
    .filter((item) => item.sortYear >= minYear && pressItemType(item) === "NewsArticle")
    .sort((a, b) => b.sortYear - a.sortYear || (curatedIndex.get(a.href) ?? 0) - (curatedIndex.get(b.href) ?? 0))
    .slice(0, limit);
}
