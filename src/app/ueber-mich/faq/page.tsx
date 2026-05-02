import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import {
  aboutFaqItems,
  getAboutFaqPageJsonLd,
  getUeberMichFaqBreadcrumbJsonLd,
  parseFaqParagraphToHtml,
} from "@/content/aboutFaq";
import { uebermichFaqMetadata } from "@/lib/seo/page-metadata";

export const metadata = uebermichFaqMetadata;

export default function UeberMichFaqPage() {
  return (
    <AboutSubpageShell
      label="Über mich"
      title="FAQ"
      lead="Schnelle Antworten zu mir, zu den Touren, SwissPGA, Swiss Golf — und wo du aktuelle Rankings findest."
      heroSrc="/brand-assets/images/1L9A8795.JPG"
      heroAlt="Mauro Gilardi bei der Pro Golf Tour"
      heroBgClassName="about-hero-bg--focus-top"
    >
      <SeoPageJsonLd schema={[getAboutFaqPageJsonLd(), getUeberMichFaqBreadcrumbJsonLd()]} />
      <section className="about-faq-page" aria-labelledby="about-faq-heading">
        <div className="about-faq-page-inner">
          <h2 id="about-faq-heading" className="about-faq-page-title">
            Häufige Fragen
          </h2>
          <p className="about-faq-page-intro">
            Die Reihenfolge ist thematisch — nicht nach Wichtigkeit. Für tiefer gehende persönliche Einblicke lohnt sich weiterhin{" "}
            <a href="/blog">Blog</a> und <a href="/ueber-mich">Über mich</a>.
          </p>
          <div className="about-faq-list">
            {aboutFaqItems.map((item) => (
              <details key={item.question} className="about-faq-details">
                <summary className="about-faq-summary">{item.question}</summary>
                <div className="about-faq-body">
                  {item.paragraphs.map((p, i) => (
                    <p key={`${item.question}-${i}`} className="about-faq-p" dangerouslySetInnerHTML={{ __html: parseFaqParagraphToHtml(p) }} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
