import type { ReactNode } from "react";
import type { LegalSection } from "@/content/legal";
import { Reveal } from "@/components/motion/reveal";
import "@/styles/pages/legal.css";

/** E-Mail-Adressen und Web-Adressen im Fliesstext verlinken (Inhalte bleiben reine Strings). */
const LINK_PATTERN = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/[^\s,;)]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part.includes("@") && !part.startsWith("http")) {
      return (
        <a key={i} href={`mailto:${part}`}>
          {part}
        </a>
      );
    }
    const label = part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    return (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {label}
        <span className="mg-sr-only"> (öffnet in neuem Tab)</span>
      </a>
    );
  });
}

function sectionNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="mg-legaldoc">
      <nav className="mg-legaldoc__toc" aria-label="Inhalt dieser Seite">
        <p className="mg-legaldoc__toc-title">Inhalt</p>
        <ol className="mg-legaldoc__toc-list">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="mg-legaldoc__toc-link">
                <span className="mg-legaldoc__toc-num" aria-hidden="true">
                  {sectionNumber(index)}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mg-legaldoc__content">
        {sections.map((section, index) => (
          <Reveal
            key={section.id}
            as="section"
            y={14}
            amount={0.1}
            id={section.id}
            className="mg-legaldoc__section"
            aria-labelledby={`legal-${section.id}`}
          >
            <h2 id={`legal-${section.id}`} className="mg-legaldoc__title">
              <span className="mg-legaldoc__num" aria-hidden="true">
                {sectionNumber(index)}
              </span>
              <span>{section.title}</span>
            </h2>
            <div className="mg-legaldoc__text">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{linkify(paragraph)}</p>
              ))}
              {section.bullets?.length ? (
                <ul className="mg-legaldoc__list">
                  {section.bullets.map((item) => (
                    <li key={item}>{linkify(item)}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
