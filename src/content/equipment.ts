/**
 * Bag-Übersicht — Schlägerfotos unter public/brand-assets/images/ (z. B. driver.png).
 */

export type EquipmentBagItem = {
  id: string;
  /** z. B. Driver, Holz 3, Eisen 4–P */
  slot: string;
  /** Kopf + Loft in einer Zeile */
  head: string;
  /** Schaft / Flex (optional) */
  shaft?: string;
  imageSrc?: string | null;
};

/** Reihenfolge: vom Driver bis zum Putter */
export const equipmentBag: EquipmentBagItem[] = [
  {
    id: "driver",
    slot: "Driver",
    head: "Callaway Elyte · 9°",
    shaft: "Fujikura Ventus Black 6-X",
    imageSrc: "/brand-assets/images/driver.png",
  },
  {
    id: "wood3",
    slot: "Holz 3",
    head: "Callaway Ai Smoke HL · 16.5°",
    shaft: "Fujikura Ventus Black 7-X",
    imageSrc: "/brand-assets/images/holz3.png",
  },
  {
    id: "rescue",
    slot: "Rescue 3",
    head: "Callaway Ai Smoke · 18°",
    shaft: "Schaft — folgt",
    imageSrc: "/brand-assets/images/rescue.png",
  },
  {
    id: "iron2",
    slot: "Eisen 2",
    head: "Callaway X Forged Driving Iron · 18°",
    shaft: "Project X Smoke · 80 g · Stiff",
    imageSrc: "/brand-assets/images/drivingiron.png",
  },
  {
    id: "iron3",
    slot: "Eisen 3",
    head: "Titleist T150",
    shaft: "N.S. Pro Modus 3 Tour 105 · X-Stiff",
    imageSrc: "/brand-assets/images/t150.png",
  },
  {
    id: "iron4-p",
    slot: "Eisen 4–P",
    head: "Titleist T100",
    shaft: "N.S. Pro Modus 3 Tour 105 · X-Stiff",
    imageSrc: "/brand-assets/images/t100.png",
  },
  {
    id: "wedge50",
    slot: "Wedge 50°",
    head: "Titleist Vokey SM11 · 50° · Bounce 05",
    shaft: "N.S. Pro Modus 3 · X-Stiff",
    imageSrc: "/brand-assets/images/vokey.png",
  },
  {
    id: "wedge5458",
    slot: "Wedges 54° / 58°",
    head: "Titleist Vokey SM11",
    shaft: "Stahl-Wedge-Schaft",
    imageSrc: "/brand-assets/images/vokey.png",
  },
  {
    id: "putter",
    slot: "Putter",
    head: "Odyssey Ai-One Milled",
    shaft: "Rossie-V T",
    imageSrc: "/brand-assets/images/putter.png",
  },
];

export const equipmentPartnerCallouts = {
  callaway: {
    name: "Callaway",
    tagline: "Driver, Hölzer, Rescue und langen Eisen — Performance auf der Tour.",
    href: "https://www.callawaygolf.com",
    cta: "Zu Callaway",
  },
  titleist: {
    name: "Titleist",
    tagline: "Eisen, Wedges und Ball — präzise Werkzeuge für das Scoring.",
    href: "https://www.titleist.com",
    cta: "Zu Titleist",
  },
  theGolfers: {
    name: "TheGolfers",
    tagline: "Fitting & Schaftwahl — damit Kopf und Schaft zum Schwung passen.",
    href: "https://www.thegolfers.ch",
    cta: "Zu TheGolfers",
  },
} as const;

/** Logo wie auf der Sponsoren-Seite: public/brand-assets/images/Sponsors/1_TheGolfers.png */
export const equipmentTheGolfersMalans = {
  kicker: "The Golfer's Malans",
  paragraphs: [
    "Mit The Golfer's Malans in Malans kläre ich Schläger, Schäfte und Material — mit ehrlicher Beratung und dem Raum, Setups zu testen, bevor sie bei mir ins Bag kommen.",
    "So bleibt mein Equipment stimmig für Daten, Schwung und das Gefühl, das ich unter Druck brauche. Suchst du ein Fitting? Da bist du bei ihnen gut aufgehoben.",
  ],
  imageSrc: "/brand-assets/images/Sponsors/1_TheGolfers.png",
  imageAlt: "The Golfer's Malans — Shop und Fitting in Malans",
  websiteHref: equipmentPartnerCallouts.theGolfers.href,
  websiteLabel: "TheGolfers.ch",
} as const;
