import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { AboutSubnav } from "@/components/about-subnav";
import { PageHero } from "@/components/page-hero";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SupportStickyBar } from "@/components/support-sticky-bar";
import { SiteHeader } from "@/components/site-header";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ScrollFillText } from "@/components/motion/scroll-fill-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { CountUp } from "@/components/motion/count-up";
import { uebermichMetadata, uebermichSchema } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export const metadata = uebermichMetadata;

export default function UeberMichPage() {
  const [lead, ...story] = siteContent.story;
  const { projectsShowcase } = siteContent;

  return (
    <div className="mg-page site-page about-page">
      <SeoPageJsonLd schema={uebermichSchema} />
      <SiteHeader variant="overlay" />

      <main id="inhalt">
        <PageHero
          eyebrow="Über mich"
          title="Mauro Gilardi – Schweizer Golf Professional aus Graubünden"
          lead={
            <>
              <strong>Karriere wie ein Unternehmen.</strong> Leistungssport, Unternehmertum und klare Strukturen — mit
              einem Ziel: langfristiger Erfolg im Golf und darüber hinaus.
            </>
          }
          image={seoImages.portraitTournament}
          imageAlt={seoImageAlts.portraitTournament}
          actions={
            <>
              <Link href="/erfolge" className="mg-btn mg-btn--light">
                Meine Erfolge
              </Link>
              <Link href="/blog" className="mg-btn mg-btn--glass">
                Zum Blog
              </Link>
            </>
          }
        />

        <AboutSubnav />

        <section className="mg-section" aria-labelledby="about-story-title">
          <div className="mg-container mg-about-story">
            <div className="mg-about-story__head">
              <Reveal>
                <p className="mg-eyebrow">Mein Weg</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="about-story-title" className="mg-h2">
                  In Kurzform.
                </h2>
              </Reveal>
            </div>
            <div className="mg-about-story__body">
              <ScrollFillText className="mg-story__fill" text={lead} />
              {story.map((paragraph) => (
                <Reveal key={paragraph.slice(0, 32)}>
                  <p className="mg-body mg-about-story__para">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mg-section mg-about-projects mg-grain" data-theme="dark" aria-labelledby="about-projects-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split">
              <div>
                <Reveal>
                  <p className="mg-eyebrow">Neben der Tour</p>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 id="about-projects-title" className="mg-h2">
                    Sport, IT und Struktur.
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="mg-lead">{projectsShowcase.intro}</p>
              </Reveal>
            </header>

            <Stagger as="ul" className="mg-kpis" aria-label="Projektkennzahlen">
              {projectsShowcase.kpis.map((kpi) => (
                <StaggerItem as="li" key={kpi.label} className="mg-stat">
                  <span className="mg-stat__value">
                    <CountUp to={Number(kpi.value)} />
                  </span>
                  <span className="mg-stat__label">{kpi.label}</span>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal>
              <ul className="mg-roles">
                {projectsShowcase.responsibilities.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </Reveal>

            <Stagger as="ul" className="mg-projects" stagger={0.07}>
              {projectsShowcase.projects.map((project) => (
                <StaggerItem as="li" key={project.name}>
                  <TiltCard className="mg-project">
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className="mg-project__link">
                      <span className="mg-project__type">{project.type}</span>
                      <h3 className="mg-project__name">
                        {project.name} <span aria-hidden="true">↗</span>
                      </h3>
                      <p className="mg-project__text">{project.text}</p>
                    </a>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </main>

      <SiteFooter />
      <SupportStickyBar />
    </div>
  );
}
