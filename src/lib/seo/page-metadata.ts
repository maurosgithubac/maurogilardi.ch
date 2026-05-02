import type { Metadata } from "next";

/** Individuelle Metadata + JSON-LD-Objekte pro Hauptseite */

export const uebermichMetadata: Metadata = {
  title: "Über mich – Mauro Gilardi, Schweizer Golf Professional aus Graubünden",
  description:
    "Mauro Gilardi – SwissPGA Golf Professional aus Graubünden, Schweiz. Aktiv auf der Pro Golf Tour seit 2022. Erfahre mehr über seinen Weg als Schweizer Golf Profi, seine Ausbildung und Projekte.",
  keywords: [
    "Mauro Gilardi",
    "Schweizer Golf Professional",
    "Golf Profi Graubünden",
    "SwissPGA Pro",
    "Bündner Golfer",
    "Golf Profi Schweiz",
    "Swiss Golf Team Mitglied",
    "Pro Golf Tour Spieler",
    "Golf Karriere Schweiz",
    "Schweizer Golfspieler Profil",
  ],
  alternates: {
    canonical: "https://www.maurogilardi.ch/ueber-mich",
  },
  openGraph: {
    title: "Über Mauro Gilardi – Schweizer Golf Pro aus Graubünden",
    description:
      "SwissPGA Golf Professional, Swiss Golf Team Mitglied, Pro Golf Tour Spieler. Aus Graubünden, Schweiz. Karriere seit 2022.",
    url: "https://www.maurogilardi.ch/ueber-mich",
    images: [
      {
        url: "/brand-assets/images/1L9A9440.JPG",
        width: 1200,
        height: 630,
        alt: "Mauro Gilardi – Schweizer Golf Professional",
      },
    ],
  },
};

export const uebermichSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://www.maurogilardi.ch/ueber-mich",
  name: "Über Mauro Gilardi – Schweizer Golf Professional",
  url: "https://www.maurogilardi.ch/ueber-mich",
  mainEntity: {
    "@id": "https://www.maurogilardi.ch/#mauro-gilardi",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.maurogilardi.ch" },
      { "@type": "ListItem", position: 2, name: "Über mich", item: "https://www.maurogilardi.ch/ueber-mich" },
    ],
  },
};

export const blogIndexMetadata: Metadata = {
  title: "Blog – Tour-Updates vom Schweizer Golf Professional Mauro Gilardi",
  description:
    "Alle Beiträge von Mauro Gilardi direkt von der Tour. Turnierberichte, Vorbereitungsblöcke und Einblicke ins Leben als Schweizer Golf Professional auf der Pro Golf Tour.",
  keywords: [
    "Mauro Gilardi Blog",
    "Golf Blog Schweiz",
    "Golf Pro Tour Updates",
    "Schweizer Golfer Blog",
    "Pro Golf Tour Berichte",
    "Golf Turniere Schweiz",
    "Golf Training Schweiz",
    "SwissPGA Blog",
    "Golf Profi Alltag",
    "Schweizer Golf Talent Blog",
  ],
  alternates: {
    canonical: "https://www.maurogilardi.ch/blog",
  },
  openGraph: {
    title: "Blog – Tour-Updates von Mauro Gilardi, Schweizer Golf Pro",
    description:
      "Turnierberichte, Training und Leben auf der Tour. Direkt vom Schweizer Golf Professional Mauro Gilardi.",
    url: "https://www.maurogilardi.ch/blog",
  },
};

export const blogIndexSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://www.maurogilardi.ch/blog",
  name: "Mauro Gilardi – Golf Pro Blog",
  description:
    "Tour-Updates, Turnierberichte und Training-Einblicke vom Schweizer Golf Professional Mauro Gilardi",
  url: "https://www.maurogilardi.ch/blog",
  inLanguage: "de-CH",
  author: {
    "@id": "https://www.maurogilardi.ch/#mauro-gilardi",
  },
  about: {
    "@type": "Sport",
    name: "Golf",
  },
};

