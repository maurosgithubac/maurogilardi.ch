import type { Metadata } from "next";
import {
  SITE_URL,
  seoImageAlts,
  seoImages,
  seoOgImages,
  seoTwitterImages,
} from "@/lib/seo/constants";
import { seoPageTitles, seoSiteName } from "@/lib/seo/titles";

/** Individuelle Metadata + JSON-LD-Objekte pro Hauptseite */

export const HOME_PAGE_DESCRIPTION =
  "Gilardi Golf – Mauro Gilardi, Swiss PGA Professional und Schweizer Golfprofi aus Graubünden. Playing Professional, Golf Coach und Tour-Spieler auf der Pro Golf Tour.";

export const homePageMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.home,
  },
  description: HOME_PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  keywords: [
    "Mauro Gilardi",
    "Gilardi Golf",
    "Mauro Gilardi Golf",
    "Swiss PGA Professional",
    "Schweizer Golfprofi",
    "Professional Golfer",
    "Playing Professional",
    "Swiss Golf Team",
    "Pro Golf Tour",
    "Golf Professional Graubünden",
  ],
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: SITE_URL,
    siteName: seoSiteName,
    title: seoPageTitles.home,
    description: HOME_PAGE_DESCRIPTION,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.home,
    description: HOME_PAGE_DESCRIPTION,
    images: seoTwitterImages(seoImages.heroPrimary),
  },
};

export const uebermichMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.ueberMich,
  },
  description:
    "Mauro Gilardi – Swiss PGA Professional und Schweizer Spitzensportler aus Graubünden. Playing Professional auf der Pro Golf Tour, Mitglied im Swiss Golf Team.",
  keywords: [
    "Mauro Gilardi",
    "Schweizer Golfprofi",
    "Schweizer Spitzensportler",
    "Swiss PGA Professional",
    "Playing Professional",
    "Swiss Golf Team",
    "Gilardi Golf",
    "Golf Graubünden",
    "Golf Schweiz",
    "Golf Professional Graubünden",
  ],
  alternates: {
    canonical: `${SITE_URL}/ueber-mich`,
  },
  openGraph: {
    title: seoPageTitles.ueberMich,
    description:
      "Swiss PGA Professional, Playing Professional und Swiss Golf Team Spieler aus Graubünden – Karriere, Projekte und Werdegang.",
    url: `${SITE_URL}/ueber-mich`,
    images: seoOgImages(seoImages.portraitTournament, seoImageAlts.portraitTournament),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.ueberMich,
    description:
      "Swiss PGA Professional, Playing Professional und Swiss Golf Team Spieler aus Graubünden.",
    images: seoTwitterImages(seoImages.portraitTournament),
  },
};

export const uebermichSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/ueber-mich`,
  name: "Über Mauro Gilardi – Schweizer Golf Professional",
  url: `${SITE_URL}/ueber-mich`,
  mainEntity: {
    "@id": `${SITE_URL}/#mauro-gilardi`,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Über mich", item: `${SITE_URL}/ueber-mich` },
    ],
  },
};

export const blogIndexMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.blog,
  },
  description:
    "Tour-Updates vom Schweizer Golfprofi Mauro Gilardi. Turnierberichte, Training und Einblicke als Playing Professional auf der Pro Golf Tour – direkt von der Tour.",
  keywords: [
    "Gilardi Golf Blog",
    "Golf Blog Schweiz",
    "Pro Golf Tour Berichte",
    "Schweizer Golfprofi Blog",
    "Playing Professional",
    "Tour Professional Golf",
    "Swiss PGA Blog",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: seoPageTitles.blog,
    description:
      "Turnierberichte und Einblicke vom Schweizer Golfprofi Mauro Gilardi auf der Pro Golf Tour.",
    url: `${SITE_URL}/blog`,
    images: seoOgImages(seoImages.tournamentAction, seoImageAlts.tournamentAction),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.blog,
    description: "Turnierberichte vom Schweizer Golfprofi Mauro Gilardi auf der Pro Golf Tour.",
    images: seoTwitterImages(seoImages.tournamentAction),
  },
};

