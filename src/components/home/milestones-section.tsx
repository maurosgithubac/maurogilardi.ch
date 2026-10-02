import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { careerHighlights } from "@/content/career";

export function MilestonesSection() {
  return (
    <section className="mg-section mg-milestones mg-grain" data-theme="dark" aria-labelledby="milestones-title">
      <div className="mg-glow mg-milestones__glow" aria-hidden="true" />
      <div className="mg-container">
        <header className="mg-section-head mg-section-head--split">
          <div>
            <Reveal>
              <p className="mg-eyebrow">Erfolge</p>
            </Reveal>
            <SplitText as="h2" id="milestones-title" className="mg-h2" text="Vom Amateur zum Tour-Profi." />
          </div>
          <Reveal delay={0.1}>
            <p className="mg-lead">
              Ein paar Stationen, die zählen. Den ganzen Weg seit dem ersten Abschlag 2005 findest du im Zeitstrahl.
            </p>
          </Reveal>
        </header>

        <Stagger as="ol" className="mg-milestones__grid" stagger={0.1}>
          {careerHighlights.map((m, i) => {
            const inner = (
              <>
                <span className="mg-milestone__year mg-mono">{m.year}</span>
                <h3 className="mg-milestone__title">{m.title}</h3>
                <p className="mg-milestone__text">{m.text}</p>
                {m.href ? (
                  <span className="mg-milestone__more">
                    Zum Beitrag <span className="mg-btn__arrow" aria-hidden="true">→</span>
                  </span>
                ) : null}
              </>
            );
            return (
              <StaggerItem as="li" key={m.title} className={`mg-milestones__cell${i === 0 ? " mg-milestones__cell--feature" : ""}`}>
                <TiltCard className="mg-milestone">
                  {m.href ? (
                    <Link href={m.href} className="mg-milestone__link">
                      {inner}
                    </Link>
                  ) : (
                    <div className="mg-milestone__link">{inner}</div>
                  )}
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mg-milestones__cta">
          <Link href="/erfolge" className="mg-btn mg-btn--light">
            Alle Meilensteine <span className="mg-btn__arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
