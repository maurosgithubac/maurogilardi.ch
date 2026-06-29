import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { AboutHeroMotionCopy } from "@/components/about-hero-motion-copy";
import { AboutSubnav } from "@/components/about-subnav";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { uebermichMetadata, uebermichSchema } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export const metadata = uebermichMetadata;

export default function UeberMichPage() {
  return (
    <>
      <SeoPageJsonLd schema={uebermichSchema} />
      <div className="site-page about-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero blog-index-hero-unified">
          <Image
            src={seoImages.portraitTournament}
            alt={seoImageAlts.portraitTournament}
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <AboutHeroMotionCopy
            label="Über mich"
            title="Mauro Gilardi – Schweizer Golf Professional aus Graubünden"
            lead={
              <>
                <strong>Karriere wie ein Unternehmen.</strong>{" "}
                Leistungssport, Unternehmertum und klare Strukturen verbinden sich zu einem Weg mit einem Ziel:
                langfristiger Erfolg im Golf - und darüber hinaus.
              </>
            }
            actions={
              <>
                <Link href="/blog" className="about-btn about-btn-primary">
                  Zum Blog
                </Link>
                <Link href="/sponsoring" className="about-btn about-btn-ghost">
                  Sponsoring
                </Link>
              </>
            }
          />
        </section>

        <AboutSubnav />

        <section className="about-story" aria-labelledby="about-story-title">
          <div className="about-story-inner">
            <h2 id="about-story-title">Mein Weg — in Kurzform</h2>
            <div className="about-story-layout">
              <div className="about-story-grid">
                {siteContent.story.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "about-story-lead" : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-projects" aria-labelledby="about-projects-title">
          <div className="about-projects-inner">
            <h2 id="about-projects-title">Was ich neben der Tour noch mache</h2>
            <p className="about-projects-intro">{siteContent.projectsShowcase.intro}</p>

            <ul className="about-projects-roles">
              {siteContent.projectsShowcase.responsibilities.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>

            <ul className="about-projects-grid">
              {siteContent.projectsShowcase.projects.map((project) => (
                <li key={project.name} className="about-project-card">
                  <p className="about-project-type">{project.type}</p>
                  <h3>
                    <a href={project.href} target="_blank" rel="noopener noreferrer">
                      {project.name}
                    </a>
                  </h3>
                  <p>{project.text}</p>
                </li>
              ))}
            </ul>

            <ul className="about-projects-kpis" aria-label="Projektkennzahlen">
              {siteContent.projectsShowcase.kpis.map((kpi) => (
                <li key={kpi.label} className="about-project-kpi">
                  <span className="about-project-kpi-value">{kpi.value}</span>
                  <span className="about-project-kpi-label">{kpi.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
    </>
  );
}
