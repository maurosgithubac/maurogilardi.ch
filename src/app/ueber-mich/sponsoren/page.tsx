import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { siteSponsorTiers, trimmedSponsorLogo, type SiteSponsor, type SiteSponsorTier } from "@/content/sponsorsSite";
import { uebermichSponsorenMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { sponsorenPageGraph } from "@/lib/seo/webpage-jsonld";
import "@/styles/pages/sponsoren.css";

const SPONSOREN_DESCRIPTION =
  "Wer mich unterstützt — nach Stufen sortiert, mit Links. So findest du meine Sponsoren schnell.";

export const metadata = uebermichSponsorenMetadata;

/** Sichtbares Linkziel: Domain ohne www bzw. Hinweis auf interne Seite */
function linkLabel(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("/")) return "Gönner-Seite";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function SponsorLink({ sponsor, children }: { sponsor: SiteSponsor; children: ReactNode }) {
  const { href, displayName } = sponsor;
  if (!href) {
    return <div className="mg-sponsor-tile">{children}</div>;
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="mg-sponsor-tile mg-sponsor-tile--link" aria-label={`${displayName} – zur Gönner-Seite`}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="mg-sponsor-tile mg-sponsor-tile--link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${displayName} – Website öffnen (neues Fenster)`}
    >
      {children}
    </a>
  );
}

const TILE_SIZES: Record<SiteSponsorTier["tier"], string> = {
  1: "(max-width: 719px) 80vw, (max-width: 1079px) 40vw, 22rem",
  2: "(max-width: 719px) 80vw, 30rem",
  3: "(max-width: 719px) 40vw, 14rem",
};

function TierBlock({ block }: { block: SiteSponsorTier }) {
  const titleId = `sponsor-tier-${block.tier}-title`;
  return (
    <section className={`mg-sponsor-tier mg-sponsor-tier--${block.tier}`} aria-labelledby={titleId}>
      <Reveal className="mg-sponsor-tier__head">
        <span className="mg-sponsor-tier__index mg-mono" aria-hidden="true">
          {pad(block.tier)}
        </span>
        <h3 id={titleId} className="mg-sponsor-tier__title">
          {block.title}
        </h3>
        <p className="mg-sponsor-tier__dek">{block.description}</p>
        <p className="mg-sponsor-tier__count mg-mono">
          {block.sponsors.length} Partner
        </p>
      </Reveal>

      <Stagger as="ul" className="mg-sponsor-grid" stagger={0.06} aria-label={`${block.title} – Logos`}>
        {block.sponsors.map((s) => {
          const label = linkLabel(s.href);
          return (
            <StaggerItem as="li" key={s.id} className="mg-sponsor-grid__item">
              <SponsorLink sponsor={s}>
                <span className="mg-sponsor-tile__media">
                  <Image
                    src={trimmedSponsorLogo(s.imageSrc)}
                    alt={`${s.displayName} – Sponsor von Mauro Gilardi`}
                    fill
                    sizes={TILE_SIZES[block.tier]}
                    className="mg-sponsor-tile__logo"
                  />
                </span>
                <span className="mg-sponsor-tile__meta">
                  <span className="mg-sponsor-tile__name">{s.displayName}</span>
                  {label ? (
                    <span className="mg-sponsor-tile__url">
                      {label}
                      <span className="mg-sponsor-tile__arrow" aria-hidden="true">
                        {s.href?.startsWith("/") ? "→" : "↗"}
                      </span>
                    </span>
                  ) : null}
                </span>
              </SponsorLink>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

export default function UeberMichSponsorenPage() {
  const total = siteSponsorTiers.reduce((sum, t) => sum + t.sponsors.length, 0);

  return (
    <>
      <SeoPageJsonLd
        schema={sponsorenPageGraph(SPONSOREN_DESCRIPTION)}
      />
      <AboutSubpageShell
        label="Über mich"
        title="Meine Sponsoren"
        lead="Hier siehst du, wer mich unterstützt — Danke an alle, die den Weg mitgehen."
        heroSrc={seoImages.swissGolfFlag}
        heroAlt={seoImageAlts.swissGolfFlag}
        heroFocus="60% 40%"
      >
        <section className="mg-section mg-section--tight mg-sponsors" aria-labelledby="sponsors-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split mg-sponsors__head">
              <Reveal className="mg-sponsors__head-main">
                <p className="mg-eyebrow">Netzwerk</p>
                <h2 id="sponsors-title" className="mg-h2">
                  Sponsoren im Überblick
                </h2>
              </Reveal>
              <Reveal className="mg-sponsors__head-aside" delay={0.1}>
                <p className="mg-lead">
                  Drei Stufen. Ein Klick auf das Logo öffnet die Website des Partners.
                </p>
                <dl className="mg-sponsors__facts">
                  <div>
                    <dt>Sponsoren</dt>
                    <dd className="mg-mono">{total}</dd>
                  </div>
                  <div>
                    <dt>Stufen</dt>
                    <dd className="mg-mono">{siteSponsorTiers.length}</dd>
                  </div>
                </dl>
              </Reveal>
            </header>

            <div className="mg-sponsors__tiers">
              {siteSponsorTiers.map((block) => (
                <TierBlock key={block.tier} block={block} />
              ))}
            </div>
          </div>
        </section>

        <section className="mg-section mg-section--tight mg-sponsors-cta" aria-labelledby="sponsors-cta-title">
          <div className="mg-container">
            <Reveal className="mg-sponsors-cta__panel">
              <div className="mg-sponsors-cta__copy">
                <p className="mg-eyebrow">Für Unternehmen</p>
                <h2 id="sponsors-cta-title" className="mg-h3 mg-sponsors-cta__title">
                  Partner werden
                </h2>
                <p className="mg-body">
                  Interesse an Unterstützung oder Sponsoring? Melde dich — unverbindlich.
                </p>
              </div>
              <div className="mg-sponsors-cta__actions">
                <Link href="/partner" className="mg-btn mg-btn--primary">
                  Partner werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link href="/sponsoring" className="mg-btn mg-btn--ghost">
                  Gönner werden
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </AboutSubpageShell>
    </>
  );
}
