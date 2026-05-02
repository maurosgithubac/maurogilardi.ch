/** Öffentliche Social-Profile — eine Quelle für SEO, Structured Data und Footer */

export const socialProfiles = {
  instagram: {
    label: "Instagram",
    url: "https://www.instagram.com/gilardigolf/",
    handle: "gilardigolf",
  },
  linkedin: {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/mauro-gilardi-14a197124/",
  },
} as const;

/** Person `sameAs` — Social zuerst, plus etablierte Golf-URLs für Kontext */
export const personSameAs: string[] = [
  socialProfiles.instagram.url,
  socialProfiles.linkedin.url,
  "https://www.progolftour.de",
  "https://www.swissgolf.ch",
];
