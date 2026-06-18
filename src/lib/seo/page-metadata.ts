import type { Metadata } from "next";
import {
  SITE_URL,
  seoImageAlts,
  seoImages,
  seoOgImages,
  seoTwitterImages,
} from "@/lib/seo/constants";

/** Individuelle Metadata + JSON-LD-Objekte pro Hauptseite */

export const HOME_PAGE_DESCRIPTION =
  "Swiss PGA Professional Mauro Gilardi. Schweizer Golfprofi, Spitzensportler, Playing Professional, Golf Coach, Referent und Gastgeber exklusiver Golf Experiences.";

export const homePageMetadata: Metadata = {
  title: {
    absolute: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
  },
  description: HOME_PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  keywords: [
    "Mauro Gilardi",
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
    siteName: "Mauro Gilardi | Swiss PGA Professional",
    title: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
    description: HOME_PAGE_DESCRIPTION,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
  },
  twitter: {
    card: "summary_large_image",
    title: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
    description: HOME_PAGE_DESCRIPTION,
    images: seoTwitterImages(seoImages.heroPrimary),
  },
};

export const uebermichMetadata: Metadata = {
  title: {
    absolute: "Mauro Gilardi | Schweizer Golfprofi & Spitzensportler",
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
    "Golf Professional Graubünden",
    "Pro Golf Tour Spieler",
  ],
  alternates: {
    canonical: `${SITE_URL}/ueber-mich`,
  },
  openGraph: {
    title: "Mauro Gilardi | Schweizer Golfprofi & Spitzensportler",
    description:
      "Swiss PGA Professional, Playing Professional und Swiss Golf Team Spieler aus Graubünden – Karriere, Projekte und Werdegang.",
    url: `${SITE_URL}/ueber-mich`,
    images: seoOgImages(seoImages.portraitTournament, seoImageAlts.portraitTournament),
  },
  twitter: {
    card: "summary_large_image",
    title: "Mauro Gilardi | Schweizer Golfprofi & Spitzensportler",
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
    absolute: "Blog | Mauro Gilardi – Tour-Updates & Turnierberichte",
  },
  description:
    "Tour-Updates vom Schweizer Golfprofi Mauro Gilardi. Turnierberichte, Training und Einblicke als Playing Professional auf der Pro Golf Tour – direkt von der Tour.",
  keywords: [
    "Mauro Gilardi Blog",
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
    title: "Blog | Mauro Gilardi – Tour-Updates & Turnierberichte",
    description:
      "Turnierberichte und Einblicke vom Schweizer Golfprofi Mauro Gilardi auf der Pro Golf Tour.",
    url: `${SITE_URL}/blog`,
    images: seoOgImages(seoImages.tournamentAction, seoImageAlts.tournamentAction),
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Mauro Gilardi – Tour-Updates & Turnierberichte",
    description: "Turnierberichte vom Schweizer Golfprofi Mauro Gilardi auf der Pro Golf Tour.",
    images: seoTwitterImages(seoImages.tournamentAction),
  },
};

