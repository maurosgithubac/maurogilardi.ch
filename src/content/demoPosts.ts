export type DemoPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  image_path: string;
  created_at: string;
};

export const demoPosts: DemoPost[] = [
  {
    id: "demo-1",
    slug: "saisonstart-training-setup",
    title: "Saisonstart: Mein Training und Setup",
    description:
      "Wie ich meine Woche strukturiere, welche Prioritaeten ich im Spiel setze und worauf ich im Saisonstart den Fokus lege.",
    body:
      "Der Start in eine neue Saison beginnt fuer mich nicht erst am ersten Turnier. Er beginnt mit klaren Routinen, konsequentem Training und messbaren Zielen.\n\nIm aktuellen Block liegt der Fokus auf Konstanz vom Tee, einem stabilen Wedge-Spiel und klaren Entscheidungsprozessen unter Druck. Ich arbeite dabei mit festen Wochenzyklen aus Technik, Athletik und Regeneration.\n\nDiese Struktur hilft mir, Leistung reproduzierbar zu machen und mit Vertrauen in die Turnierphase zu gehen.",
    image_path: "/brand-assets/images/1L9A8968.JPG",
    created_at: "2026-03-12T09:00:00.000Z",
  },
  {
    id: "demo-2",
    slug: "turnierwoche-routine-und-fokus",
    title: "Turnierwoche: Routine und Fokus",
    description:
      "Einblick in meine Abläufe vor und waehrend eines Turniers - von der Vorbereitung bis zur Analyse nach der Runde.",
    body:
      "In einer Turnierwoche entscheidet oft nicht nur die Form, sondern vor allem die Qualitaet der Prozesse. Ich plane jede Woche mit klaren Zeitfenstern: Platzstrategie, kurze Sessionen auf der Range und mentale Vorbereitung.\n\nAm Turniertag halte ich die Routine bewusst einfach. Wenige, klare Cues statt zu vieler technischer Gedanken. Nach der Runde folgt eine kurze Analyse: Was hat funktioniert, was wird am naechsten Tag angepasst.\n\nSo bleibt der Fokus dort, wo er hingehoert: auf Umsetzung unter Wettkampfbedingungen.",
    image_path: "/brand-assets/images/1L9A9440.JPG",
    created_at: "2026-02-27T11:30:00.000Z",
  },
  {
    id: "demo-3",
    slug: "zwischenbilanz-ziele-und-naechste-schritte",
    title: "Zwischenbilanz: Ziele und naechste Schritte",
    description:
      "Wo ich aktuell stehe, welche Learnings ich mitnehme und wie ich die naechste Phase strategisch aufbaue.",
    body:
      "Nach den ersten Events ziehe ich bewusst Zwischenbilanz: Ergebnisse, Scoring-Muster und Stabilitaet in den Schluesselmomenten. Diese Auswertung ist die Basis fuer die naechsten Entscheidungen.\n\nIch setze weiterhin auf langfristige Entwicklung statt kurzfristige Reaktionen. Das bedeutet: Prozesse verbessern, Stärken ausbauen und im richtigen Moment mutig spielen.\n\nMein Ziel bleibt klar: Schritt fuer Schritt Richtung naechstes Level - sportlich und unternehmerisch.",
    image_path: "/brand-assets/images/1L9A9625.JPG",
    created_at: "2026-02-10T08:15:00.000Z",
  },
];

export function findDemoPostBySlug(slug: string): DemoPost | null {
  return demoPosts.find((post) => post.slug === slug) ?? null;
}
