import type { LegalSection } from "@/content/legal";
import { siteContent } from "@/content/siteContent";

function renderLegalParagraph(paragraph: string) {
  const email = siteContent.contact.email;
  if (paragraph.includes(email)) {
    const [before, after] = paragraph.split(email);
    return (
      <p>
        {before}
        <a href={`mailto:${email}`}>{email}</a>
        {after}
      </p>
    );
  }
  return <p>{paragraph}</p>;
}

export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="legal-document">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="legal-document-section" aria-labelledby={`legal-${section.id}`}>
          <h2 id={`legal-${section.id}`}>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <div key={paragraph}>{renderLegalParagraph(paragraph)}</div>
          ))}
          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
