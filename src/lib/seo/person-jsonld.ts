/** Person-, Athlete- und Entity-JSON-LD für Mauro Gilardi */

import { personSameAs } from "@/content/socialProfiles";
import { siteContent } from "@/content/siteContent";
import { SITE_URL, brandLogo, seoImageAlts, seoImages } from "@/lib/seo/constants";

export const PERSON_ID = `${SITE_URL}/#mauro-gilardi`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Person", "Athlete", "SportsPerson"],
    "@id": PERSON_ID,
    name: "Mauro Gilardi",
    alternateName: [
      "Mauro Gilardi Golf",
      "Mauro Gilardi Swiss PGA",
      "Mauro Gilardi Professional Golfer",
    ],
    description:
      "Mauro Gilardi ist ein Schweizer Golfprofi, Swiss PGA Professional, Playing Professional und Mitglied des Swiss Golf Teams. Aktiv auf der Pro Golf Tour in Europa als Tour Professional und Schweizer Spitzensportler.",
    url: SITE_URL,
    email: siteContent.contact.email,
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}${seoImages.heroPrimary}`,
      description: seoImageAlts.heroPrimary,
    },
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${brandLogo.path}`,
      description: brandLogo.alt,
    },
    nationality: {
      "@type": "Country",
      name: "Schweiz",
      sameAs: "https://www.wikidata.org/wiki/Q39",
    },
    birthPlace: {
      "@type": "Place",
      name: "Graubünden, Schweiz",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Graubünden",
        addressCountry: "CH",
      },
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
    jobTitle: [
      "Swiss PGA Professional",
      "Schweizer Golf Professional",
      "Professional Golfer",
      "Playing Professional",
      "Tour Professional",
      "Golf Coach",
      "Golf Referent",
      "Golf Event Host",
    ],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Swiss PGA Professional",
        occupationLocation: { "@type": "Country", name: "Schweiz" },
        description:
          "Professioneller Golfspieler auf der Pro Golf Tour (PGT), Swiss PGA zertifizierter Golf Professional und Playing Professional aus der Schweiz",
      },
      {
        "@type": "Occupation",
        name: "Golf Coach",
        occupationLocation: { "@type": "Country", name: "Schweiz" },
        description: "Golf Coaching, Performance Training und Golf Clinics in der Schweiz",
      },
      {
        "@type": "Occupation",
        name: "Golf Referent",
        occupationLocation: { "@type": "Country", name: "Schweiz" },
        description: "Referate zu Spitzensport, Leistungssport und High Performance",
      },
    ],
    sport: "Golf",
    athlete: {
      "@type": "SportsTeam",
      name: "Swiss Golf Team",
      url: "https://www.swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
    },
    memberOf: [
      { "@type": "SportsOrganization", name: "SwissPGA", url: "https://www.swisspga.ch" },
      {
        "@type": "SportsOrganization",
        name: "Swiss Golf Team",
        url: "https://www.swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
      },
      { "@type": "SportsOrganization", name: "Pro Golf Tour", url: "https://www.progolftour.de" },
      { "@type": "SportsOrganization", name: "Swiss Golf", url: "https://www.swissgolf.ch" },
    ],
    sponsor: [
      {
        "@type": "Organization",
        name: "Friends Of Swiss Golf Talents",
        url: "https://friendsofswissgolftalents.ch/",
      },
      { "@type": "Organization", name: "Spitzensport der Schweizer Armee" },
      { "@type": "Organization", name: "The Golfers Malans", url: "https://www.thegolfers.ch/" },
      { "@type": "Organization", name: "Casutt Druck & Werbetechnik", url: "https://www.casutt-gruppe.ch/" },
    ],
    knowsAbout: [
      "Golf",
      "Profigolf",
      "Swiss PGA",
      "Schweizer Golf",
      "Pro Golf Tour",
      "Playing Professional",
      "Golf Coaching",
      "Golf Performance Training",
      "Golf Events",
      "Golf Clinics",
      "Spitzensport",
      "Leistungssport",
      "Mental Training Golf",
      "Golf Referate",
      "Beat the Pro",
      "Corporate Golf Events",
    ],
    sameAs: personSameAs,
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
    description:
      "Offizielle Website von Mauro Gilardi, Swiss PGA Professional. Schweizer Golfprofi, Playing Professional, Golf Coach, Referent und Gastgeber von Golf Experiences.",
    inLanguage: "de-CH",
    author: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${brandLogo.path}`,
      description: brandLogo.alt,
    },
  };
}

export function buildProfessionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#professional-services`,
    name: "Mauro Gilardi – Golf Coaching, Events & Referate",
    description:
      "Golf Coaching Schweiz, Golf Events, Beat the Pro, Golf Clinics und Spitzensport-Referate mit Mauro Gilardi, Swiss PGA Professional.",
    url: SITE_URL,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Graubünden, Schweiz" },
      { "@type": "AdministrativeArea", name: "Ostschweiz, Schweiz" },
      { "@type": "Country", name: "Schweiz" },
    ],
    provider: { "@id": PERSON_ID },
    serviceType: [
      "Golf Coaching",
      "Golf Performance Training",
      "Golf Events",
      "Golf Clinics",
      "Beat the Pro",
      "Corporate Golf Events",
      "Spitzensport Referate",
      "Keynote Speaker Sport",
    ],
    knowsAbout: [
      "Golf Coach Schweiz",
      "Golf Event Schweiz",
      "Golf Referent Schweiz",
      "Playing Professional",
      "Swiss PGA Professional",
    ],
  };
}
