export const UEBER_MICH_FAQ_CANONICAL = "https://www.maurogilardi.ch/ueber-mich/faq";

export type AboutFaqItem = {
  question: string;
  paragraphs: string[];
};

export type AboutFaqSection = {
  id: string;
  title: string;
  lead?: string;
  items: AboutFaqItem[];
};

/** Texte angelehnt an `siteContent.ts` und die Über-mich-Themen dieser Website — bewusst kurz gefasst. */
export const aboutFaqSections: AboutFaqSection[] = [
  {
    id: "ueber-mich",
    title: "Über Mauro Gilardi",
    lead: "Persönliche Einordnung — inhaltlich konsistent zur Über-mich-Seite.",
    items: [
      {
        question: "Wer bin ich?",
        paragraphs: [
          "Ich bin **Mauro Gilardi**, **SwissPGA Golf Professional**. Wie auf der Startseite: Ich bin Mauro — **Heimat, Bodenständigkeit und Familie sind mein Fundament**; hier auf der Seite **teile ich, was ich unterwegs erlebe**.",
          "Ausführlicher Hintergrund, Projekte und Überzeugungen stehen unter [**Über mich**](/ueber-mich). Aktuelle Tourphasen ergänze ich im [**Blog**](/blog).",
        ],
      },
      {
        question: "Seit wann bist du Profi?",
        paragraphs: [
          "Im Über-mich-Text beschreibe ich den Start so: Ich bin Mauro Gilardi und **professioneller Golfspieler seit 2022**. Mein klares Fernziel formulieren wir dort als **DP World Tour** als Etappe der Karriereplanung.",
          "Historische Stationen sind bei [**Erfolge**](/erfolge) zusammengefasst.",
        ],
      },
      {
        question: "Worauf legst du inhaltlich Wert?",
        paragraphs: [
          "**Strukturiert statt zufällig** — klare Prioritäten, damit sichtbar wird, dass Profisport mehr als nur Talent ist.",
          "**Langfristig statt kurzfristig** — Entscheidungen, die für mich persönlich tragfähiger sind.",
          "**Authentisch statt inszeniert** — ich teile den Weg mit echten Herausforderungen und Alltag als Golf Professional.",
        ],
      },
      {
        question: "Was machst du neben dem Spiel auf der Tour?",
        paragraphs: [
          "Die Website bündelt drei Linien: Ich verbinde **Leistungssport mit Unternehmertum** und arbeite an **digitalen Projekten** (Apps, Webseiten), die Sportler unterstützen oder Prozesse klären können.",
          "Im Verband bin ich als **Head der SwissPGA Players Commission** aktiv — Fokus auf **Spielerwohl, Plattform-Aufbau und Austausch** zwischen Playing Professionals.",
          "Zusätzlich habe ich eine **Gönnerstruktur** mit Events aufgebaut — wer mitmachen möchte, geht über [**Sponsoring & Gönner**](/sponsoring). Konkrete Projektbeispiele sind auf der Über-mich-Seite verlinkt.",
        ],
      },
    ],
  },
  {
    id: "touren-golf",
    title: "Touren & Golf",
    lead: "Spielformate und wo du offizielle Daten nachliest.",
    items: [
      {
        question: "Auf welchen Touren spielst du?",
        paragraphs: [
          "Mein Schwerpunkt liegt auf der **Pro Golf Tour (PGT)**. Je nach Spielplan und Qualifikation können **Challenge-Tour**-Starts dazukommen.",
          "Konkrete Termine und Rückblicke findest du auf der **Startseite** (anstehende Termine) sowie im [**Blog**](/blog).",
        ],
      },
      {
        question: "Was ist die Pro Golf Tour?",
        paragraphs: [
          "Die **Pro Golf Tour** ist eine europäische Profi-Entwicklungstour mit Rundenturnieren und übersichtlichem Kalender.",
          "Offizielle Infos unter [progolftour.de](https://www.progolftour.de).",
        ],
      },
      {
        question: "Was ist die Challenge Tour?",
        paragraphs: [
          "Die **Challenge Tour** ist Teil des European-Tour-Ökosystems und bildet für viele Professionals die **Brückenstufe** Richtung **DP World Tour**.",
          "Infos unter [europeantour.com/challenge-tour/](https://www.europeantour.com/challenge-tour/).",
        ],
      },
      {
        question: "Was ist Golf in Kürze?",
        paragraphs: [
          "Ziel ist, den Ball mit möglichst **wenigen Schlägen** vom Abschlag ins Loch zu spielen — klassisch **18 Loch** pro Runde, mit Par als Referenz.",
          "Auf Profebene dominiert oft **Strokeplay** (Zählen der Schläge über mehrere Runden).",
        ],
      },
      {
        question: "Wo findest du Rankings und Resultate?",
        paragraphs: [
          "**Pro Golf Tour**: Kalender und Order of Merit auf [progolftour.de](https://www.progolftour.de).",
          "**Challenge Tour / DP World Tour**: Daten bei der [European Tour](https://www.europeantour.com/).",
          "**Weltranking**: [Official World Golf Ranking](https://www.owgr.com/).",
          "Persönlich aufbereitet: Zeitstrahl unter [**Erfolge**](/erfolge), aktuelle Gedanken im [**Blog**](/blog).",
        ],
      },
    ],
  },
  {
    id: "verbaende-support",
    title: "Schweizer Golf & Unterstützung",
    lead: "Verbände und wie du Sponsor oder Gönner wirst.",
    items: [
      {
        question: "Was ist Swiss Golf?",
        paragraphs: [
          "**Swiss Golf** ist der Dachverband des Golfsports in der Schweiz — Breitensport, Leistungssport und das **Swiss Golf Team**, dem ich angehöre.",
          "[swissgolf.ch](https://www.swissgolf.ch)",
        ],
      },
      {
        question: "Was ist die SwissPGA?",
        paragraphs: [
          "Die **Swiss PGA** ist der Berufsverband der Golf-Professionals und Lehrkräfte — Ausbildung, Qualität und Austausch im Berufsfeld Golf.",
          "[swisspga.ch](https://www.swisspga.ch)",
        ],
      },
      {
        question: "Was ist die MG Gönnervereinigung?",
        paragraphs: [
          "Die **MG Gönnervereinigung** fasst Mitglieder und Partner zusammen, die meinen Weg als Playing Professional unterstützen — mit strukturierten Stufen und jährlicher Beteiligung wie auf der Sponsoring-Seite beschrieben.",
          "So geht eine Anfrage: [**Sponsoring & Gönner**](/sponsoring).",
        ],
      },
      {
        question: "Wo geht die Reise weiter für mehr Tiefe?",
        paragraphs: [
          "Langform Überblick: [**Über mich**](/ueber-mich)",
          "Chronologie: [**Erfolge**](/erfolge)",
          "Aktuelle Texte aus dem Touralltag: [**Blog**](/blog)",
        ],
      },
    ],
  },
];

export const aboutFaqItemsFlat = aboutFaqSections.flatMap((s) => s.items);

export function parseFaqParagraphToHtml(paragraph: string): string {
  let s = paragraph
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  s = s.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, '<a href="/$2">$1</a>');
  return s;
}

export function plainTextFromParagraph(markdownLike: string): string {
  return markdownLike.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function getAboutFaqPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${UEBER_MICH_FAQ_CANONICAL}#faq`,
    url: UEBER_MICH_FAQ_CANONICAL,
    inLanguage: "de-CH",
    isPartOf: { "@id": "https://www.maurogilardi.ch/#website" },
    about: { "@id": "https://www.maurogilardi.ch/#mauro-gilardi" },
    mainEntity: aboutFaqItemsFlat.map(({ question, paragraphs }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: paragraphs.map((p) => plainTextFromParagraph(p)).join(" "),
      },
    })),
  };
}

export function getUeberMichFaqBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.maurogilardi.ch" },
      { "@type": "ListItem", position: 2, name: "Über mich", item: "https://www.maurogilardi.ch/ueber-mich" },
      { "@type": "ListItem", position: 3, name: "FAQ", item: UEBER_MICH_FAQ_CANONICAL },
    ],
  };
}