export const blogIndexSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog`,
  name: "Gilardi Golf Blog – Mauro Gilardi Pro Golf Tour",
  description:
    "Tour-Updates, Turnierberichte und Training-Einblicke vom Schweizer Golf Professional Mauro Gilardi",
  url: `${SITE_URL}/blog`,
  inLanguage: "de-CH",
  author: {
    "@id": `${SITE_URL}/#mauro-gilardi`,
  },
  about: {
    "@type": "Sport",
    name: "Golf",
  },
};

export const erfolgeMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.erfolge,
  },
  description:
    "Turnierergebnisse und Karriere-Meilensteine von Mauro Gilardi. Schweizer Golfprofi, Swiss PGA Professional und Playing Professional auf der Pro Golf Tour.",
  keywords: [
    "Mauro Gilardi Erfolge",
    "Pro Golf Tour Resultate",
    "Schweizer Golfprofi Erfolge",
    "Playing Professional Schweiz",
    "Swiss PGA Ergebnisse",
    "Tour Professional Golf",
  ],
  alternates: {
    canonical: `${SITE_URL}/erfolge`,
  },
  openGraph: {
    title: seoPageTitles.erfolge,
    description:
      "Karriere und Turnierergebnisse von Mauro Gilardi – Swiss PGA Professional und Playing Professional.",
    url: `${SITE_URL}/erfolge`,
    images: seoOgImages(seoImages.progolfTour, seoImageAlts.progolfTour),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.erfolge,
    description: "Turnierergebnisse und Karriere von Mauro Gilardi, Swiss PGA Professional.",
    images: seoTwitterImages(seoImages.progolfTour),
  },
};

export const erfolgeSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Turnierergebnisse und Karriere-Meilensteine – Mauro Gilardi",
  description:
    "Ergebnisse und Erfolge von Mauro Gilardi als Schweizer Golfprofi und Playing Professional auf der Pro Golf Tour",
  url: `${SITE_URL}/erfolge`,
  author: {
    "@id": `${SITE_URL}/#mauro-gilardi`,
  },
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Swiss Golf Open Champion 2025" },
    { "@type": "ListItem", position: 2, name: "1. Sieg Pro Golf Tour 2025" },
    { "@type": "ListItem", position: 3, name: "13. Rang Jahresranking Pro Golf Tour 2025" },
    { "@type": "ListItem", position: 4, name: "2. Rang Pro Golf Tour Event 2026" },
    { "@type": "ListItem", position: 5, name: "Board Member SwissPGA" },
    { "@type": "ListItem", position: 6, name: "Head of Playing Professional Commission" },
  ],
};

export const sponsoringMetadataSeo: Metadata = {
  title: {
    absolute: seoPageTitles.sponsoring,
  },
  description:
    "Partner und Sponsoring für Mauro Gilardi, Swiss PGA Professional und Schweizer Spitzensportler. Sichtbarkeit auf internationaler Bühne mit einem Playing Professional.",
  keywords: [
    "Gilardi Golf Sponsoring",
    "Partner Golf Schweiz",
    "Golf Sponsoring Schweiz",
    "Swiss PGA Sponsoring",
    "Schweizer Golfer sponsern",
    "Sport Sponsoring Schweiz",
    "Markenbotschafter Golfsport",
  ],
  alternates: {
    canonical: `${SITE_URL}/sponsoring`,
  },
  openGraph: {
    title: seoPageTitles.sponsoring,
    description:
      "Unterstütze Mauro Gilardi – Swiss PGA Professional, Playing Professional und Swiss Golf Team Spieler.",
    url: `${SITE_URL}/sponsoring`,
    images: seoOgImages(seoImages.golfEvent, seoImageAlts.golfEvent),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.sponsoring,
    description: "Sponsoring und Partnerschaften mit Mauro Gilardi, Swiss PGA Professional.",
    images: seoTwitterImages(seoImages.golfEvent),
  },
};

export const sponsoringSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Partner & Sponsoring – Mauro Gilardi, Swiss PGA Professional",
  description:
    "Sponsoring-Möglichkeiten für Mauro Gilardi, Swiss PGA Golf Professional und Schweizer Spitzensportler",
  url: `${SITE_URL}/sponsoring`,
  mainEntity: {
    "@id": `${SITE_URL}/#mauro-gilardi`,
  },
};