export const erfolgeMetadata: Metadata = {
  title: "Erfolge – Mauro Gilardi, Schweizer Golf Pro auf der Pro Golf Tour",
  description:
    "Alle Turnierergebnisse und Erfolge von Mauro Gilardi auf der Pro Golf Tour. Schweizer Golf Professional und SwissPGA Pro mit internationalen Ergebnissen.",
  keywords: [
    "Mauro Gilardi Erfolge",
    "Mauro Gilardi Turnierergebnisse",
    "Schweizer Golf Pro Ergebnisse",
    "Pro Golf Tour Resultate",
    "Golf Schweiz Ergebnisse",
    "Swiss Golf Pro Resultate",
    "SwissPGA Ergebnisse",
    "Bündner Golfer Resultate",
  ],
  alternates: {
    canonical: "https://www.maurogilardi.ch/erfolge",
  },
  openGraph: {
    title: "Erfolge & Ergebnisse – Mauro Gilardi, Schweizer Golf Pro",
    description:
      "Turnierergebnisse von Mauro Gilardi auf der Pro Golf Tour – Schweizer Golf Professional, SwissPGA Pro.",
    url: "https://www.maurogilardi.ch/erfolge",
  },
};

export const erfolgeSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Turnierergebnisse Mauro Gilardi – Schweizer Golf Professional",
  description: "Ergebnisse und Erfolge von Mauro Gilardi auf der Pro Golf Tour und anderen Turnieren",
  url: "https://www.maurogilardi.ch/erfolge",
  author: {
    "@id": "https://www.maurogilardi.ch/#mauro-gilardi",
  },
};

export const sponsoringMetadataSeo: Metadata = {
  title: "Sponsoring – Mauro Gilardi, Schweizer Golf Professional & SwissPGA Pro",
  description:
    "Werde Sponsor oder Gönner von Mauro Gilardi – Schweizer Golf Professional und SwissPGA Pro. Sichtbarkeit auf internationaler Bühne und direkter Zugang zum Schweizer Golf-Talent.",
  keywords: [
    "Mauro Gilardi Sponsoring",
    "Golf Sponsoring Schweiz",
    "Swiss Golf Talent sponsern",
    "SwissPGA Sponsoring",
    "Golf Profi Schweiz unterstützen",
    "Golf Sponsor Schweiz",
    "Schweizer Golfer sponsern",
    "Golf Gönner Schweiz",
    "Sport Sponsoring Schweiz",
    "Golf Talent fördern Schweiz",
  ],
  alternates: {
    canonical: "https://www.maurogilardi.ch/sponsoring",
  },
  openGraph: {
    title: "Sponsoring – Mauro Gilardi, Schweizer Golf Pro",
    description:
      "Unterstütze Mauro Gilardi – SwissPGA Pro und Mitglied des Swiss Golf Teams. Sponsoring-Möglichkeiten für Unternehmen und Einzelpersonen.",
    url: "https://www.maurogilardi.ch/sponsoring",
  },
};

export const sponsoringSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sponsoring – Mauro Gilardi, Schweizer Golf Professional",
  description: "Sponsoring-Möglichkeiten für Mauro Gilardi, SwissPGA Golf Professional aus der Schweiz",
  url: "https://www.maurogilardi.ch/sponsoring",
  mainEntity: {
    "@id": "https://www.maurogilardi.ch/#mauro-gilardi",
  },
};

export const uebermichFaqMetadata: Metadata = {
  title: "FAQ – Mauro Gilardi, Pro Golf Tour, SwissPGA & Swiss Golf",
  description:
    "Antworten auf häufige Fragen zu Mauro Gilardi: Pro Golf Tour, Challenge Tour, HotelPlanner Tour, SwissPGA, Swiss Golf, Ranking, MG Gönnervereinigung und Golf erklärt.",
  keywords: [
    "Mauro Gilardi FAQ",
    "Pro Golf Tour erklärt",
    "Challenge Tour Golf",
    "HotelPlanner Tour",
    "SwissPGA",
    "Swiss Golf",
    "Schweizer Golf Professional",
    "Gönnervereinigung MG",
    "Golf Schweiz Ranking",
    "Weltranking Golf OWGR",
  ],
  alternates: {
    canonical: "https://www.maurogilardi.ch/ueber-mich/faq",
  },
  openGraph: {
    title: "FAQ – Mauro Gilardi, Touren & Swiss Golf",
    description:
      "Touren, SwissPGA, Swiss Golf, Gönnervereinigung und wo du Rankings sowie Ergebnisse findest — kompakt beantwortet.",
    url: "https://www.maurogilardi.ch/ueber-mich/faq",
    images: [
      {
        url: "/brand-assets/images/1L9A8795.JPG",
        width: 1200,
        height: 630,
        alt: "Mauro Gilardi – Schweizer Golf Professional",
      },
    ],
  },
};
