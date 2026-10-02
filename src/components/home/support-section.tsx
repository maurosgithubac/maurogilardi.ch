import Link from "next/link";
import { SupporterWall } from "@/components/goenner/supporter-wall";
import { TierGrid } from "@/components/goenner/tier-grid";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { TWINT_PAYLINK_URL } from "@/lib/twint";

export function SupportSection() {
  return (
    <section id="unterstuetzen" className="mg-section mg-support" aria-labelledby="support-title">
      <div className="mg-container">
        <header className="mg-section-head mg-section-head--split">
          <div>
            <Reveal>
              <p className="mg-eyebrow">Unterstützen</p>
            </Reveal>
            <SplitText as="h2" id="support-title" className="mg-h2" text="Werde Teil meines Teams." />
          </div>
          <Reveal delay={0.1}>
            <p className="mg-lead">
              Ob 100 Franken im Jahr oder eine Golfrunde mit mir als Albatros-Member: Jede Unterstützung macht die nächste
              Saison möglich.
            </p>
          </Reveal>
        </header>

        <TierGrid />

        <Reveal className="mg-support__twint">
          <div>
            <p className="mg-support__twint-title">Lieber spontan?</p>
            <p className="mg-body">Mit TWINT einen freien Betrag schicken — dauert zehn Sekunden.</p>
          </div>
          <div className="mg-support__twint-actions">
            <a href={TWINT_PAYLINK_URL} target="_blank" rel="noopener noreferrer" className="mg-btn mg-btn--dark">
              Mit TWINT unterstützen <span aria-hidden="true">↗</span>
            </a>
            <Link href="/partner" className="mg-link-arrow">
              Als Unternehmen? <span className="mg-btn__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </div>

      <SupporterWall />
    </section>
  );
}
