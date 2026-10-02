import { buildHomeSeoTitle, buildSeoTitle } from "@/lib/seo/build-seo-title";

/**
 * Zentrale Seitentitel — Keyword vorne, Marke hinten, ≤ 60 Zeichen.
 *
 * Keyword-Verteilung (keine Kannibalisierung):
 * - /                      Brand «Mauro Gilardi», «Gilardi Golf», «Schweizer Golfprofi»
 * - /ueber-mich            «Swiss PGA Professional», «Golfprofi Graubünden»
 * - /erfolge               «Pro Golf Tour» (Resultate)
 * - /blog                  Turnierberichte / Tour-Updates
 * - /sponsoring            «Golf Gönner werden» (Gönnervereinigung)
 * - /2027                  «HotelPlanner Tour» Saison-Kampagne (Gönner, sekundär)
 * - /partner               «Golf Sponsoring Schweiz» (Unternehmen)
 */
export const seoPageTitles = {
  home: buildHomeSeoTitle("Mauro Gilardi – Schweizer Golfprofi", "Gilardi Golf"),

  ueberMich: buildSeoTitle("Swiss PGA Professional aus Graubünden", { suffix: "Mauro Gilardi" }),

  blog: buildSeoTitle("Golf-Blog: Turnierberichte von der Tour", { suffix: "Mauro Gilardi" }),

  erfolge: buildSeoTitle("Erfolge & Resultate auf der Pro Golf Tour", { suffix: "Mauro Gilardi" }),

  sponsoring: buildSeoTitle("Golf Gönner werden – Gönnervereinigung", { suffix: "Mauro Gilardi" }),

  partner: buildSeoTitle("Golf Sponsoring Schweiz für Unternehmen", { suffix: "Mauro Gilardi" }),

  saison2027: buildSeoTitle("Saison 2027 auf der HotelPlanner Tour", { suffix: "Mauro Gilardi" }),

  faq: buildSeoTitle("FAQ: Pro Golf Tour, Swiss PGA & Gönner", { suffix: "Mauro Gilardi" }),

  sponsoren: buildSeoTitle("Sponsoren & Partner"),

  gallerie: buildSeoTitle("Golf-Galerie: Bilder von Tour & Training", { suffix: "Mauro Gilardi" }),

  media: buildSeoTitle("Presse & Medienberichte"),

  equipment: buildSeoTitle("Equipment: Schläger im Bag"),

  impressum: buildSeoTitle("Impressum"),

  datenschutz: buildSeoTitle("Datenschutzerklärung"),

  blogFallback: buildSeoTitle("Golf-Blog"),
} as const;

/** og:site_name — kurz und markenkonsistent */
export const seoSiteName = "Mauro Gilardi · Gilardi Golf";
