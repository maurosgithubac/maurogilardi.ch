/** Root Structured Data — Person + WebSite + ProfessionalService */

import {
  buildPersonJsonLd,
  buildProfessionalServiceJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/person-jsonld";

export function SeoRootJsonLd() {
  const schemas = [buildPersonJsonLd(), buildWebsiteJsonLd(), buildProfessionalServiceJsonLd()];

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  );
}
