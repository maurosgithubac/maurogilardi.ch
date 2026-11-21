/**
 * Varianten für Rechnungs-Mails und PDF: Gönner (MG-Unterstützung), Partner und Sponsoren,
 * jeweils für neue und bestehende Mitglieder. Reine Texte, ohne Server-Abhängigkeiten.
 * Bei Sponsoren und Partnern kommt das Wort „Gönner“ nirgends vor.
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
      itemTitle: `MG-Unterstützung · ${tier}`,
      intro: neu
        ? "Es freut mich sehr, dich in meiner Gönnervereinigung aufnehmen zu dürfen. Danke für deine Unterstützung auf meinem Weg auf die DP World Tour."
        : `Schön, dass du auch in der Saison ${season} wieder Teil meiner Gönnervereinigung bleibst. Deine Treue bedeutet mir sehr viel, gerade in den intensiven Turnierwochen.`,
      body: neu
        ? "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich, dich bald auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems zu sehen."
        : "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich, dich auch in dieser Saison an meiner Seite zu haben und dich bald auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems zu sehen.",
      showGoennerNotice: true,
    };
  }

  if (art === "partner") {
    return {
      subject: `Zusammenarbeit ${season} · ${first}`,
      itemTitle: `MG-Unterstützung · Saison ${season}`,
      intro: neu
        ? "Vielen Dank für dein Interesse an einer Partnerschaft mit mir. Ich freue mich sehr auf die Zusammenarbeit und darauf, gemeinsam etwas aufzubauen."
        : "Schön, dass du mich auch in der kommenden Saison wieder unterstützt und mich auf meinem Weg begleitest. Deine Treue bedeutet mir sehr viel, gerade in den immer intensiver werdenden Turnierwochen.",
      body: neu
        ? "Die Rechnung als PDF ist dieser Mail angehängt. Gerne bespreche ich mit dir die Details und die Sichtbarkeit für dein Unternehmen."
        : "Die Rechnung als PDF ist dieser Mail angehängt. Ich freue mich, dich in der kommenden Saison wieder an meiner Seite zu haben.",
      showGoennerNotice: false,
    };
  }

  // Sponsoring
  return {
    subject: `Zusammenarbeit ${season} · ${first}`,
    itemTitle: `MG-Sponsoring · Saison ${season}`,
    intro: neu
      ? "Herzlichen Dank für dein Interesse an einem Sponsoring mit mir. Ich freue mich sehr, dass du dich für eine Zusammenarbeit entschieden hast. Dein Engagement ermöglicht es mir, meinen Weg auf die DP World Tour konsequent zu verfolgen, und ich gebe mein Bestes, damit sich die Partnerschaft für dich und dein Unternehmen lohnt."
      : "Herzlichen Dank, dass du mich auch in der kommenden Saison als Sponsor begleitest. Deine Unterstützung ist für mich ein wichtiger Rückhalt, gerade in den immer intensiver werdenden Turnierwochen. Ich schätze unsere Zusammenarbeit sehr und freue mich auf eine weitere erfolgreiche Saison zusammen.",
    body: "Die Rechnung als PDF ist dieser Mail angehängt. Gerne bespreche ich mit dir die Details und die Sichtbarkeit für dein Unternehmen.",
    showGoennerNotice: false,
  };
}
