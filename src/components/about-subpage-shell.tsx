import Link from "next/link";
import type { ReactNode } from "react";
import { AboutSubnav } from "@/components/about-subnav";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = {
  label: string;
  title: string;
  lead: string;
  heroSrc: string;
  heroAlt: string;
  children: ReactNode;
  /** Altbestand: Fokus oben bei `about-hero-bg--focus-top` */
  heroBgClassName?: string;
};

export function AboutSubpageShell({ label, title, lead, heroSrc, heroAlt, children, heroBgClassName }: Props) {
  return (
    <div className="mg-page site-page about-page">
      <SiteHeader variant="overlay" />
      <main id="inhalt">
        <PageHero
          eyebrow={label}
          title={title}
          lead={lead}
          image={heroSrc}
          imageAlt={heroAlt}
          focus={heroBgClassName?.includes("focus-top") ? "50% 15%" : undefined}
          actions={
            <>
              <Link href="/ueber-mich" className="mg-btn mg-btn--light">
                Über mich
              </Link>
              <Link href="/sponsoring" className="mg-btn mg-btn--glass">
                Gönner werden
              </Link>
            </>
          }
        />

        <AboutSubnav />

        <div className="mg-legacy-content">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
