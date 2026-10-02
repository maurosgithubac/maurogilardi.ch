import Image from "next/image";
import Link from "next/link";
import { ParallaxFloat } from "@/components/motion/parallax-media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

const POINTS = [
  "Sichtbarkeit auf Webseite und in meiner Kommunikation — je nach Paket",
  "Golfkliniken, Golfrunden und Anlässe für dein Team",
  "Ein Paket, das wir persönlich auf deine Ziele abstimmen",
];

export function PartnerTeaser() {
  return (
    <section className="mg-section mg-partner-teaser mg-grain" data-theme="dark" aria-labelledby="partner-teaser-title">
      <div className="mg-container mg-partner-teaser__grid">
        <div className="mg-partner-teaser__copy">
          <Reveal>
            <p className="mg-eyebrow">Für Unternehmen</p>
          </Reveal>
          <SplitText as="h2" id="partner-teaser-title" className="mg-h2" text="Sichtbar auf der HotelPlanner Tour." />
          <Reveal delay={0.1}>
            <p className="mg-lead">
              Ich führe meine Karriere wie ein Unternehmen — mit klaren Zielen, Struktur und messbarer Gegenleistung für
              meine Partner. Sponsoring-Pakete ab 2&apos;000 CHF pro Jahr.
            </p>
          </Reveal>
          <Stagger as="ul" className="mg-check-list">
            {POINTS.map((p) => (
              <StaggerItem as="li" key={p}>
                {p}
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mg-partner-teaser__actions">
            <Link href="/partner" className="mg-btn mg-btn--primary mg-btn--lg">
              Partnerschaft entdecken <span className="mg-btn__arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
        <ParallaxFloat className="mg-partner-teaser__media" distance={50}>
          <Image src={seoImages.golfTeam} alt={seoImageAlts.golfTeam} fill sizes="(max-width: 960px) 90vw, 40vw" className="mg-cover" />
        </ParallaxFloat>
      </div>
    </section>
  );
}
