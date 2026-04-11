export type MembershipId = "birdie" | "eagle" | "albatros";

export type MembershipBenefit = { text: string; bold?: boolean };

export type MembershipTier = {
  id: MembershipId;
  title: string;
  priceChf: number;
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
];

export function membershipLabel(id: MembershipId): string {
  const t = goennerMembershipTiers.find((x) => x.id === id);
  return t ? `${t.title} (${t.priceChf}.- / Jahr)` : id;
}

/** Listenpreis der gewählten Stufe (CHF / Jahr) — z. B. als Vorschlag beim Erfassen des Betrags. */
export function membershipPriceChf(id: MembershipId | string): number {
  const t = goennerMembershipTiers.find((x) => x.id === id);
  return t?.priceChf ?? 0;
}
