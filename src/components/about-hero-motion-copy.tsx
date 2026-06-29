"use client";

import type { ReactNode } from "react";
import { HeroCopyReveal, HeroRevealItem } from "@/components/motion/scroll-reveal";

type Props = {
  label: string;
  title: string;
  lead: ReactNode;
  actions: ReactNode;
};

export function AboutHeroMotionCopy({ label, title, lead, actions }: Props) {
  return (
    <HeroCopyReveal className="subpage-copy about-hero-copy">
      <HeroRevealItem>
        <p className="label about-hero-label">{label}</p>
      </HeroRevealItem>
      <HeroRevealItem>
        <h1>{title}</h1>
      </HeroRevealItem>
      <HeroRevealItem>
        <p className="about-hero-lead">{lead}</p>
      </HeroRevealItem>
      <HeroRevealItem>
        <div className="about-hero-actions">{actions}</div>
      </HeroRevealItem>
    </HeroCopyReveal>
  );
}
