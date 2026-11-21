/**
 * Varianten für Rechnungs-Mails und PDF: Gönner, Sponsoren und Partner, jeweils für neue
 * und bestehende Mitglieder. Reine Texte, ohne Server-Abhängigkeiten (auch im Admin nutzbar).
 */

export type RechnungsArt = "goenner" | "sponsor" | "partner";
export type RechnungsStatus = "neu" | "bestand";

export type VariantTexts = {
  subject: string;
  itemTitle: string;
  intro: string;
  body: string;
  showGoennerNotice: boolean;
};

/** Art aus Anmeldung oder Profil ableiten. */
export function artFor(membershipId: string, category?: string | null): RechnungsArt {
  if (membershipId === "sponsoring" || category === "sponsor") return "sponsor";
  if (membershipId === "partner" || category === "partner") return "partner";
  return "goenner";
}

export function variantTexts(params: {
  art: RechnungsArt;
  status: RechnungsStatus;
  season: number;
  first: string;
  tier: string;
}): VariantTexts {
  const { art, status, season, first, tier } = params;
  const neu = status === "neu";

  if (art === "goenner") {
    return {
      subject: `Danke für deine Unterstützung, ${first}`,
      itemTitle: `Gönner-Mitgliedschaft ${tier}`,
      intro: neu
        ? "Es freut mich sehr, dich in meiner Gönnervereinigung aufnehmen zu dürfen. Danke für deine Unterstützung auf meinem Weg auf die DP World Tour."
        : `Schön, dass du auch in der Saison ${season} wieder Teil meiner Gönnervereinigung bleibst. Deine Treue bedeutet mir sehr viel, gerade in den intensiven Turnierwochen.`,
      body: neu
        ? "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich, dich bald auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems zu sehen."
        : "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich, dich auch in dieser Saison an meiner Seite zu haben und dich bald auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems zu sehen.",
      showGoennerNotice: true,
    };
  }

  const title = art === "partner" ? "Partnerschaft" : "Sponsoring";
  return {
    subject: `Zusammenarbeit ${season} · ${first}`,
    itemTitle: `${title} · Saison ${season}`,
    intro: neu
      ? art === "partner"
        ? "Vielen Dank für dein Interesse an einer Partnerschaft mit mir. Ich freue mich sehr auf die Zusammenarbeit."
        : "Vielen Dank für dein Interesse an einer Zusammenarbeit mit mir. Ich freue mich sehr auf den Start unseres gemeinsamen Weges."
      : `Vielen Dank, dass wir die Zusammenarbeit auch in der Saison ${season} weiterführen. Das bedeutet mir sehr viel.`,
    body: neu
      ? "Die Rechnung als PDF ist dieser Mail angehängt. Gerne bespreche ich mit dir die Details und die Sichtbarkeit für dein Unternehmen."
      : "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich auf eine weitere erfolgreiche Saison zusammen.",
    showGoennerNotice: false,
  };
}
