import type { Metadata } from "next";
import Link from "next/link";
import { SupporterWall } from "@/components/goenner/supporter-wall";
import { TierGrid } from "@/components/goenner/tier-grid";
import { GoennerturnierGallery } from "@/components/goenner/goennerturnier-gallery";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { seasonCampaign } from "@/content/campaign";
import { goennerturnierPhotographers, goennerturnierPhotos } from "@/content/goennerturnier-photos";
import { SITE_URL, seoImageAlts, seoImages, seoOgImages } from "@/lib/seo/constants";
import { TWINT_PAYLINK_URL } from "@/lib/twint";
import { getSupporterCount } from "@/lib/public-stats";

const TITLE = `Saison ${seasonCampaign.year} möglich machen | Mauro Gilardi`;
const DESCRIPTION =
  "Aufstieg in die HotelPlanner Tour geschafft. Werde Gönner ab 100 CHF im Jahr und trage Mauro Gilardis erste Saison eine Stufe unter der DP World Tour mit.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/2027` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/2027`,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
  },
};

/** Kennzahlen aus dem Admin-Portal stündlich aktualisieren */
export const revalidate = 3600;

const COSTS = [
  { title: "Turniere & Startgelder", text: "Eine volle Saison auf der HotelPlanner Tour, quer durch Europa." },
  { title: "Reisen & Unterkunft", text: "Flüge, Auto, Hotels — oft mehrere Wochen am Stück unterwegs." },
  { title: "Training & Coaching", text: "Technik, Athletik und Mental Coaching, damit ich bereit bin." },
];

/** Kampagnenseite (Link in Instagram-Bio, Newsletter, Posts): eine Botschaft, ein Ziel. */
export default async function Saison2027Page() {
  const supporters = await getSupporterCount();
  const { year, goalChf, committedChf } = seasonCampaign;
  const pct = committedChf != null ? Math.min(100, Math.round((committedChf / goalChf) * 100)) : null;

  return (
    <div className="mg-page site-page">
      <SiteHeader variant="overlay" />
      <main id="inhalt">
        <PageHero
          eyebrow={`Saison ${year}`}
          title={`Mach meine Saison ${year} möglich.`}
          lead="Der Aufstieg in die HotelPlanner Tour ist geschafft — eine Stufe unter der DP World Tour. Jetzt brauche ich ein Team, das die nächste Saison mitträgt."
          image={seoImages.heroPrimary}
          imageAlt={seoImageAlts.heroPrimary}
          actions={
            <>
              <a href="#modelle" className="mg-btn mg-btn--primary mg-btn--lg" data-track="campaign_cta" data-track-label="hero">
                Gönner werden <span className="mg-btn__arrow" aria-hidden="true">↓</span>
              </a>
              <Link href="/blog/aufstieg-hotelplanner-tour" className="mg-btn mg-btn--glass mg-btn--lg">
                Zum Aufstieg
              </Link>
            </>
          }
        />

        <section className="mg-section mg-section--tight" aria-labelledby="budget-title">
          <div className="mg-container mg-campaign-budget">
            <div>
              <Reveal>
                <p className="mg-eyebrow">Das Ziel</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="budget-title" className="mg-h2">
                  <CountUp to={goalChf} duration={1.6} /> CHF
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mg-lead">
                  So viel kostet mich eine Saison. Getragen wird sie von Gönnern, Sponsoren und Partnern — Preisgeld ist
                  Bonus.
                </p>
              </Reveal>
              {pct != null ? (
                <Reveal delay={0.15} className="mg-campaign-progress">
                  <div
                    className="mg-campaign-progress__bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={goalChf}
                    aria-valuenow={committedChf ?? 0}
                    aria-label={`Saison ${year} finanziert`}
                  >
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mg-campaign-progress__label">
                    <strong>{pct} %</strong> getragen — hilf mit, den Rest zu schliessen.
                  </p>
                </Reveal>
              ) : null}
            </div>
            <Stagger as="ul" className="mg-promises">
              {COSTS.map((c, i) => (
                <StaggerItem as="li" key={c.title} className="mg-promise">
                  <span className="mg-value__index mg-mono">0{i + 1}</span>
                  <h3 className="mg-value__title">{c.title}</h3>
                  <p className="mg-body">{c.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="modelle" className="mg-section mg-support" aria-labelledby="campaign-models-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split">
              <div>
                <Reveal>
                  <p className="mg-eyebrow">Dabei sein</p>
                </Reveal>
                <SplitText as="h2" id="campaign-models-title" className="mg-h2" text="Werde Teil meines Teams." />
              </div>
              <Reveal delay={0.1}>
                <p className="mg-lead">
                  {supporters} Gönnerinnen und Gönner sind schon dabei. Der 100er Club läuft direkt über TWINT,
                  für die anderen Modelle meldest du dich an und erhältst eine Rechnung.
                </p>
              </Reveal>
            </header>
            <TierGrid headingLevel="h3" inquiryHref="/sponsoring?modell={id}#anfrage" />
            <Reveal className="mg-support__twint">
              <div>
                <p className="mg-support__twint-title">Lieber einmalig?</p>
                <p className="mg-body">Mit TWINT einen freien Betrag schicken — jeder Franken fliesst in die Saison {year}.</p>
              </div>
              <a
                href={TWINT_PAYLINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-btn mg-btn--dark"
                data-track="twint_click"
                data-track-label="campaign"
              >
                Mit TWINT unterstützen <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>
          <SupporterWall />
        </section>

        <section className="mg-section" aria-labelledby="campaign-turnier-title">
          <div className="mg-container">
            <header className="mg-section-head">
              <Reveal>
                <p className="mg-eyebrow">Was dich erwartet</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="campaign-turnier-title" className="mg-h2">
                  Einmal im Jahr: das Gönnerturnier.
                </h2>
              </Reveal>
            </header>
            <Reveal>
              <GoennerturnierGallery photos={goennerturnierPhotos} photographers={goennerturnierPhotographers} />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