export const uebermichFaqMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.faq,
  },
  description:
    "FAQ zu Mauro Gilardi: Pro Golf Tour, Swiss PGA, Swiss Golf Team, Playing Professional, Rankings und Gönnervereinigung – kompakt beantwortet.",
  keywords: [
    "Mauro Gilardi FAQ",
    "Swiss PGA Professional",
    "Pro Golf Tour erklärt",
    "Swiss Golf Team",
    "Playing Professional",
    "Schweizer Golfprofi FAQ",
  ],
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/faq`,
  },
  openGraph: {
    title: seoPageTitles.faq,
    description: "Antworten zu Touren, Swiss PGA, Swiss Golf und Rankings von Mauro Gilardi.",
    url: `${SITE_URL}/ueber-mich/faq`,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.faq,
    description: "FAQ zu Pro Golf Tour, Swiss PGA und Swiss Golf Team.",
    images: seoTwitterImages(seoImages.heroPrimary),
  },
};

export const uebermichSponsorenMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.sponsoren,
  },
  description:
    "Sponsoren und Partner von Mauro Gilardi, Swiss PGA Professional und Schweizer Golfprofi. Netzwerk aus Unternehmen und Gönnern, die den Weg unterstützen.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/sponsoren`,
  },
  openGraph: {
    title: seoPageTitles.sponsoren,
    description: "Partner und Sponsoren von Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/sponsoren`,
    images: seoOgImages(seoImages.portraitTournament, seoImageAlts.portraitTournament),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.sponsoren,
    images: seoTwitterImages(seoImages.portraitTournament),
  },
};

export const uebermichGallerieMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.gallerie,
  },
  description:
    "Galerie von Mauro Gilardi, Swiss PGA Professional. Impressionen von der Pro Golf Tour, Training und Golf Events in der Schweiz.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/gallerie`,
  },
  openGraph: {
    title: seoPageTitles.gallerie,
    description: "Bilder von Tour, Training und Events – Mauro Gilardi, Schweizer Golfprofi.",
    url: `${SITE_URL}/ueber-mich/gallerie`,
    images: seoOgImages(seoImages.golfEvent, seoImageAlts.golfEvent),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.gallerie,
    images: seoTwitterImages(seoImages.golfEvent),
  },
};

export const uebermichMediaMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.media,
  },
  description:
    "Mauro Gilardi in den Medien: Presseberichte, Interviews und Auftritte des Swiss PGA Professionals und Schweizer Spitzensportlers.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/media`,
  },
  openGraph: {
    title: seoPageTitles.media,
    description: "Presse und Medien über Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/media`,
    images: seoOgImages(seoImages.tournamentAction, seoImageAlts.tournamentAction),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.media,
    images: seoTwitterImages(seoImages.tournamentAction),
  },
};

export const uebermichEquipmentMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.equipment,
  },
  description:
    "Equipment und Schläger im Bag von Mauro Gilardi, Swiss PGA Professional und Playing Professional. Driver, Eisen, Wedges und Putter auf der Pro Golf Tour.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/equipment`,
  },
  openGraph: {
    title: seoPageTitles.equipment,
    description: "Schläger und Equipment von Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/equipment`,
    images: seoOgImages(seoImages.golfTeam, seoImageAlts.golfTeam),
  },
  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.equipment,
    images: seoTwitterImages(seoImages.golfTeam),
  },
};

export const impressumMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.impressum,
  },
  description:
    "Impressum und Kontakt zu maurogilardi.ch — Verantwortliche Stelle, Haftung und Hosting-Angaben von Mauro Gilardi, Swiss PGA Professional.",
  alternates: {
    canonical: `${SITE_URL}/impressum`,
  },
  openGraph: {
    title: seoPageTitles.impressum,
    description: "Impressum und Kontakt zu maurogilardi.ch",
    url: `${SITE_URL}/impressum`,
  },
  robots: { index: true, follow: true },
};

export const datenschutzMetadata: Metadata = {
  title: {
    absolute: seoPageTitles.datenschutz,
  },
  description:
    "Datenschutzerklärung für maurogilardi.ch: Newsletter, Kontaktformulare, Cookies und deine Rechte gemäss DSG/DSGVO.",
  alternates: {
    canonical: `${SITE_URL}/datenschutz`,
  },
  openGraph: {
    title: seoPageTitles.datenschutz,
    description: "Datenschutzerklärung und Cookie-Hinweise für maurogilardi.ch",
    url: `${SITE_URL}/datenschutz`,
  },
  robots: { index: true, follow: true },
};
