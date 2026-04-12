import Image from "next/image";
import Link from "next/link";
import {
  ErfolgeTimeline,
  type ErfolgeTimelineEntry,
  type ErfolgeTimelinePhase,
} from "@/components/erfolge-timeline";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Erfolge | Mauro Gilardi",
  description: "Erfolge und Meilensteine — mein Werdegang im Golf, Jahr für Jahr, aus meiner Sicht.",
};

const phaseLabel: Record<ErfolgeTimelinePhase, string> = {
  Foundation: "Foundation",
  Development: "Development",
  Professional: "Professional",
};

const timelineEntries: ErfolgeTimelineEntry[] = [
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
    title: "Next Level",
    phase: "Professional",
    details: [
      "2. Rang bei einem Pro Golf Tour Event.",
      "Start CAS Elite Sports Management.",
      "Board Member SwissPGA.",
      "Head of Playing Professional Commission.",
    ],
  },
];

/** Neueste Station zuerst, beim Scrollen zurück in die Vergangenheit */
const timelineEntriesDisplay = [...timelineEntries].reverse();

export default function ErfolgePage() {
  return (
    <div className="site-page erfolge-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero erfolge-hero blog-index-hero-unified">
          <Image
            src="/brand-assets/images/pgtwinbig.jpg"
            alt="Mauro Gilardi bei einem Turnier"
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">Erfolge</p>
            <h1>So bin ich bis hierhin gekommen.</h1>
            <p className="about-hero-lead">
              Von den ersten Schlägen bis zur Tour — hier siehst du die Stationen, die für mich zählen.
            </p>
            <div className="about-hero-actions">
              <Link href="/blog" className="about-btn about-btn-primary">
                Zum Blog
              </Link>
              <Link href="/sponsoring" className="about-btn about-btn-ghost">
                Sponsoring
              </Link>
            </div>
          </div>
        </section>

        <section className="erfolge-timeline-section" aria-labelledby="erfolge-timeline-title">
          <div className="erfolge-timeline-head">
            <p className="erfolge-timeline-kicker">Zeitstrahl</p>
            <h2 id="erfolge-timeline-title">Erfolge und Meilensteine</h2>
            <p className="erfolge-timeline-lead">
              Oben steht, was am aktuellsten ist — weiter unten geht’s zurück zu den Anfängen.
            </p>
            <ul className="erfolge-phase-legend" aria-label="Phasen">
              <li>Foundation</li>
              <li>Development</li>
              <li>Professional</li>
            </ul>
          </div>

          <div className="erfolge-timeline-progress" aria-hidden>
            <span className="erfolge-timeline-progress-dot" />
          </div>

          <ErfolgeTimeline entries={timelineEntriesDisplay} phaseLabel={phaseLabel} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
