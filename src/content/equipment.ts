/**
 * Bag-Setup — Modelle/Schäfte bitte mit Titleist/Fitter abstimmen und hier pflegen.
 * Externe Links: nur mit Partner-Absprache.
 */

export type EquipmentClub = {
  name: string;
  /** z. B. Titleist Vokey SM10 … */
  model?: string;
  shaft?: string;
  notes?: string;
};

export type EquipmentGroup = {
  title: string;
  intro?: string;
  clubs: EquipmentClub[];
};

export const equipmentGroups: EquipmentGroup[] = [
  {
    title: "Wedges",
    intro: "Scoring-Zone — Bounce und Grind sind auf die Untergründe und meinen Schwung abgestimmt.",
    clubs: [
      { name: "58° Wedge", model: "Titleist Vokey Design", shaft: "Steel / Wedge-Flex — Details mit Fitter", notes: "" },
      { name: "54° Wedge", model: "Titleist Vokey Design", shaft: "Steel / Wedge-Flex — Details mit Fitter", notes: "" },
      { name: "50° Wedge", model: "Titleist Vokey Design", shaft: "Steel / Wedge-Flex — Details mit Fitter", notes: "" },
      { name: "Pitching Wedge (PW)", model: "im Eisen-Set integriert", shaft: "wie Set", notes: "" },
    ],
  },
  {
    title: "Eisen",
    intro: "Lückenlose Abstufung vom kurzen bis langen Eisen.",
    clubs: [
      { name: "Eisen 9 · 8 · 7 · 6 · 5 · 4 · 3 · 2", model: "Titleist (Modellserie im Fitting festgelegt)", shaft: "Steel / Graphite — Specs vom Fitting", notes: "Gapping und Längen mit TheGolfers abgestimmt." },
    ],
  },
  {
    title: "Holz & Hybrid",
    intro: "Tee, zweiter Schlag ins Par-5 und lange Par-4.",
    clubs: [
      { name: "Rescue / Hybrid", model: "Titleist", shaft: "Driver-/Wood-Schaftfamilie — Details vom Fitting", notes: "" },
      { name: "Holz 3", model: "Titleist", shaft: "", notes: "" },
      { name: "Driver", model: "Titleist", shaft: "Länge, Flex und Gewicht — nach Fitting", notes: "" },
    ],
  },
];

export const equipmentPartnerCallouts = {
  titleist: {
    name: "Titleist",
    tagline: "Ball, Schläger, Wedge — eine Marke, die auf Tour-Validierung setzt.",
    href: "https://www.titleist.com",
    cta: "Zu Titleist",
  },
  theGolfers: {
    name: "TheGolfers",
    tagline: "Mein Partner für Fitting, Schaft- und Kopf-Kombinationen — damit die Specs zur Bewegung passen.",
    href: "https://www.thegolfers.ch",
    cta: "Zu TheGolfers",
  },
} as const;

export const equipmentPageIntro =
  "Was im Bag liegt, ist das Ergebnis von Testing und Fitting — nicht von Marketing. Unten findest du mein Setup in der Übersicht; konkrete Schaft- und Kopfspezifikationen kann ich auf Anfrage gerne präzisieren.";
