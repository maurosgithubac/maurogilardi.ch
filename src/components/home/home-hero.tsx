import Image from "next/image";
import Link from "next/link";
import { ParallaxMedia, ScrollFadeOut } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Magnetic } from "@/components/motion/magnetic";
import { siteContent } from "@/content/siteContent";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export function HomeHero() {
  return (
    <section className="mg-hero mg-grain" data-theme="dark" aria-label="Start">
      <ParallaxMedia className="mg-hero__media">
        <Image
          src={seoImages.heroPrimary}
          alt={seoImageAlts.heroPrimary}
          fill
          priority
          sizes="100vw"
          className="mg-hero__img"
        />
      </ParallaxMedia>
      <div className="mg-hero__scrim" aria-hidden="true" />

      <ScrollFadeOut className="mg-hero__content mg-container">
        <Reveal y={16} delay={0.05}>
          <Link href="/blog/aufstieg-hotelplanner-tour" className="mg-announce">
            <span className="mg-announce__tag">Neu</span>
            <span>Aufstieg in die HotelPlanner Tour geschafft</span>
            <span className="mg-btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>

        <p className="mg-eyebrow mg-hero__eyebrow">{siteContent.brand.role}</p>
        <SplitText as="h1" text={siteContent.brand.name} className="mg-display mg-hero__title" onMount delay={0.15} stagger={0.09} />

        <div className="mg-hero__foot">
          <Reveal y={20} delay={0.45}>
            <p className="mg-lead mg-hero__lead">
              Schweizer Golf Professional auf dem Weg zur DP World Tour. Hier folgst du mir auf der Tour — und kannst Teil
              davon werden.
            </p>
          </Reveal>
          <Reveal y={20} delay={0.55} className="mg-hero__actions">
            <Magnetic>
              <Link href="/sponsoring" className="mg-btn mg-btn--primary mg-btn--lg">
                Teil meines Teams werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
            </Magnetic>
            <a href="#story" className="mg-btn mg-btn--glass mg-btn--lg">
              Meine Story
            </a>
          </Reveal>
        </div>
      </ScrollFadeOut>

      <a href="#story" className="mg-hero__scroll" aria-label="Weiter nach unten scrollen">
        <span className="mg-hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}
