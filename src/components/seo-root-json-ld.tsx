/** Root Structured Data — Person + WebSite (kein Layout-UI) */

import { personSameAs } from "@/content/socialProfiles";

const SITE = "https://www.maurogilardi.ch";

export function SeoRootJsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#mauro-gilardi`,
    name: "Mauro Gilardi",
    alternateName: ["Mauro Gilardi Golf", "Mauro Gilardi SwissPGA"],
    description:
      "Mauro Gilardi ist ein professioneller Golfspieler aus Graubünden, Schweiz. SwissPGA Golf Professional und Mitglied des Swiss Golf Teams, aktiv auf der Pro Golf Tour (PGT) in Europa.",
    url: SITE,
    image: {
      "@type": "ImageObject",
      url: `${SITE}/brand-assets/images/1L9A8795.JPG`,
      description: "Mauro Gilardi – Schweizer Golf Professional auf dem Golfplatz",
    },
    nationality: {
      "@type": "Country",
      name: "Schweiz",
      sameAs: "https://www.wikidata.org/wiki/Q39",
    },
    homeLocation: {
      "@type": "Place",
      name: "Graubünden, Schweiz",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Graubünden",
        addressCountry: "CH",
      },
    },
    jobTitle: ["Golf Professional", "SwissPGA Pro", "Schweizer Golf Professional", "Tour Professional"],
    hasOccupation: {
      "@type": "Occupation",
      name: "Golf Professional",
      occupationLocation: { "@type": "Country", name: "Schweiz" },
      description:
        "Professioneller Golfspieler auf der Pro Golf Tour (PGT), SwissPGA zertifizierter Golf Professional aus der Schweiz",
    },
    memberOf: [
      { "@type": "SportsOrganization", name: "SwissPGA", url: "https://www.swisspga.ch" },
      {
        "@type": "SportsOrganization",
        name: "Swiss Golf Team",
        url: "https://www.swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
      },
      { "@type": "SportsOrganization", name: "Pro Golf Tour", url: "https://www.progolftour.de" },
    ],
    sponsor: [
      { "@type": "Organization", name: "Friends Of Swiss Golf Talents", url: "https://friendsofswissgolftalents.ch/" },
      { "@type": "Organization", name: "Spitzensport der Schweizer Armee" },
      { "@type": "Organization", name: "The Golfers Malans", url: "https://www.thegolfers.ch/" },
      { "@type": "Organization", name: "Casutt Druck & Werbetechnik", url: "https://www.casutt-gruppe.ch/" },
    ],
    knowsAbout: [
      "Golf",
      "Profigolf",
      "SwissPGA",
      "Schweizer Golf",
      "Pro Golf Tour",
      "Golf Schweiz",
      "Bündner Golf",
      "Golf Professional Ausbildung",
    ],
    sameAs: personSameAs,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "Mauro Gilardi – Schweizer Golf Professional",
    description:
      "Offizielle Website von Mauro Gilardi, SwissPGA Golf Professional aus Graubünden. Tour-Updates, Blog und Sponsoring-Informationen.",
    inLanguage: "de-CH",
    author: { "@id": `${SITE}/#mauro-gilardi` },
    about: { "@id": `${SITE}/#mauro-gilardi` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
