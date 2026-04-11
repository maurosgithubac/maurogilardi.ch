import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AboutSubnav } from "@/components/about-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = {
  label: string;
  title: string;
  lead: string;
  heroSrc: string;
  heroAlt: string;
  children: ReactNode;
};

export function AboutSubpageShell({ label, title, lead, heroSrc, heroAlt, children }: Props) {
  return (
    <div className="site-page about-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero blog-index-hero-unified">
          <Image src={heroSrc} alt={heroAlt} fill className="stage-bg about-hero-bg" priority />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">{label}</p>
            <h1>{title}</h1>
            <p className="about-hero-lead">{lead}</p>
            <div className="about-hero-actions">
              <Link href="/ueber-mich" className="about-btn about-btn-ghost">
                Über mich
              </Link>
              <Link href="/" className="about-btn about-btn-primary">
                Home
              </Link>
            </div>
          </div>
        </section>

        <AboutSubnav />

        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
