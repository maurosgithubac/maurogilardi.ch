/**
 * Root-Entity-Graph (schema.org) — Person, WebSite und die Organisationen, mit denen Mauro Gilardi verbunden ist.
 * Wird im Root-Layout als ein einziger `@graph` ausgegeben; Seiten verweisen nur noch per `@id` darauf.
 */

import { allSiteSponsorsFlat } from "@/content/sponsorsSite";
import { SITE_URL, seoImageAlts, seoImages } from "@/lib/seo/constants";
import {
  ORG_IDS,
  PERSON_ID,
  PORTRAIT_ID,
  WEBSITE_ID,
  keyPressReports,
  personAwards,
  personFacts,
  personSameAsUrls,
  personSummary,
} from "@/lib/seo/facts";

export { PERSON_ID, WEBSITE_ID } from "@/lib/seo/facts";

type Node = Record<string, unknown>;

const graubuenden = {
  "@type": "AdministrativeArea",
  name: "Graubünden",
  sameAs: "https://www.wikidata.org/wiki/Q11925",
  containedInPlace: { "@type": "Country", name: "Schweiz", sameAs: "https://www.wikidata.org/wiki/Q39" },
};

/** Organisationen als eigene Knoten mit stabilen IDs */
export function buildOrganizationNodes(): Node[] {
  return [
    {
      "@type": "SportsOrganization",
      "@id": ORG_IDS.swissPga,
      name: "Swiss PGA",
      alternateName: "SwissPGA",
      url: "https://www.swisspga.ch",
      sport: "Golf",
      description: "Berufsverband der Golf Professionals in der Schweiz.",
    },
    {
      "@type": "SportsOrganization",
      "@id": ORG_IDS.swissGolf,
      name: "Swiss Golf",
      url: "https://www.swissgolf.ch",
      sport: "Golf",
      description: "Dachverband des Golfsports in der Schweiz.",
    },
    {
      "@type": "SportsTeam",
      "@id": ORG_IDS.swissGolfTeam,
      name: "Swiss Golf Team",
      url: "https://www.swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
      sport: "Golf",
      parentOrganization: { "@id": ORG_IDS.swissGolf },
      athlete: { "@id": PERSON_ID },
    },
    {
      "@type": "SportsOrganization",
      "@id": ORG_IDS.proGolfTour,
      name: "Pro Golf Tour",
      alternateName: "PGT",
      url: "https://www.progolftour.de",
      sport: "Golf",
      description: "Europäische Profi-Entwicklungstour (Order of Merit als Aufstiegsweg in die HotelPlanner Tour).",
    },
    {
      "@type": "SportsOrganization",
      "@id": ORG_IDS.homeClub,
      name: personFacts.homeClub.name,
      url: personFacts.homeClub.url,
      sport: "Golf",
      location: { "@type": "Place", name: "Domat/Ems", address: { "@type": "PostalAddress", addressLocality: "Domat/Ems", addressRegion: "GR", addressCountry: "CH" } },
    },
    {
      "@type": "Organization",
      "@id": ORG_IDS.goennervereinigung,
      name: "MG Gönnervereinigung",
      url: `${SITE_URL}/sponsoring`,
      description: "Gönnerstruktur, mit der Privatpersonen die Profikarriere von Mauro Gilardi mittragen.",
      founder: { "@id": PERSON_ID },
    },
  ];
}

/** Sponsoren aus sponsorsSite.ts — nur externe Organisationen (Verbände/Team/eigene Gönnervereinigung separat) */
function sponsorNodes(): Node[] {
  return allSiteSponsorsFlat()
    .filter((s) => s.href?.startsWith("http") && s.id !== "swissgolf")
    .map((s) =>
      s.id === "gcde" ? { "@id": ORG_IDS.homeClub } : { "@type": "Organization", name: s.displayName, url: s.href },
    );
}

export function buildPersonJsonLd(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: personFacts.name,
    givenName: personFacts.givenName,
    familyName: personFacts.familyName,
    alternateName: personFacts.brand,
    description: personSummary,
    url: `${SITE_URL}/`,
    mainEntityOfPage: { "@id": `${SITE_URL}/ueber-mich#webpage` },
    email: `mailto:${personFacts.email}`,
    image: {
      "@type": "ImageObject",
      "@id": PORTRAIT_ID,
      url: `${SITE_URL}${seoImages.heroPrimary}`,
      contentUrl: `${SITE_URL}${seoImages.heroPrimary}`,
      caption: seoImageAlts.heroPrimary,
    },
    nationality: { "@type": "Country", name: personFacts.nationality, sameAs: "https://www.wikidata.org/wiki/Q39" },
    homeLocation: { "@type": "Place", name: "Graubünden, Schweiz", containedInPlace: graubuenden },
    jobTitle: ["Professional Golfer", "Swiss PGA Playing Professional"],
    hasOccupation: {
      "@type": "Occupation",
      name: "Professional Golfer",
      occupationLocation: { "@type": "Country", name: "Schweiz" },
      description: `Playing Professional seit ${personFacts.proSince}; 2026 Pro Golf Tour, ab 2027 HotelPlanner Tour.`,
    },
    memberOf: [
      {
        "@type": "OrganizationRole",
        memberOf: { "@id": ORG_IDS.swissPga },
        roleName: "Playing Professional",
      },
      {
        "@type": "OrganizationRole",
        memberOf: { "@id": ORG_IDS.swissPga },
        roleName: "Board Member und Head of Playing Professional Commission",
        startDate: "2026",
      },
      { "@id": ORG_IDS.swissGolfTeam },
      { "@id": ORG_IDS.homeClub },
    ],
    affiliation: [{ "@id": ORG_IDS.proGolfTour }, { "@id": ORG_IDS.swissGolf }],
    award: personAwards,
    knowsAbout: [
      "Golf",
      "Profigolf",
      "Pro Golf Tour",
      "HotelPlanner Tour",
      "DP World Tour",
      "Golf-Schwunganalyse (3D)",
      "Leistungssport",
      "Spitzensport-Management",
      "Sportsponsoring",
      "Informatik",
      "App-Entwicklung",
    ],
    sponsor: sponsorNodes(),
    funder: { "@id": ORG_IDS.goennervereinigung },
    sameAs: personSameAsUrls,
    subjectOf: keyPressReports().map((item) => ({
      "@type": "NewsArticle",
      headline: item.title,
      url: item.href,
      ...(item.sortYear > 0 ? { datePublished: String(item.sortYear) } : {}),
      publisher: { "@type": "Organization", name: item.outletLabel },
    })),
  };
}

export function buildWebsiteJsonLd(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "Mauro Gilardi",
    alternateName: ["Gilardi Golf", "maurogilardi.ch"],
    description:
      "Offizielle Website von Mauro Gilardi, Schweizer Profigolfer und Swiss PGA Playing Professional: Tour-Updates, Erfolge, Gönner und Sponsoring.",
    inLanguage: "de-CH",
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    copyrightHolder: { "@id": PERSON_ID },
  };
}

/** Ein `@graph` für das Root-Layout */
export function buildRootGraph(): Node {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPersonJsonLd(), buildWebsiteJsonLd(), ...buildOrganizationNodes()],
  };
}
