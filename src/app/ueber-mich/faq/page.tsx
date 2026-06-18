import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import {
  aboutFaqSections,
  getAboutFaqPageJsonLd,
  getUeberMichFaqBreadcrumbJsonLd,
  parseFaqParagraphToHtml,
} from "@/content/aboutFaq";
import { uebermichFaqMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";

export const metadata = uebermichFaqMetadata;

export default function UeberMichFaqPage() {
  return (
    <AboutSubpageShell
      label="Über mich"
      title="FAQ"
      lead="Antworten zu mir selbst, zu den Touren, Swiss Golf, Swiss PGA und wo du Zahlen sowie Termine nachliest."
      heroSrc={seoImages.heroPrimary}
      heroAlt={seoImageAlts.heroPrimary}
      heroBgClassName="about-hero-bg--focus-top"
    >
      <SeoPageJsonLd schema={[getAboutFaqPageJsonLd(), getUeberMichFaqBreadcrumbJsonLd()]} />
      <section className="about-faq-page" aria-labelledby="about-faq-heading">
        <div className="about-faq-page-inner">
          <header className="about-faq-page-head">
            <h2 id="about-faq-heading" className="about-faq-page-title">
              Häufige Fragen
            </h2>
            <p className="about-faq-page-intro">
              Themen gruppiert — nicht nach Wichtigkeit sortiert. Für mehr Tiefe:{" "}
              <a href="/blog">Blog</a>, <a href="/ueber-mich">Über mich</a>, <a href="/erfolge">Erfolge</a>.
            </p>
            <nav className="about-faq-jump" aria-label="Sprung zu FAQ-Themen">
              <span className="about-faq-jump-label">Zu den Themen</span>
              <ul className="about-faq-jump-list">
                {aboutFaqSections.map((s) => (
                  <li key={s.id}>
                    <a className="about-faq-jump-link" href={`#faq-${s.id}`}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <div className="about-faq-sections">
            {aboutFaqSections.map((section) => (
              <section
                key={section.id}
                className="about-faq-section"
                id={`faq-${section.id}`}
                aria-labelledby={`faq-${section.id}-title`}
              >
                <header className="about-faq-section-head">
                  <h3 id={`faq-${section.id}-title`} className="about-faq-section-title">
                    {section.title}
                  </h3>
                  {section.lead ? <p className="about-faq-section-lead">{section.lead}</p> : null}
                </header>
                <div className="about-faq-list">
                  {section.items.map((item) => (
                    <details key={item.question} className="about-faq-details">
                      <summary className="about-faq-summary">{item.question}</summary>
                      <div className="about-faq-body">
                        {item.paragraphs.map((p, i) => (
                          <p
                            key={`${section.id}-${item.question}-${i}`}
                            className="about-faq-p"
                            dangerouslySetInnerHTML={{ __html: parseFaqParagraphToHtml(p) }}
                          />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
