import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GoennerInquiryForm } from "@/components/goenner/inquiry-form";
import { SupporterWall } from "@/components/goenner/supporter-wall";
import { TierGrid } from "@/components/goenner/tier-grid";
import { PageHero } from "@/components/page-hero";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TwintPaylinkButton } from "@/components/twint-paylink-button";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { careerStats } from "@/content/career";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { sponsoringMetadataSeo, sponsoringSchema } from "@/lib/seo/page-metadata";

export const metadata: Metadata = sponsoringMetadataSeo;

const PROMISES = [
  { title: "Direkt", text: "Du schreibst mir persönlich — ohne Agentur, ohne Umwege." },
  { title: "Persönlich", text: "Details, Termine und Wünsche klären wir im Gespräch." },
  { title: "Ehrlich", text: "Monatliche Updates von der Tour — auch wenn es mal nicht läuft." },
];

export default function SponsoringPage() {
  return (
    <div className="mg-page site-page goenner-page">
      <SeoPageJsonLd schema={sponsoringSchema} />
      <SiteHeader variant="overlay" />

      <main id="inhalt">
        <PageHero
          eyebrow="Gönner werden"
          title="Werde Teil meines Teams."
          lead={
            <>
              Ab <strong>100 CHF im Jahr</strong> bist du im 100er Club dabei — oder du wählst Birdie, Eagle oder Albatros
              mit Gönnerturnier, Golfklinik und einer Runde mit mir.
            </>
          }
          image={seoImages.golfEvent}
          imageAlt={seoImageAlts.golfEvent}
          actions={
            <>
              <a href="#modelle" className="mg-btn mg-btn--primary">
                Modelle ansehen <span className="mg-btn__arrow" aria-hidden="true">↓</span>
              </a>
              <Link href="/partner" className="mg-btn mg-btn--glass">
                Für Unternehmen
              </Link>
            </>
          }
        />

        <section className="mg-section mg-section--tight" aria-labelledby="why-title">
          <div className="mg-container mg-why">
            <div className="mg-why__intro">
              <Reveal>
                <p className="mg-eyebrow">Warum es zählt</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="why-title" className="mg-h3">
                  Eine Saison kostet mich rund{" "}
                  <span className="mg-accent">
                    <CountUp to={careerStats.seasonBudgetChf} duration={1.6} /> CHF
                  </span>
                  . Getragen wird sie von Menschen wie dir.
                </h2>
              </Reveal>
            </div>
            <Stagger as="ol" className="mg-promises">
              {PROMISES.map((p, i) => (
                <StaggerItem as="li" key={p.title} className="mg-promise">
                  <span className="mg-value__index mg-mono">0{i + 1}</span>
                  <h3 className="mg-value__title">{p.title}</h3>
                  <p className="mg-body">{p.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="modelle" className="mg-section mg-support" aria-labelledby="modelle-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split">
              <div>
                <Reveal>
                  <p className="mg-eyebrow">Mitgliedschaften</p>
                </Reveal>
                <SplitText as="h2" id="modelle-title" className="mg-h2" text="Das passende Modell." />
              </div>
              <Reveal delay={0.1}>
                <p className="mg-lead">
                  Alle Beiträge gelten pro Jahr. Der 100er Club läuft direkt über TWINT, die anderen Modelle fragst du
                  unten an — ich melde mich persönlich.
                </p>
              </Reveal>
            </header>

            <TierGrid headingLevel="h3" inquiryHref="/sponsoring?modell={id}#anfrage" />

            <Reveal className="mg-support__twint">
              <div>
                <p className="mg-support__twint-title">Mit freiem Betrag unterstützen</p>
                <p className="mg-body">Einmalig und unkompliziert per TWINT — jeder Franken fliesst in die Saison.</p>
              </div>
              <TwintPaylinkButton kicker="" />
            </Reveal>
          </div>
        </section>

        <section id="anfrage" className="mg-section mg-inquiry-section" aria-labelledby="anfrage-title">
          <div className="mg-container mg-inquiry-layout">
            <div className="mg-inquiry-layout__intro">
              <Reveal>
                <p className="mg-eyebrow">Anfrage</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="anfrage-title" className="mg-h2">
                  Mitglied werden.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <ol className="mg-steps">
                  <li>
                    <span>
                      <strong>Anfrage senden</strong> — dauert eine Minute.
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong>Ich melde mich</strong> persönlich bei dir.
                    </span>
                  </li>
                  <li>
                    <span>
                      <strong>Rechnung &amp; Willkommen</strong> — ab dann bist du Teil des Teams.
                    </span>
                  </li>
                </ol>
              </Reveal>
            </div>
            <Reveal className="mg-card mg-inquiry-card" delay={0.1}>
              <Suspense fallback={<div className="mg-inquiry-placeholder" aria-hidden="true" />}>
                <GoennerInquiryForm />
              </Suspense>
            </Reveal>
          </div>
        </section>

        <section className="mg-section mg-section--tight" aria-label="Gönnerinnen und Gönner">
          <SupporterWall />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
