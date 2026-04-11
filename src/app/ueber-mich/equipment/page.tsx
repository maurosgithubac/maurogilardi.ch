import Link from "next/link";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import {
  equipmentGroups,
  equipmentPageIntro,
  equipmentPartnerCallouts,
} from "@/content/equipment";

export const metadata = {
  title: "Equipment | Mauro Gilardi",
  description: "Was im Bag ist: Schläger, Schäfte und Partner Titleist & TheGolfers.",
};

export default function UeberMichEquipmentPage() {
  const { titleist, theGolfers } = equipmentPartnerCallouts;

  return (
    <AboutSubpageShell
      label="Über mich"
      title="Equipment"
      lead="Setup aus dem Fitting — Schläger und Schäfte, die zu meinem Schwung und den Tour-Bedingungen passen."
      heroSrc="/brand-assets/images/1L9A9440.JPG"
      heroAlt="Mauro Gilardi im Turnier"
    >
      <section className="about-equipment-page" aria-label="Equipment im Bag">
        <div className="about-equipment-page-inner">
          <p className="about-equipment-intro">{equipmentPageIntro}</p>

          <div className="about-equipment-partners">
            <article className="about-equipment-partner-card">
              <h2 className="about-equipment-partner-name">{titleist.name}</h2>
              <p className="about-equipment-partner-text">{titleist.tagline}</p>
              <a
                href={titleist.href}
                className="about-btn about-btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {titleist.cta}
              </a>
            </article>
            <article className="about-equipment-partner-card about-equipment-partner-card--accent">
              <h2 className="about-equipment-partner-name">{theGolfers.name}</h2>
              <p className="about-equipment-partner-text">{theGolfers.tagline}</p>
              <a
                href={theGolfers.href}
                className="about-btn about-btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                {theGolfers.cta}
              </a>
            </article>
          </div>

          {equipmentGroups.map((group, i) => (
            <section key={group.title} className="about-equipment-group" aria-labelledby={`eq-g-${i}`}>
              <h2 id={`eq-g-${i}`} className="about-equipment-group-title">
                {group.title}
              </h2>
              {group.intro ? <p className="about-equipment-group-intro">{group.intro}</p> : null}
              <ul className="about-equipment-club-list">
                {group.clubs.map((club) => (
                  <li key={club.name} className="about-equipment-club-card">
                    <h3 className="about-equipment-club-name">{club.name}</h3>
                    {club.model ? (
                      <p className="about-equipment-club-row">
                        <span className="about-equipment-club-label">Modell</span>
                        <span>{club.model}</span>
                      </p>
                    ) : null}
                    {club.shaft ? (
                      <p className="about-equipment-club-row">
                        <span className="about-equipment-club-label">Schaft</span>
                        <span>{club.shaft}</span>
                      </p>
                    ) : null}
                    {club.notes ? <p className="about-equipment-club-notes">{club.notes}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="about-equipment-footnote">
            Specs können sich mit Saison und Testing leicht ändern — Stand wie veröffentlicht.{" "}
            <Link href="/ueber-mich/sponsoren">Zu den Partnern</Link>
          </p>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
