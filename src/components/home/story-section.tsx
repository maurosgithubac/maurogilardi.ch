import Image from "next/image";
import Link from "next/link";
import { ParallaxFloat } from "@/components/motion/parallax-media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ScrollFillText } from "@/components/motion/scroll-fill-text";
import { siteContent } from "@/content/siteContent";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export function StorySection() {
  return (
    <section id="story" className="mg-section mg-story" aria-labelledby="story-title">
      <div className="mg-container mg-story__grid">
        <div className="mg-story__aside">
          <div className="mg-story__sticky">
            <Reveal>
              <p className="mg-eyebrow">Meine Story</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="story-title" className="mg-h2">
                Karriere wie ein <span className="mg-accent">Unternehmen.</span>
              </h2>
            </Reveal>
            <ParallaxFloat className="mg-story__photo" distance={40}>
              <Image
                src={seoImages.portraitTournament}
                alt={seoImageAlts.portraitTournament}
                fill
                sizes="(max-width: 960px) 90vw, 36vw"
                className="mg-cover"
              />
            </ParallaxFloat>
          </div>
        </div>

        <div className="mg-story__body">
          <ScrollFillText className="mg-story__fill" text={siteContent.story[0]} />
          <Reveal>
            <p className="mg-body mg-story__para">{siteContent.story[2]}</p>
          </Reveal>

          <Stagger as="ul" className="mg-values" aria-label="Werte">
            {siteContent.values.map((value, i) => (
              <StaggerItem as="li" key={value.title} className="mg-value">
                <span className="mg-value__index mg-mono">0{i + 1}</span>
                <h3 className="mg-value__title">{value.title}</h3>
                <p className="mg-body">{value.text}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal>
            <Link href="/ueber-mich" className="mg-link-arrow">
              Mehr über mich <span className="mg-btn__arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
