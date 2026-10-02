import Image from "next/image";
import type { ReactNode } from "react";
import { ParallaxMedia, ScrollFadeOut } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";

type Props = {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  image: string;
  imageAlt: string;
  actions?: ReactNode;
  /** CSS object-position fürs Bild, z. B. "50% 20%" */
  focus?: string;
};

/** Einheitlicher Seiten-Hero: Vollbild-Foto mit Parallax, Wort-Reveal im Titel, dunkler Verlauf. */
export function PageHero({ eyebrow, title, lead, image, imageAlt, actions, focus }: Props) {
  return (
    <section className="mg-page-hero mg-grain" data-theme="dark">
      <ParallaxMedia className="mg-hero__media" shift={10} zoom={1.08}>
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="mg-hero__img"
          style={focus ? { objectPosition: focus } : undefined}
        />
      </ParallaxMedia>
      <div className="mg-hero__scrim" aria-hidden="true" />
      <ScrollFadeOut className="mg-page-hero__content mg-container">
        <p className="mg-eyebrow mg-hero__eyebrow">{eyebrow}</p>
        <SplitText as="h1" text={title} className="mg-page-hero__title" onMount delay={0.1} stagger={0.05} />
        {lead ? (
          <Reveal y={16} delay={0.35}>
            <p className="mg-lead mg-hero__lead">{lead}</p>
          </Reveal>
        ) : null}
        {actions ? (
          <Reveal y={16} delay={0.45} className="mg-hero__actions">
            {actions}
          </Reveal>
        ) : null}
      </ScrollFadeOut>
    </section>
  );
}
