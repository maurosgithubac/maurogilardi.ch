import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { siteSponsorTiers } from "@/content/sponsorsSite";
import { uebermichSponsorenMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { ueberMichChildBreadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/webpage-jsonld";

const PAGE_PATH = "/ueber-mich/sponsoren";

const SPONSOREN_DESCRIPTION =
  "Wer mich unterstützt — nach Stufen sortiert, mit Links. So findest du meine Sponsoren schnell.";

export const metadata = uebermichSponsorenMetadata;

function SponsorCardShell({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string | null;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <div className={`${className} about-sponsors-page-card--static`} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function UeberMichSponsorenPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={[
          webPageJsonLd({ path: PAGE_PATH, name: "Meine Sponsoren", description: SPONSOREN_DESCRIPTION }),
          ueberMichChildBreadcrumbJsonLd("Sponsoren", PAGE_PATH),
        ]}
      />
      <AboutSubpageShell
      label="Über mich"
      title="Meine Sponsoren"
      lead="Hier siehst du, wer mich unterstützt — Danke an alle, die den Weg mitgehen."
      heroSrc={seoImages.portraitTournament}
      heroAlt={seoImageAlts.portraitTournament}
    >
      <section className="about-sponsors-page" aria-label="Sponsoren">
        <div className="about-sponsors-page-inner">
          <div className="about-sponsors-page-main">
            <p className="about-sponsors-page-kicker">Netzwerk</p>
            <h2 className="about-sponsors-page-section-title">Sponsoren im Überblick</h2>
            <p className="about-sponsors-page-lead">
              Drei Stufen. Klick öffnet die Website — MG Gönnervereinigung führt zur Sponsoring-Seite.
            </p>

            {siteSponsorTiers.map((block) => (
              <section
                key={block.tier}
                className="about-sponsors-tier"
                aria-labelledby={`sponsor-tier-${block.tier}-title`}
              >
                <h3 id={`sponsor-tier-${block.tier}-title`} className="about-sponsors-tier-title">
                  {block.title}
                </h3>
                <p className="about-sponsors-tier-dek">{block.description}</p>
                <ul className="about-sponsors-page-grid">
                  {block.sponsors.map((s) => (
                    <li key={s.id}>
                      <SponsorCardShell
                        href={s.href}
                        className="about-sponsors-page-card"
                        ariaLabel={s.displayName}
                      >
                        <div className="about-sponsors-page-card-media">
                          <Image
                            src={s.imageSrc}
                            alt={`${s.displayName} – Sponsor von Mauro Gilardi`}
                            fill
                            sizes="(max-width: 380px) 90vw, (max-width: 719px) 45vw, 28vw"
                            className="about-sponsors-page-card-img"
                          />
                          <span className="about-sponsors-page-card-overlay" aria-hidden="true">
                            <span className="about-sponsors-page-card-title">{s.displayName}</span>
                          </span>
                        </div>
                      </SponsorCardShell>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <aside className="about-sponsors-aside">
            <h2 className="about-sponsors-aside-title">Sponsoring</h2>
            <p className="about-sponsors-aside-text">
              Interesse an Unterstützung oder Sponsoring? Melde dich — unverbindlich.
            </p>
            <Link href="/sponsoring" className="about-btn about-btn-primary">
              Sponsoring &amp; Mitgliedschaften
            </Link>
          </aside>
        </div>
      </section>
    </AboutSubpageShell>
    </>
  );
}
