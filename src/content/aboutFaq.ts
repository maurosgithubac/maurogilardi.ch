export const UEBER_MICH_FAQ_CANONICAL = "https://www.maurogilardi.ch/ueber-mich/faq";

export type AboutFaqItem = {
  question: string;
  /** Absätze für die Seite — für JSON-LD werden sie zu einem Fließtext verbunden */
  paragraphs: string[];
};

export const aboutFaqItems: AboutFaqItem[] = [
  {
    question: "Auf welchen Touren spielst du?",
    paragraphs: [
      "Ich bin als Schweizer Golf Professional vor allem auf der **Pro Golf Tour (PGT)** unterwegs — das ist ein fester Teil meines Wettkampfkalenders.",
      "Ergänzend kann es je nach Spielplan und Qualifikation auch Starts auf der **Challenge Tour** (Nachwuchsebene der DP World Tour) sowie auf der **HotelPlanner Tour** geben.",
      "Die konkreten Turniere und Daten findest du jeweils auf meiner Homepage unter den kommenden Terminen und im Blog — dort dokumentiere ich, wo ich aktuell spiele.",
    ],
  },
  {
    question: "Was ist die Pro Golf Tour?",
    paragraphs: [
      "Die **Pro Golf Tour** (PGT) ist eine europäische Entwicklungstour für Professionals. Sie bietet wettbewerbsnahe Rundenturniere unter Bedingungen, die oft an die höheren Touren angelehnt sind — ideal, um Ranking, Routine und Wettkampfmentalität weiterzuentwickeln.",
      "Infos, Kalender und Ergebnisse: [progolftour.de](https://www.progolftour.de).",
    ],
  },
  {
    question: "Was ist die Challenge Tour?",
    paragraphs: [
      "Die **Challenge Tour** gilt als wichtiges Sprungbrecht zur **DP World Tour**. Sie richtet sich an Spielerinnen und Spieler, die bereits auf sehr hohem Niveau turniererfahren sind und dort über Ergebnisse und Punkte ihre nächsten Schritte im Profisport anstreben.",
      "Überblicke und Daten findest du auf der offiziellen Tour-Website unter [European Tour Challenge Tour](https://www.europeantour.com/challenge-tour/).",
    ],
  },
  {
    question: "Was ist die HotelPlanner Tour?",
    paragraphs: [
      "Die **HotelPlanner Tour** ist ein Turnierkalender auf Entwicklungsebene, der mit professionellen Challenger- oder Regional-Formats vergleichbar ist und mir zusätzliche Wettkampfpraxis im Jahresablauf ermöglichen kann.",
      "Ob und wann ich dort starte, hängt von Einladungen, Vergabe der Startplätze und meinem Turnierprogramm ab — Aktuelles beschreibe ich im Blog oder auf den Ergebnis-Services der jeweiligen Tour.",
    ],
  },
  {
    question: "Was ist die SwissPGA?",
    paragraphs: [
      "Die **SwissPGA** (*Swiss Professional Golfers‘ Association*) ist der Verband der Golf-Lehrkräfte und Golf-Professionals in der Schweiz. Sie fördert Ausbildung, Qualitätsstandards und den beruflichen Austausch zwischen Playing Professionals und Club-Professionals.",
      "Mehr dazu unter [swisspga.ch](https://www.swisspga.ch/).",
    ],
  },
  {
    question: "Was ist Swiss Golf?",
    paragraphs: [
      "**Swiss Golf** ist der Dachverband für den Schweizer Golfsport. Der Verband kümmert sich unter anderem um Breitensport, Leistungssport, Regeln sowie das **Swiss Golf Team**, dem auch ich angehöre.",
      "Weitere Informationen auf [swissgolf.ch](https://www.swissgolf.ch).",
    ],
  },
  {
    question: "Was ist Golf – ganz kurz erklärt?",
    paragraphs: [
      "Golf ist eine Sportart, bei der es darum geht, einen Ball mit möglichst wenigen Schlügen vom Abschlag ins Loch zu bringen — meist über 18 Löcher ( eine Runde) auf Platz mit Hindernissen wie Bunkern und Gewässern.",
      "Professioneller Wettkampf findet häufig als **Strokeplay** statt (Zählweise Schläge pro Runde über mehrere Spieltage), teilweise auch in anderen Formaten wie **Matchplay**.",
    ],
  },
  {
    question: "Was ist die MG Gönnervereinigung?",
    paragraphs: [
      "Die **MG Gönnervereinigung** bündelt Menschen und Partner, die meine Laufbahn als Playing Professional aktiv unterstützen — etwa durch Mitgliedschaften unterscheidlicher Stufen oder durch Sponsoring ab einem jährlichen Mindestbetrag.",
      "Wer Mitglied oder Sponsor werden möchte, kann sich direkt auf der Seite [**Sponsoring & Gönner**](/sponsoring) melden.",
    ],
  },
  {
    question: "Wo findest du aktuelle Rankings und meine Turnierergebnisse?",
    paragraphs: [
      "**Pro Golf Tour:** Auf der Website der Tour findest du Order of Merit, Kalender und Resultate unter [progolftour.de](https://www.progolftour.de).",
      "**Challenge Tour & DP World Tour:** Ranking und Daten liegen bei der European Tour unter [europeantour.com](https://www.europeantour.com).",
      "**World Ranking:** Für den Überblick im Weltranking dient das offizielle **Official World Golf Ranking** unter [OWGR](https://www.owgr.com/).",
      "Auf dieser Website zusätzlich einen persönlichen Einblick unter [**Erfolge**](/erfolge) und aktuelle Texte unter [**Blog**](/blog).",
    ],
  },
  {
    question: "Wo erfährst du mehr über Mauro Gilardi?",
    paragraphs: [
      "Einen Überblick über meinen Weg, meine Arbeit neben der Tour und meine Überzeugungen gibt es auf [**Über mich**](/ueber-mich).",
      "Ausführlicher ist die Zeitleiste unter [**Erfolge**](/erfolge); für sehr aktuelle Gedanken und Turnierphasen empfehle ich den [**Blog**](/blog).",
    ],
  },
];

/** Einfacher Markdown-Light: nur **bold** → <strong>; Links [text](url) → <a>; Rest als Text nach Split gefährlich — wir escapen & nutzen kleine Replacements */
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

export function plainTextFromParagraph(htmlLike: string): string {
  return htmlLike.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/** Schema.org FAQPage für JSON-LD */
export function getAboutFaqPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${UEBER_MICH_FAQ_CANONICAL}#faq`,
    url: UEBER_MICH_FAQ_CANONICAL,
    inLanguage: "de-CH",
    isPartOf: { "@id": "https://www.maurogilardi.ch/#website" },
    about: { "@id": "https://www.maurogilardi.ch/#mauro-gilardi" },
    mainEntity: aboutFaqItems.map(({ question, paragraphs }) => ({
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
