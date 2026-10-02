import Link from "next/link";
import { ErfolgeTimeline } from "@/components/erfolge-timeline";
import { PageHero } from "@/components/page-hero";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SupportStickyBar } from "@/components/support-sticky-bar";
import { SiteHeader } from "@/components/site-header";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { careerStats, careerTimelineNewestFirst } from "@/content/career";
import { erfolgeMetadata, erfolgeSchema } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export const metadata = erfolgeMetadata;

export default function ErfolgePage() {
  return (
    <div className="mg-page site-page erfolge-page">
      <SeoPageJsonLd schema={erfolgeSchema} />
      <SiteHeader variant="overlay" />

      <main id="inhalt">
        <PageHero
          eyebrow="Erfolge"
          title="So bin ich bis hierhin gekommen."
          lead="Von den ersten Schlägen 2005 bis zum Aufstieg in die HotelPlanner Tour — die Stationen, die für mich zählen."
          image={seoImages.progolfTour}
          imageAlt={seoImageAlts.progolfTour}
          actions={
            <>
              <Link href="/blog/aufstieg-hotelplanner-tour" className="mg-btn mg-btn--primary">
                Aufstieg 2026 <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/sponsoring" className="mg-btn mg-btn--glass">
                Gönner werden
              </Link>
            </>
          }
        />

        <section className="mg-proof" aria-label="Kennzahlen">
          <Stagger as="ul" className="mg-proof__stats mg-container">
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={careerStats.pgtWins} />
              </span>
              <span className="mg-stat__label">Siege auf der Pro Golf Tour</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={careerStats.pgtRankingCurrent} suffix="." />
              </span>
              <span className="mg-stat__label">Rang Pro Golf Tour {careerStats.pgtRankingYear}</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={new Date().getFullYear() - 2005} />
              </span>
              <span className="mg-stat__label">Jahre Golf</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">{careerStats.proSince}</span>
              <span className="mg-stat__label">Playing Professional seit</span>
            </StaggerItem>
          </Stagger>
        </section>

        <section className="mg-section" aria-labelledby="erfolge-timeline-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split">
              <div>
                <Reveal>
                  <p className="mg-eyebrow">Zeitstrahl</p>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 id="erfolge-timeline-title" className="mg-h2">
                    Erfolge und Meilensteine.
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="mg-lead">Oben das Aktuellste — weiter unten geht es zurück zu den Anfängen.</p>
                <ul className="mg-phase-legend" aria-label="Phasen">
                  <li data-phase="Professional">Professional</li>
                  <li data-phase="Development">Development</li>
                  <li data-phase="Foundation">Foundation</li>
                </ul>
              </Reveal>
            </header>

            <ErfolgeTimeline entries={careerTimelineNewestFirst} />
          </div>
        </section>
      </main>

      <SiteFooter />
      <SupportStickyBar />
    </div>
  );
}