export const blogIndexSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog`,
  name: "Mauro Gilardi – Golf Pro Blog",
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
    absolute: "Erfolge | Mauro Gilardi – Pro Golf Tour & Karriere",
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
    title: "Erfolge | Mauro Gilardi – Pro Golf Tour & Karriere",
    description:
      "Karriere und Turnierergebnisse von Mauro Gilardi – Swiss PGA Professional und Playing Professional.",
    url: `${SITE_URL}/erfolge`,
    images: seoOgImages(seoImages.progolfTour, seoImageAlts.progolfTour),
  },
  twitter: {
    card: "summary_large_image",
    title: "Erfolge | Mauro Gilardi – Pro Golf Tour & Karriere",
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
    absolute: "Partner & Sponsoring | Mauro Gilardi Golf",
  },
  description:
    "Partner und Sponsoring für Mauro Gilardi, Swiss PGA Professional und Schweizer Spitzensportler. Sichtbarkeit auf internationaler Bühne mit einem Playing Professional.",
  keywords: [
    "Mauro Gilardi Sponsoring",
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
    title: "Partner & Sponsoring | Mauro Gilardi Golf",
    description:
      "Unterstütze Mauro Gilardi – Swiss PGA Professional, Playing Professional und Swiss Golf Team Spieler.",
    url: `${SITE_URL}/sponsoring`,
    images: seoOgImages(seoImages.golfEvent, seoImageAlts.golfEvent),
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner & Sponsoring | Mauro Gilardi Golf",
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
    absolute: "FAQ | Mauro Gilardi – Swiss PGA & Pro Golf Tour",
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
    title: "FAQ | Mauro Gilardi – Swiss PGA & Pro Golf Tour",
    description: "Antworten zu Touren, Swiss PGA, Swiss Golf und Rankings von Mauro Gilardi.",
    url: `${SITE_URL}/ueber-mich/faq`,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Mauro Gilardi – Swiss PGA & Pro Golf Tour",
    description: "FAQ zu Pro Golf Tour, Swiss PGA und Swiss Golf Team.",
    images: seoTwitterImages(seoImages.heroPrimary),
  },
};

export const uebermichSponsorenMetadata: Metadata = {
  title: {
    absolute: "Sponsoren | Mauro Gilardi – Swiss PGA Professional",
  },
  description:
    "Sponsoren und Partner von Mauro Gilardi, Swiss PGA Professional und Schweizer Golfprofi. Netzwerk aus Unternehmen und Gönnern, die den Weg unterstützen.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/sponsoren`,
  },
  openGraph: {
    title: "Sponsoren | Mauro Gilardi – Swiss PGA Professional",
    description: "Partner und Sponsoren von Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/sponsoren`,
    images: seoOgImages(seoImages.portraitTournament, seoImageAlts.portraitTournament),
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsoren | Mauro Gilardi – Swiss PGA Professional",
    images: seoTwitterImages(seoImages.portraitTournament),
  },
};

export const uebermichGallerieMetadata: Metadata = {
  title: {
    absolute: "Galerie | Mauro Gilardi – Golfprofi Schweiz",
  },
  description:
    "Galerie von Mauro Gilardi, Swiss PGA Professional. Impressionen von der Pro Golf Tour, Training und Golf Events in der Schweiz.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/gallerie`,
  },
  openGraph: {
    title: "Galerie | Mauro Gilardi – Golfprofi Schweiz",
    description: "Bilder von Tour, Training und Events – Mauro Gilardi, Schweizer Golfprofi.",
    url: `${SITE_URL}/ueber-mich/gallerie`,
    images: seoOgImages(seoImages.golfEvent, seoImageAlts.golfEvent),
  },
  twitter: {
    card: "summary_large_image",
    title: "Galerie | Mauro Gilardi – Golfprofi Schweiz",
    images: seoTwitterImages(seoImages.golfEvent),
  },
};

export const uebermichMediaMetadata: Metadata = {
  title: {
    absolute: "Medien | Mauro Gilardi – Presse & Interviews",
  },
  description:
    "Mauro Gilardi in den Medien: Presseberichte, Interviews und Auftritte des Swiss PGA Professionals und Schweizer Spitzensportlers.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/media`,
  },
  openGraph: {
    title: "Medien | Mauro Gilardi – Presse & Interviews",
    description: "Presse und Medien über Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/media`,
    images: seoOgImages(seoImages.tournamentAction, seoImageAlts.tournamentAction),
  },
  twitter: {
    card: "summary_large_image",
    title: "Medien | Mauro Gilardi – Presse & Interviews",
    images: seoTwitterImages(seoImages.tournamentAction),
  },
};

export const uebermichEquipmentMetadata: Metadata = {
  title: {
    absolute: "Mein Bag | Mauro Gilardi – Equipment Swiss PGA Pro",
  },
  description:
    "Equipment und Schläger im Bag von Mauro Gilardi, Swiss PGA Professional und Playing Professional. Driver, Eisen, Wedges und Putter auf der Pro Golf Tour.",
  alternates: {
    canonical: `${SITE_URL}/ueber-mich/equipment`,
  },
  openGraph: {
    title: "Mein Bag | Mauro Gilardi – Equipment Swiss PGA Pro",
    description: "Schläger und Equipment von Mauro Gilardi, Swiss PGA Professional.",
    url: `${SITE_URL}/ueber-mich/equipment`,
    images: seoOgImages(seoImages.golfTeam, seoImageAlts.golfTeam),
  },
  twitter: {
    card: "summary_large_image",
    title: "Mein Bag | Mauro Gilardi – Equipment Swiss PGA Pro",
    images: seoTwitterImages(seoImages.golfTeam),
  },
};
