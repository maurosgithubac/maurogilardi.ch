/** Wiederverwendbare WebPage- und Breadcrumb-Objekte (Schema.org) */

export const SITE_ROOT = "https://www.maurogilardi.ch";

export type WebPageSchemaInput = {
  path: string;
  name: string;
  description: string;
};

export function webPageJsonLd(input: WebPageSchemaInput): Record<string, unknown> {
  const url = `${SITE_ROOT}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "de-CH",
    isPartOf: { "@id": `${SITE_ROOT}/#website` },
    about: { "@id": `${SITE_ROOT}/#mauro-gilardi` },
    publisher: { "@id": `${SITE_ROOT}/#mauro-gilardi` },
  };
}

/** Home ohne Unterseiten in der Liste — eine klare Einstiegseite. */
export function homeWebPageJsonLd(description: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_ROOT}/#webpage`,
    url: SITE_ROOT,
    name: "Mauro Gilardi – Schweizer Golf Professional | SwissPGA & Pro Golf Tour",
    description,
    inLanguage: "de-CH",
    isPartOf: { "@id": `${SITE_ROOT}/#website` },
    about: { "@id": `${SITE_ROOT}/#mauro-gilardi` },
    publisher: { "@id": `${SITE_ROOT}/#mauro-gilardi` },
  };
}

export function ueberMichChildBreadcrumbJsonLd(leafName: string, path: string): Record<string, unknown> {
  const url = `${SITE_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ROOT },
      { "@type": "ListItem", position: 2, name: "Über mich", item: `${SITE_ROOT}/ueber-mich` },
      { "@type": "ListItem", position: 3, name: leafName, item: url },
    ],
  };
}
