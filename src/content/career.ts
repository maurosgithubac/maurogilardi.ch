/**
 * Karriere-Daten — eine Quelle für Erfolge-Seite, Startseite (Kennzahlen, Highlights) und Partner-Seite.
 * Neue Erfolge hier eintragen; alle Seiten aktualisieren sich automatisch.
 */
import { goennervereinigungMemberNames } from "@/content/goennervereinigungMembers";

export type CareerPhase = "Foundation" | "Development" | "Professional";

export type CareerEntry = {
  year: string;
  title: string;
  phase: CareerPhase;
  details: string[];
};

export const careerPhaseLabel: Record<CareerPhase, string> = {
  Foundation: "Foundation",
  Development: "Development",
  Professional: "Professional",
};

/** Chronologisch (älteste zuerst) */
export const careerTimeline: CareerEntry[] = [
  {
    year: "1999",
    title: "Geburt & sportliche Prägung",
    phase: "Foundation",
    details: [
      "Geburt und frühe Bewegungsförderung durch Familie.",
      "Tennis als frühe koordinative Grundlage.",
      "Hauptsportarten: Unihockey und Eishockey.",
    ],
  },
  {
    year: "2005",
    title: "Einstieg in den Golfsport",
    phase: "Foundation",
    details: [
      "Beginn mit Golf und erste Turniererfahrung.",
      "Starts auf U14-Level.",
      "Golf entwickelt sich schrittweise zum Hauptfokus.",
    ],
  },
  {
    year: "2012",
    title: "Erste internationale Erfahrung",
    phase: "Development",
    details: [
      "Erste internationale Turniererfahrung in Holland.",
      "Klare Entscheidung für Golf als Primärsport.",
      "Reduktion anderer Sportarten zugunsten gezielter Entwicklung.",
    ],
  },
  {
    year: "2016 / 2018",
    title: "Datenbasierter Trainingsansatz",
    phase: "Development",
    details: [
      "Einstieg in 3D-Schwunganalyse, unter anderem mit Dr. Rob Neal.",
      "Systematische Performance-Arbeit mit messbaren Parametern.",
    ],
  },
  {
    year: "2017",
    title: "Sieg Engadin International Amateur Championship",
    phase: "Development",
    details: ["Turniersieg auf Amateur-Spitzenniveau.", "Eintritt ins World Amateur Golf Ranking (WAGR)."],
  },
  {
    year: "2020",
    title: "Team-Erfolg auf europäischer Bühne",
    phase: "Development",
    details: [
      "Bronzemedaille bei der Team-Europameisterschaft.",
      "Wichtiger Beitrag zum Schweizer Teamerfolg.",
      "Sieg bei den Österreichischen Internationalen Meisterschaften als erster grosser internationaler Titel.",
    ],
  },
  {
    year: "2021",
    title: "Nationale Spitzenförderung",
    phase: "Development",
    details: [
      "Erneute Teilnahme an der Team-Europameisterschaft.",
      "Teil der ersten Spitzensport-RS in Magglingen.",
    ],
  },
  {
    year: "2022",
    title: "Übergang zum Professional Golfer",
    phase: "Development",
    details: ["Wechsel vom Amateur- ins Profigolf."],
  },
  {
    year: "2023",
    title: "Einstieg ins Pro-Level",
    phase: "Professional",
    details: [
      "Erste Saison als Playing Professional.",
      "Teilzeitstelle bei Würth ITensis parallel zum Tourbetrieb.",
      "Starts auf Pro Golf Tour und Challenge Tour.",
      "Erster geschaffter Cut auf der Challenge Tour.",
    ],
  },
  {
    year: "2024",
    title: "Etablierung im Tour-Alltag",
    phase: "Professional",
    details: [
      "Erste volle Saison auf der Pro Golf Tour.",
      "8 Starts auf der Challenge Tour mit 4 geschafften Cuts.",
      "50. Rang im Pro Golf Tour Ranking bei rund zwei Dritteln der Turniere.",
      "Deutliche Leistungssteigerung.",
      "August 2024: Kündigung des Jobs und 100% Fokus auf Golf.",
    ],
  },
  {
    year: "2025",
    title: "Breakthrough Season",
    phase: "Professional",
    details: [
      "Erste Saison als Vollzeit-Profi.",
      "1. Sieg auf der Pro Golf Tour.",
      "Sieben Top-15-Resultate auf der Pro Golf Tour.",
      "Swiss Golf Open Champion.",
      "17. Rang bei einem Challenge-Tour-Event (Swiss Challenge).",
      "13. Rang im Jahresranking der Pro Golf Tour.",
    ],
  },
  {
    year: "2026",
    title: "Aufstieg in die HotelPlanner Tour",
    phase: "Professional",
    details: [
      "Aufstieg in die HotelPlanner Tour als 4. des Pro Golf Tour Rankings.",
      "Playoff-Sieg auf der Pro Golf Tour in den Niederlanden.",
      "2. Rang bei einem Pro Golf Tour Event.",
      "Start CAS Elite Sports Management.",
      "Board Member SwissPGA und Head of Playing Professional Commission.",
    ],
  },
];

/** Neueste Station zuerst */
export const careerTimelineNewestFirst = [...careerTimeline].reverse();

/** Kennzahlen für Startseite und Partner-Seite */
export const careerStats = {
  proSince: 2022,
  pgtWins: 2,
  pgtRankingCurrent: 4,
  pgtRankingYear: 2026,
  supporters: goennervereinigungMemberNames.filter((n) => n.trim()).length,
  seasonBudgetChf: 55000,
};

/** Die vier stärksten Momente — Startseite "Meilensteine" */
export const careerHighlights: { year: string; title: string; text: string; href?: string }[] = [
  {
    year: "2026",
    title: "Aufstieg in die HotelPlanner Tour",
    text: "Rang 4 im Pro Golf Tour Ranking — ab nächster Saison eine Stufe unter der DP World Tour.",
    href: "/blog/aufstieg-hotelplanner-tour",
  },
  {
    year: "2026",
    title: "Playoff-Sieg in den Niederlanden",
    text: "Finalrunde nach Gewitter, Extra-Loch und der zweite Sieg auf der Pro Golf Tour.",
    href: "/blog/sieg-in-den-niederlanden",
  },
  {
    year: "2025",
    title: "Swiss Golf Open Champion",
    text: "Breakthrough Season: erster Pro-Golf-Tour-Sieg und sieben Top-15-Resultate.",
  },
  {
    year: "2020",
    title: "Bronze an der Team-EM",
    text: "Mit dem Schweizer Team aufs Podest — und Sieg an den Österreichischen Internationalen Meisterschaften.",
  },
];
