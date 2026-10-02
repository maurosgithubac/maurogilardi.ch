/**
 * Kampagne "Saison 2027 möglich machen" (Seite /2027, Instagram-Bio-Link).
 *
 * Fortschrittsbalken: erscheint nur, wenn `committedChf` gesetzt ist.
 * Nur echte, freigegebene Zahlen eintragen (öffentlich sichtbar).
 */
export const seasonCampaign = {
  year: 2027,
  goalChf: 75000,
  /** Bereits zugesagter Betrag für die Saison (CHF) — null = Balken ausgeblendet */
  committedChf: null as number | null,
};
