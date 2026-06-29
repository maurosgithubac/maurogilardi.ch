import { buildHomeSeoTitle, buildSeoTitle } from "@/lib/seo/build-seo-title";

/** Central page titles — keyword-rich, brand-consistent, ~50–58 chars */

export const seoPageTitles = {
  home: buildHomeSeoTitle("Mauro Gilardi", "Gilardi Golf – Swiss PGA Professional"),

  ueberMich: buildSeoTitle("Schweizer Golfprofi Graubünden", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  blog: buildSeoTitle("Golf Blog Pro Golf Tour", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  erfolge: buildSeoTitle("Turniererfolge Golf Schweiz", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  sponsoring: buildSeoTitle("Sponsoring Golf Professional", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  faq: buildSeoTitle("FAQ Swiss PGA & Pro Golf Tour", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  sponsoren: buildSeoTitle("Sponsoren & Partner Golf", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  gallerie: buildSeoTitle("Golf Galerie Tour Schweiz", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  media: buildSeoTitle("Presse & Medien Golf Pro", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  equipment: buildSeoTitle("Golf Equipment Mein Bag", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  impressum: buildSeoTitle("Impressum", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),

  datenschutz: buildSeoTitle("Datenschutz", {
    suffix: "Mauro Gilardi · maurogilardi.ch",
  }),

  blogFallback: buildSeoTitle("Golf Beitrag", {
    suffix: "Mauro Gilardi · Gilardi Golf",
  }),
} as const;

export const seoSiteName = "Gilardi Golf | Mauro Gilardi Swiss PGA";
