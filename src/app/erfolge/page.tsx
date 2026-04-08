import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Erfolge | Mauro Gilardi",
  description: "Meilensteine und Entwicklung von Mauro Gilardi im modernen Zeitstrahl.",
};

const timelineEntries: { year: string; title: string; text: string }[] = [
  {
    year: "2022",
    title: "Start als Playing Professional",
    text: "Offizieller Start auf der Pro Golf Tour mit klarem Fokus auf Konstanz und Turnierroutine.",
  },
  {
    year: "2023",
    title: "Wettkampfstruktur aufgebaut",
    text: "Training, Turnierplanung und Performance-Tracking als stabile Basis für die Saisonentwicklung etabliert.",
  },
  {
    year: "2024",
    title: "Plattform & Partnernetzwerk",
    text: "Eigene Marke ausgebaut, Partnerstruktur erweitert und die Kommunikation professionell aufgestellt.",
  },
  {
    year: "2025",
    title: "Leadership & Projekte",
    text: "Mehr Verantwortung neben der Tour übernommen, inklusive Verbandsarbeit und digitaler Sportprojekte.",
  },
  {
    year: "2026",
    title: "Nächster Performance-Schritt",
    text: "Volle Ausrichtung auf die nächsten Tour-Ziele mit Fokus auf Resultate, Sichtbarkeit und langfristigen Aufbau.",
  },
];

export default function ErfolgePage() {
  return (
    <div className="site-page erfolge-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero erfolge-hero">
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
            <h1>Mein bisheriger Weg.</h1>
            <p className="about-hero-lead">
              Entwicklung im Leistungssport, als Unternehmer und in der täglichen Arbeit auf dem Weg zur Spitze.
            </p>
            <div className="about-hero-actions">
              <Link href="/blog" className="about-btn about-btn-primary">
                Zum Blog
              </Link>
              <Link href="/goenner" className="about-btn about-btn-ghost">
                Gönner werden
              </Link>
            </div>
          </div>
        </section>

        <section className="erfolge-timeline-section" aria-labelledby="erfolge-timeline-title">
          <div className="erfolge-timeline-head">
            <p className="erfolge-timeline-kicker">Zeitstrahl</p>
            <h2 id="erfolge-timeline-title">Meilensteine</h2>
            <p className="erfolge-timeline-lead">Vertikaler Zeitstrahl mit klaren Etappen meines bisherigen Wegs.</p>
          </div>

          <div className="erfolge-timeline-progress" aria-hidden>
            <span className="erfolge-timeline-progress-dot" />
          </div>

          <ol className="erfolge-timeline" aria-label="Werdegang als Zeitstrahl">
            {timelineEntries.map((entry) => (
              <li key={entry.year} className="erfolge-timeline-item">
                <article className="erfolge-timeline-card">
                  <p className="erfolge-timeline-year">{entry.year}</p>
                  <h3>{entry.title}</h3>
                  <p>{entry.text}</p>
                </article>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
