/**
 * Mini-Quiz für Besucher-Popups (Ich-Perspektive, Mauro Gilardi).
 */
export type EngagementQuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
};

export type EngagementQuizQuestion = {
  id: string;
  question: string;
  options: EngagementQuizOption[];
};

export const engagementQuizQuestions: EngagementQuizQuestion[] = [
  {
    id: "saisonkosten",
    question: "Was schätzt du: Was kostet mich eine komplette Pro-Golf-Saison?",
    options: [
      {
        id: "40k",
        label: "40'000 CHF",
        isCorrect: false,
        feedback:
          "Darunter liegt es bei mir selten — allein Reisen, Hotels, Startgebühren und Training summieren sich schnell.",
      },
      {
        id: "55k",
        label: "55'000 CHF",
        isCorrect: true,
        feedback:
          "Für mich realistisch: Turniere, Reisen, Hotels, Coaching, Equipment — ohne Lebenshaltung wie Krankenkasse oder Miete.",
      },
      {
        id: "70k",
        label: "70'000 CHF",
        isCorrect: false,
        feedback:
          "Kann passieren, wenn ich viele Events spiele und lange unterwegs bin — oft liegt es bei mir aber eher bei rund 55'000 CHF.",
      },
    ],
  },
  {
    id: "turniere-pro-saison",
    question: "Wie viele Turniere spiele ich ungefähr pro Saison?",
    options: [
      {
        id: "8-12",
        label: "8–12",
        isCorrect: false,
        feedback: "Das wäre für mich zu wenig — ich will voll auf der Tour mitspielen.",
      },
      {
        id: "18-25",
        label: "18–25",
        isCorrect: true,
        feedback:
          "So sieht meine Saison aus: viele Events, dazu Training, Reisen und Mental Coaching.",
      },
      {
        id: "35plus",
        label: "35+",
        isCorrect: false,
        feedback: "Das schafft mein Körper nicht — und Budget und Planung setzen auch Grenzen.",
      },
    ],
  },
  {
    id: "einkommen",
    question: "Woher kommt bei mir der grösste Teil des Einkommens?",
    options: [
      {
        id: "preisgeld",
        label: "Preisgeld",
        isCorrect: false,
        feedback: "Preisgeld freut mich — allein reicht es für mich aber selten.",
      },
      {
        id: "sponsoring",
        label: "Sponsoring & Partnerschaften",
        isCorrect: true,
        feedback:
          "Bei mir tragen Sponsoren, Gönner und Partnerschaften den Löwenanteil. Preisgeld ist Bonus und Motivation — und deckt schlussendlich die restlichen Kosten der Golfsaison ab.",
      },
      {
        id: "teaching",
        label: "Teaching / Coaching",
        isCorrect: false,
        feedback: "Mache ich nicht — ich konzentriere mich zurzeit voll auf meine Tour-Karriere.",
      },
    ],
  },
  {
    id: "training",
    question: "Wie viele Stunden trainiere ich pro Woche — inkl. Gym, Putting, Mental?",
    options: [
      {
        id: "15-20",
        label: "15–20 h",
        isCorrect: false,
        feedback: "Für mich wäre das Hobby-Niveau — ich brauche deutlich mehr.",
      },
      {
        id: "30-40",
        label: "30–40 h",
        isCorrect: true,
        feedback:
          "So sieht meine Woche in der Saison aus: Platz, Gym, Analyse, Putting, Reise, Regeneration — Golf ist mein Vollzeitjob.",
      },
      {
        id: "50plus",
        label: "50+ h",
        isCorrect: false,
        feedback:
          "Mehr Quantity bringt mir nichts — Qualität, Erholung und Turnierrhythmus zählen mindestens genauso.",
      },
    ],
  },
  {
    id: "karriere-traumziel",
    question: "Was ist mein grosses Karriereziel?",
    options: [
      {
        id: "olympia",
        label: "Die Schweiz an den Olympischen Spielen vertreten",
        isCorrect: true,
        feedback:
          "Genau das ist mein Traum — die Schweiz auf der grössten Bühne im Golf zu vertreten.",
      },
      {
        id: "hotelplanner",
        label: "Aufstieg in die HotelPlanner Tour",
        isCorrect: false,
        feedback:
          "Das ist mein nächstes Etappenziel — mein grosser Traum geht noch weiter.",
      },
      {
        id: "hole-in-one",
        label: "Ein Hole-in-One",
        isCorrect: false,
        feedback:
          "Unvergesslich — ich hatte ja eins! Für meine Karriere reicht es allein aber nicht.",
      },
    ],
  },
  {
    id: "karriere-naechstes-ziel",
    question: "Worauf fokussiere ich mich als Nächstes?",
    options: [
      {
        id: "hotelplanner",
        label: "Aufstieg in die HotelPlanner Tour",
        isCorrect: true,
        feedback: "Mein nächstes konkretes Ziel — Schritt für Schritt Richtung Top-Tour.",
      },
      {
        id: "olympia",
        label: "Olympische Spiele",
        isCorrect: false,
        feedback:
          "Das bleibt mein grosser Traum — aber der Weg dorthin führt über die nächsten Etappen auf der Tour.",
      },
      {
        id: "q-school",
        label: "Q-School / DP World Tour",
        isCorrect: false,
        feedback:
          "Nicht mein aktueller Fokus — ich gehe meinen Weg über die Pro Golf Tour und HotelPlanner Tour.",
      },
    ],
  },
];

/** Popup-Konfiguration — Werte bei Implementierung anpassen. */
export const engagementQuizConfig = {
  /** Fragen, die nacheinander rotieren (IDs). */
  questionIds: engagementQuizQuestions.map((q) => q.id),
  /** Mindest-Aufenthaltsdauer auf der Seite in Sekunden, bevor ein Popup in Frage kommt. */
  minTimeOnSiteSeconds: 45,
  /** Mindestanzahl besuchter Unterseiten in dieser Session. */
  minSubpageViews: 2,
  /** Maximal ein Popup pro Browser-Session. */
  maxPopupsPerSession: 1,
  /** localStorage-Key für bereits beantwortete Fragen. */
  answeredStorageKey: "mg-engagement-quiz-answered",
  /** localStorage-Key für Session-Zähler. */
  sessionStorageKey: "mg-engagement-quiz-session",
} as const;

export function getEngagementQuizQuestion(id: string): EngagementQuizQuestion | undefined {
  return engagementQuizQuestions.find((q) => q.id === id);
}
