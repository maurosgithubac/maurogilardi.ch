/**
 * SEO title builder — ABB-style: [Primary topic] | [Brand]
 * Target ~50–58 characters; primary keyword front-loaded.
 */

export const SEO_BRAND = {
  person: "Mauro Gilardi",
  brand: "Gilardi Golf",
  /** Standard suffix for inner pages & blog posts */
  suffix: "Mauro Gilardi · Gilardi Golf",
  /** Shorter suffix when space is tight */
  suffixShort: "Mauro Gilardi | Gilardi Golf",
  geo: "Graubünden",
  region: "Golf Schweiz",
} as const;

const DEFAULT_MAX = 58;

function truncateAtWord(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const slice = trimmed.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.5) return slice.slice(0, lastSpace);
  return slice;
}

/** Inner page / blog: `Topic | Mauro Gilardi · Gilardi Golf` */
export function buildSeoTitle(
  primary: string,
  options?: {
    suffix?: string;
    maxLength?: number;
    separator?: " | " | " – ";
  },
): string {
  const suffix = options?.suffix ?? SEO_BRAND.suffix;
  const maxLen = options?.maxLength ?? DEFAULT_MAX;
  const sep = options?.separator ?? " | ";
  const primaryClean = primary.trim();

  const full = `${primaryClean}${sep}${suffix}`;
  if (full.length <= maxLen) return full;

  const budget = maxLen - sep.length - suffix.length;
  const shortPrimary = truncateAtWord(primaryClean, Math.max(budget, 12));
  return `${shortPrimary}${sep}${suffix}`;
}

/** Homepage: brand + person first (corporate pattern) */
export function buildHomeSeoTitle(
  primary = "Mauro Gilardi",
  secondary = "Gilardi Golf – Swiss PGA Professional",
): string {
  const full = `${primary} | ${secondary}`;
  if (full.length <= DEFAULT_MAX) return full;
  return truncateAtWord(full, DEFAULT_MAX);
}
