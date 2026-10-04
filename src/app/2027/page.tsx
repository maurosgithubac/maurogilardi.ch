import type { Metadata } from "next";
import Link from "next/link";
import { SupporterWall } from "@/components/goenner/supporter-wall";
import { TierGrid } from "@/components/goenner/tier-grid";
import { GoennerturnierGallery } from "@/components/goenner/goennerturnier-gallery";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { seasonCampaign } from "@/content/campaign";
import { FundingStrip } from "@/components/funding-strip";
import { goennerturnierPhotographers, goennerturnierPhotos } from "@/content/goennerturnier-photos";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { SAISON_2027_DESCRIPTION, saison2027Metadata } from "@/lib/seo/page-metadata";
import { saison2027Graph } from "@/lib/seo/webpage-jsonld";
import { TWINT_PAYLINK_URL } from "@/lib/twint";
import { getSupporterCount } from "@/lib/public-stats";
import { VerticalVideo } from "@/components/video/vertical-video";
import { aufstiegVideo, isCampaignVideoFeatured } from "@/content/campaign-video";

const DESCRIPTION = SAISON_2027_DESCRIPTION;

export const metadata: Metadata = saison2027Metadata;

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
  const { year, goalChf } = seasonCampaign;

  return (
    <div className="mg-page site-page">
      <SeoPageJsonLd schema={saison2027Graph(DESCRIPTION)} />
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

        {isCampaignVideoFeatured() ? (
          <section className="mg-section mg-section--tight" aria-labelledby="campaign-video-title">
            <div className="mg-container mg-campaign-video">
              <Reveal className="mg-campaign-video__player">
                <VerticalVideo video={aufstiegVideo} trackLabel="campaign_2027" />
              </Reveal>
              <div>
                <Reveal>
                  <p className="mg-eyebrow">In 90 Sekunden</p>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 id="campaign-video-title" className="mg-h2">
                    Wo ich stehe — und was jetzt kommt.
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="mg-lead">
                    Der Aufstieg ist geschafft, die HotelPlanner Tour ist die zweithöchste Liga in Europa und der direkte
                    Weg zur DP World Tour. Im Video erzähle ich, was das für mich bedeutet, was eine Saison kostet und wie
                    du Teil meines Teams wirst.
                  </p>
                </Reveal>
                <Reveal delay={0.15} className="mg-campaign-video__cta">
                  <a href="#modelle" className="mg-btn mg-btn--primary mg-btn--lg" data-track="campaign_cta" data-track-label="video">
                    Gönner werden <span className="mg-btn__arrow" aria-hidden="true">↓</span>
                  </a>
                </Reveal>
              </div>
            </div>
          </section>
        ) : null}

        <FundingStrip href="#modelle" />

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
