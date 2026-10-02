import Link from "next/link";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { Reveal } from "@/components/motion/reveal";
import { FaqTopicNav, type FaqTopic } from "@/components/pages/faq-topic-nav";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import {
  aboutFaqItemsFlat,
  aboutFaqSections,
  parseFaqParagraphToHtml,
} from "@/content/aboutFaq";
import { uebermichFaqMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { faqPageGraph } from "@/lib/seo/webpage-jsonld";
import "@/styles/pages/faq.css";

export const metadata = uebermichFaqMetadata;

const faqTopics: FaqTopic[] = aboutFaqSections.map((s) => ({ id: s.id, title: s.title, count: s.items.length }));

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
      <SeoPageJsonLd
        schema={faqPageGraph(
          "Häufige Fragen zu Mauro Gilardi: Pro Golf Tour, HotelPlanner Tour, Swiss PGA, Swiss Golf Team, Rankings und Gönnervereinigung.",
        )}
      />

      <section className="mg-section mg-faq" aria-labelledby="mg-faq-heading">
        <div className="mg-container mg-faq__layout">
          <aside className="mg-faq__aside">
            <Reveal className="mg-faq__intro">
              <p className="mg-eyebrow">Häufige Fragen</p>
              <h2 id="mg-faq-heading" className="mg-h2 mg-faq__title">
                Kurz gefragt, ehrlich beantwortet.
              </h2>
              <p className="mg-body mg-faq__lead">
                <span className="mg-faq__count">{aboutFaqItemsFlat.length} Fragen</span> in{" "}
                {aboutFaqSections.length} Themen — gruppiert, nicht nach Wichtigkeit sortiert. Für mehr Tiefe:{" "}
                <Link href="/blog">Blog</Link>, <Link href="/ueber-mich">Über mich</Link>,{" "}
                <Link href="/erfolge">Erfolge</Link>.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <FaqTopicNav topics={faqTopics} />
            </Reveal>
          </aside>

          <div className="mg-faq__sections">
            {aboutFaqSections.map((section, sectionIndex) => (
              <section
                key={section.id}
                className="mg-faq__group"
                id={`faq-${section.id}`}
                aria-labelledby={`faq-${section.id}-title`}
              >
                <Reveal as="header" className="mg-faq__group-head">
                  <span className="mg-faq__group-index" aria-hidden="true">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="mg-faq__group-text">
                    <h2 id={`faq-${section.id}-title`} className="mg-faq__group-title">
                      {section.title}
                    </h2>
                    {section.lead ? <p className="mg-faq__group-lead">{section.lead}</p> : null}
                  </div>
                </Reveal>

                <div className="mg-faq__list">
                  {section.items.map((item, itemIndex) => (
                    <details key={item.question} className="mg-faq__item" open={sectionIndex === 0 && itemIndex === 0}>
                      <summary className="mg-faq__summary">
                        <h3 className="mg-faq__question">{item.question}</h3>
                        <span className="mg-faq__icon" aria-hidden="true" />
                      </summary>
                      <div className="mg-faq__answer">
                        {item.paragraphs.map((p, i) => (
                          <p
                            key={`${section.id}-${item.question}-${i}`}
                            className="mg-body"
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

      <section className="mg-section mg-section--tight mg-faq-cta-wrap" aria-labelledby="mg-faq-cta-title">
        <div className="mg-container">
          <Reveal className="mg-faq-cta">
            <div className="mg-faq-cta__text">
              <p className="mg-eyebrow">Noch Fragen offen?</p>
              <h2 id="mg-faq-cta-title" className="mg-h2 mg-faq-cta__title">
                Schreib mir direkt.
              </h2>
              <p className="mg-body mg-faq-cta__lead">
                Für persönliche Anliegen das Kontaktformular — für Partnerschaften und die Gönnervereinigung die
                Sponsoring-Seite.
              </p>
            </div>
            <div className="mg-faq-cta__actions">
              <a href="#kontakt" className="mg-btn mg-btn--dark mg-btn--lg">
                Kontakt aufnehmen
                <span className="mg-btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <Link href="/sponsoring" className="mg-btn mg-btn--ghost mg-btn--lg">
                Sponsoring &amp; Gönner
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
