import Image from "next/image";
import Link from "next/link";
import { PartnerInquiryForm } from "@/components/goenner/partner-inquiry-form";
import { PageHero } from "@/components/page-hero";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CountUp } from "@/components/motion/count-up";
import { ParallaxFloat } from "@/components/motion/parallax-media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { careerStats } from "@/content/career";
import { siteContent } from "@/content/siteContent";
import { siteSponsorTiers, trimmedSponsorLogo } from "@/content/sponsorsSite";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { partnerMetadata, partnerSchema } from "@/lib/seo/page-metadata";

export const metadata = partnerMetadata;

const OFFER = [
  {
    title: "Sichtbarkeit",
    text: "Präsenz auf meiner Webseite und in meiner Kommunikation — Umfang je nach Paket.",
  },
  {
    title: "Erlebnisse",
    text: "Golfkliniken, gemeinsame Runden und Sponsorentage für dein Team oder deine Kundschaft.",
  },
  {
    title: "Geschichten",
    text: "Ehrliche Inhalte von der Tour, die deine Marke mit Leistungssport aus der Schweiz verbinden.",
  },
  {
    title: "Massgeschneidert",
    text: "Kein Paket von der Stange: Ziele, Leistungen und Budget legen wir gemeinsam fest.",
  },
];

export default function PartnerPage() {
  const partners = siteSponsorTiers.flatMap((t) => t.sponsors);

  return (
    <div className="mg-page site-page">
      <SeoPageJsonLd schema={partnerSchema} />
      <SiteHeader variant="overlay" />

      <main id="inhalt">
        <PageHero
          eyebrow="Für Unternehmen"
          title="Sichtbar auf dem Weg zur DP World Tour."
          lead="2027 starte ich auf der HotelPlanner Tour — eine Stufe unter der DP World Tour. Wer jetzt einsteigt, wächst mit."
          image={seoImages.golfTeam}
          imageAlt={seoImageAlts.golfTeam}
          actions={
            <>
              <a href="#anfrage" className="mg-btn mg-btn--primary">
                Gespräch vereinbaren <span className="mg-btn__arrow" aria-hidden="true">↓</span>
              </a>
              <Link href="/erfolge" className="mg-btn mg-btn--glass">
                Meine Erfolge
              </Link>
            </>
          }
        />

        <section className="mg-proof" aria-label="Kennzahlen">
          <Stagger as="ul" className="mg-proof__stats mg-container">
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={careerStats.pgtRankingCurrent} suffix="." />
              </span>
              <span className="mg-stat__label">Pro Golf Tour Ranking {careerStats.pgtRankingYear} — Aufstieg geschafft</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={careerStats.pgtWins} />
              </span>
              <span className="mg-stat__label">Siege auf der Pro Golf Tour</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">
                <CountUp to={careerStats.supporters} />
              </span>
              <span className="mg-stat__label">Gönnerinnen &amp; Gönner im Team</span>
            </StaggerItem>
            <StaggerItem as="li" className="mg-stat">
              <span className="mg-stat__value">{partners.length}</span>
              <span className="mg-stat__label">Partner und Sponsoren an Bord</span>
            </StaggerItem>
          </Stagger>
        </section>

        <section className="mg-section" aria-labelledby="offer-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split">
              <div>
                <Reveal>
                  <p className="mg-eyebrow">Was ich biete</p>
                </Reveal>
                <SplitText as="h2" id="offer-title" className="mg-h2" text="Partnerschaft mit Gegenwert." />
              </div>
              <Reveal delay={0.1}>
                <p className="mg-lead">
                  Ich sehe meine Karriere wie ein Unternehmen. Darum bekommen meine Partner klare Leistungen, ehrliche
                  Kommunikation und einen persönlichen Ansprechpartner: mich.
                </p>
              </Reveal>
            </header>

            <Stagger as="ul" className="mg-offer" stagger={0.08}>
              {OFFER.map((o, i) => (
                <StaggerItem as="li" key={o.title}>
                  <TiltCard className="mg-offer__card">
                    <span className="mg-value__index mg-mono">0{i + 1}</span>
                    <h3 className="mg-h3">{o.title}</h3>
                    <p className="mg-body">{o.text}</p>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="mg-section mg-partner-teaser mg-grain" data-theme="dark" aria-labelledby="why-me-title">
          <div className="mg-container mg-partner-teaser__grid">
            <div className="mg-partner-teaser__copy">
              <Reveal>
                <p className="mg-eyebrow">Warum ich</p>
              </Reveal>
              <SplitText as="h2" id="why-me-title" className="mg-h2" text="Mehr als ein Logo auf dem Shirt." />
              <Reveal delay={0.1}>
                <p className="mg-lead">{siteContent.story[1]}</p>
              </Reveal>
              <Stagger as="ul" className="mg-check-list">
                <StaggerItem as="li">Aufstieg in die HotelPlanner Tour 2026</StaggerItem>
                <StaggerItem as="li">Board Member SwissPGA und Head of Playing Professional Commission</StaggerItem>
                <StaggerItem as="li">Eigene Gönnerstruktur mit jährlichem Gönnerturnier</StaggerItem>
              </Stagger>
            </div>
            <ParallaxFloat className="mg-partner-teaser__media" distance={50}>
              <Image
                src={seoImages.tournamentAction}
                alt={seoImageAlts.tournamentAction}
                fill
                sizes="(max-width: 960px) 90vw, 40vw"
                className="mg-cover"
              />
            </ParallaxFloat>
          </div>
        </section>

        <section className="mg-section" aria-labelledby="partners-title">
          <div className="mg-container">
            <header className="mg-section-head">
              <Reveal>
                <p className="mg-eyebrow">In guter Gesellschaft</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="partners-title" className="mg-h2">
                  Wer schon dabei ist.
                </h2>
              </Reveal>
            </header>
            <Stagger as="ul" className="mg-logo-grid" stagger={0.04}>
              {partners.map((p) => (
                <StaggerItem as="li" key={p.id} className="mg-logo-grid__item">
                  {p.href ? (
                    <a
                      href={p.href}
                      {...(p.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      aria-label={p.displayName}
                    >
                      <Image src={trimmedSponsorLogo(p.imageSrc)} alt={p.displayName} width={240} height={120} sizes="240px" />
                    </a>
                  ) : (
                    <Image src={trimmedSponsorLogo(p.imageSrc)} alt={p.displayName} width={240} height={120} sizes="240px" />
                  )}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="anfrage" className="mg-section mg-inquiry-section" aria-labelledby="partner-anfrage-title">
          <div className="mg-container mg-inquiry-layout">
            <div className="mg-inquiry-layout__intro">
              <Reveal>
                <p className="mg-eyebrow">Kontakt</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="partner-anfrage-title" className="mg-h2">
                  Lass uns reden.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mg-lead">
                  Erzähl mir kurz von deinem Unternehmen. Ich melde mich persönlich und bringe auf Wunsch mein
                  Sponsoring-Dossier mit.
                </p>
                <p className="mg-body mg-partner-mail">
                  Lieber direkt? <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
                </p>
              </Reveal>
            </div>
            <Reveal className="mg-card mg-inquiry-card" delay={0.1}>
              <PartnerInquiryForm />
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
