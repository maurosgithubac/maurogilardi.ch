import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Über mich | Mauro Gilardi",
  description: "Über mich: Performance trifft Persönlichkeit — ich bin Mauro Gilardi, SwissPGA.",
};

export default function UeberMichPage() {
  return (
    <div className="site-page about-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero">
          <Image
            src="/brand-assets/images/195.png"
            alt="Mauro Gilardi im Turnier"
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">Über mich</p>
            <h1>Karriere wie ein Unternehmen.</h1>
            <p className="about-hero-lead">
              Leistungssport, Unternehmertum und klare Strukturen verbinden sich zu einem Weg mit einem Ziel:
              langfristiger Erfolg im Golf - und darüber hinaus.
            </p>
            <div className="about-hero-actions">
              <Link href="/blog" className="about-btn about-btn-primary">
                Zum Blog
              </Link>
              <Link href="/goenner" className="about-btn about-btn-ghost">
                Gönner werden
              </Link>
            </div>
          </div>
        </section>

        <section className="about-story" aria-labelledby="about-story-title">
          <div className="about-story-inner">
            <h2 id="about-story-title">Mein Weg</h2>
            <div className="about-story-layout">
              <div className="about-story-grid">
                {siteContent.story.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "about-story-lead" : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <aside className="about-story-portrait" aria-label="Portrait">
                <div className="about-story-portrait-frame">
                  <Image
                    src="/brand-assets/images/1L9A8795.JPG"
                    alt="Portrait von Mauro Gilardi"
                    fill
                    className="about-story-portrait-img"
                    sizes="(max-width: 640px) 70vw, 320px"
                    quality={100}
                  />
                </div>
                <ul className="about-story-tags" aria-label="Schwerpunkte">
                  <li>DP World Tour Ziel</li>
                  <li>Leistungssport & IT</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className="about-projects" aria-labelledby="about-projects-title">
          <div className="about-projects-inner">
            <h2 id="about-projects-title">Neben dem Tour-Alltag, den ich aufbaue</h2>
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
  );
}
