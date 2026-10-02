/**
 * SEO title builder — Muster: [Primäres Keyword] | [Marke]
 * Ziel ≤ 60 Zeichen, Keyword vorne, Marke hinten.
 *
 * Wichtig: Der primäre Teil wird NIE mitten in einer Phrase abgeschnitten
 * (früherer Bug: «Endspurt zum Aufstieg in | …»). Ist der Platz knapp, wird
 * zuerst die Marke gekürzt und notfalls ganz weggelassen.
 */

export const SEO_BRAND = {
  person: "Mauro Gilardi",
  brand: "Gilardi Golf",
  /** Standard-Suffix für Unterseiten mit kurzem Keyword */
  suffix: "Mauro Gilardi · Gilardi Golf",
  /** Kurzes Suffix, wenn das Keyword länger ist */
  suffixShort: "Mauro Gilardi",
  geo: "Graubünden",
  region: "Golf Schweiz",
} as const;

export const SEO_TITLE_MAX = 60;

/**
 * Inner page / blog: `Topic | Marke`.
 * Reihenfolge: langes Suffix → kurzes Suffix → nur Topic (ungekürzt).
 */
export function buildSeoTitle(
  primary: string,
  options?: {
    /** Bevorzugtes Suffix; Default: `Mauro Gilardi · Gilardi Golf` */
    suffix?: string;
    maxLength?: number;
    separator?: " | " | " – ";
  },
): string {
  const maxLen = options?.maxLength ?? SEO_TITLE_MAX;
  const sep = options?.separator ?? " | ";
  const primaryClean = primary.replace(/\s+/g, " ").trim();
  const suffixes = [options?.suffix ?? SEO_BRAND.suffix, SEO_BRAND.suffixShort];

  for (const suffix of suffixes) {
    const full = `${primaryClean}${sep}${suffix}`;
    if (full.length <= maxLen) return full;
  }
  return primaryClean;
}

/** Homepage: Person zuerst, dann Positionierung und Marke */
export function buildHomeSeoTitle(
  primary = "Mauro Gilardi – Schweizer Golfprofi",
  secondary: string = SEO_BRAND.brand,
): string {
  return `${primary} | ${secondary}`;
}
