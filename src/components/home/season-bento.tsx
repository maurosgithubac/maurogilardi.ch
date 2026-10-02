import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { CountUp } from "@/components/motion/count-up";
import { NewsletterForm } from "@/components/newsletter-form";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { careerStats } from "@/content/career";
import type { PgtSeasonEvent } from "@/content/pgtSeasonEvents";
import { PRO_GOLF_TOUR_LIVESCORING_URL } from "@/content/pgtSeasonEvents";
import type { HomePost } from "@/components/home/types";

const dateFmt = new Intl.DateTimeFormat("de-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

type Props = {
  events: PgtSeasonEvent[];
  latestPost: HomePost | null;
};

/** Bento-Raster: Termine, neuester Beitrag, Newsletter, Saisonbudget */
export function SeasonBento({ events, latestPost }: Props) {
  return (
    <section id="termine" className="mg-section mg-bento-section" aria-labelledby="bento-title">
      <div className="mg-container">
        <header className="mg-section-head">
          <Reveal>
            <p className="mg-eyebrow">Auf Tour</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="bento-title" className="mg-h2">
              Mittendrin statt nur dabei.
            </h2>
          </Reveal>
        </header>

        <Stagger className="mg-bento" stagger={0.08}>
          <StaggerItem className="mg-bento__cell mg-bento__cell--events">
            <article className="mg-card mg-bento__card" aria-labelledby="bento-events-title">
              <div className="mg-bento__head">
                <h3 id="bento-events-title" className="mg-h3">
                  Nächste Turniere
                </h3>
                <a href={PRO_GOLF_TOUR_LIVESCORING_URL} target="_blank" rel="noopener noreferrer" className="mg-chip">
                  <span className="mg-live-dot" aria-hidden="true" /> Livescoring
                </a>
              </div>
              <UpcomingEvents events={events} />
              <p className="mg-bento__note">Termine können sich ändern — es gilt die offizielle Ausschreibung.</p>
            </article>
          </StaggerItem>

          <StaggerItem className="mg-bento__cell mg-bento__cell--post">
            {latestPost ? (
              <TiltCard className="mg-bento__tilt">
                <Link href={`/blog/${latestPost.slug}`} className="mg-card mg-bento__card mg-bento__post">
                  {latestPost.image_url ? (
                    <Image
                      src={latestPost.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 960px) 100vw, 40vw"
                      className="mg-cover mg-bento__post-img"
                    />
                  ) : null}
                  <div className="mg-bento__post-scrim" aria-hidden="true" />
                  <div className="mg-bento__post-body" data-theme="dark">
                    <span className="mg-chip mg-chip--glass">Neuster Beitrag</span>
                    <time dateTime={latestPost.created_at} className="mg-bento__post-date">
                      {dateFmt.format(new Date(latestPost.created_at))}
                    </time>
                    <h3 className="mg-h3">{latestPost.title}</h3>
                    <span className="mg-bento__post-more">
                      Lesen <span className="mg-btn__arrow" aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            ) : null}
          </StaggerItem>

          <StaggerItem className="mg-bento__cell mg-bento__cell--newsletter">
            <article id="newsletter" className="mg-card mg-bento__card mg-bento__newsletter mg-grain" aria-labelledby="bento-nl-title">
              <p className="mg-eyebrow mg-bento__nl-eyebrow">Newsletter</p>
              <h3 id="bento-nl-title" className="mg-h3">
                Updates direkt von der Tour — ehrlich, ab und zu, nie Spam.
              </h3>
              <NewsletterForm tone="light" />
            </article>
          </StaggerItem>

          <StaggerItem className="mg-bento__cell mg-bento__cell--budget">
            <article className="mg-card mg-bento__card mg-bento__budget" aria-labelledby="bento-budget-title">
              <p className="mg-eyebrow">Transparenz</p>
              <h3 id="bento-budget-title" className="mg-bento__budget-title">
                Eine Saison kostet mich rund{" "}
                <span className="mg-bento__budget-figure mg-mono">
                  <CountUp to={careerStats.seasonBudgetChf} duration={1.8} /> CHF
                </span>
              </h3>
              <p className="mg-body">
                Reisen, Startgelder, Training und Coaching — getragen von Sponsoren, Gönnern und Partnern. Preisgeld ist
                Bonus und Motivation.
              </p>
              <a href="#unterstuetzen" className="mg-link-arrow">
                So kannst du helfen <span className="mg-btn__arrow" aria-hidden="true">↓</span>
              </a>
            </article>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
