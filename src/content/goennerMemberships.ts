/** Mindestbetrag für erledigte Sponsoring-Anfragen (Admin & API). */
export const GOENNER_SPONSORING_MIN_CHF = 2000;

export type MembershipId = "birdie" | "eagle" | "albatros" | "sponsoring";

export type MembershipBenefit = { text: string; bold?: boolean };

export type MembershipTier = {
  id: MembershipId;
  title: string;
  /** Listen- bzw. Mindestbetrag (CHF) — Admin-Vorschlag & Validierung Sponsoring */
  priceChf: number;
  /** Wenn gesetzt: Anzeige statt „{priceChf}.- / Jahr“ (z. B. Sponsoring) */
  priceLabel?: string;
  benefits: MembershipBenefit[];
};

export const goennerMembershipTiers: MembershipTier[] = [
  {
    id: "birdie",
    title: "Birdie Member",
    priceChf: 500,
    benefits: [
      { text: "Jährliches Gönnerturnier (SEP/OKT)" },
      { text: "Monatlicher Newsletter (Mail)" },
      { text: "WhatsApp Supporterchat" },
      { text: "Erwähnung auf Webseite" },
    ],
  },
  {
    id: "eagle",
    title: "Eagle Member",
    priceChf: 1000,
    benefits: [
      { text: "Jährliches Gönnerturnier (SEP/OKT)" },
      { text: "Monatlicher Newsletter (Mail)" },
      { text: "WhatsApp Supporterchat" },
      { text: "Erwähnung auf Webseite" },
      { text: "Golfklinik vor Gönnerturnier*", bold: true },
    ],
  },
  {
    id: "albatros",
    title: "Albatros Member",
    priceChf: 2000,
    benefits: [
      { text: "Jährliches Gönnerturnier (SEP/OKT)" },
      { text: "Monatlicher Newsletter (Mail)" },
      { text: "WhatsApp Supporterchat" },
      { text: "Erwähnung auf Webseite" },
      { text: "Golfklinik vor Gönnerturnier*", bold: true },
      { text: "Jährliche Golfrunde mit mir*", bold: true },
    ],
  },
  {
    id: "sponsoring",
    title: "Sponsoring",
    priceChf: GOENNER_SPONSORING_MIN_CHF,
    priceLabel: "≥ 2'000 CHF / Jahr (Mindestbetrag)",
    benefits: [
      { text: "Mindestbetrag ≥ 2'000 CHF pro Jahr", bold: true },
      { text: "Partnerschaft mit messbarer Sichtbarkeit für deine Marke" },
      { text: "Erwähnung auf Webseite & in der Kommunikation (je nach Paket)" },
      { text: "Individuelles Paket — Umfang und Leistungen stimmen wir persönlich ab", bold: true },
    ],
  },
];

export function isKnownMembershipId(id: string): id is MembershipId {
  return goennerMembershipTiers.some((t) => t.id === id);
}

export function inquiryTierLabel(id: string): string {
  return isKnownMembershipId(id) ? membershipLabel(id) : id;
}

export function tierPriceLine(tier: MembershipTier): string {
  return tier.priceLabel ?? `${tier.priceChf}.- / Jahr`;
}

export function tierCardCta(tier: MembershipTier): string {
  if (tier.id === "sponsoring") {
    return `Partnerschaft anfragen — ≥ 2'000 CHF / Jahr (Mindestbetrag)`;
  }
  return `Beitreten für ${tier.priceChf}.- / Jahr`;
}

export function membershipLabel(id: MembershipId): string {
  const t = goennerMembershipTiers.find((x) => x.id === id);
  if (!t) return id;
  const price = t.priceLabel ?? `${t.priceChf}.- / Jahr`;
  return `${t.title} (${price})`;
}

/** Listenpreis der gewählten Stufe (CHF / Jahr) — z. B. als Vorschlag beim Erfassen des Betrags. */
export function membershipPriceChf(id: MembershipId | string): number {
  const t = goennerMembershipTiers.find((x) => x.id === id);
  return t?.priceChf ?? 0;
}
