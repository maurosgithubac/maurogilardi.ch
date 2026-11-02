/**
 * Pro Golf Tour — Saisontermine 2026 (laut offiziellem Kalender).
 * Kalender: https://www.progolftour.de/turniere
 * Ohne Qualifying School I/II (Oktober).
 * Livescoring: https://www.progolftour.de/livescoring
 */

export const PRO_GOLF_TOUR_TURNIERE_URL = "https://www.progolftour.de/turniere";
export const PRO_GOLF_TOUR_LIVESCORING_URL = "https://www.progolftour.de/livescoring";

export type PgtSeasonEvent = {
  id: string;
  name: string;
  /** YYYY-MM-DD (lokaler Kalendertag) */
  start: string;
  end: string;
  where: string;
  /** Standard: Turnier. "camp" = Trainingscamp, zählt nicht als Turnier. */
  kind?: "turnier" | "camp";
  tourPageUrl?: string;
  livescoringUrl?: string;
};

const _pgtSeasonEvents2026Raw: PgtSeasonEvent[] = [];

export const pgtSeasonEvents2026: PgtSeasonEvent[] = [..._pgtSeasonEvents2026Raw].sort((a, b) =>
  a.start.localeCompare(b.start),
);

export function formatPgtEventDateRange(ev: PgtSeasonEvent): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const s = new Date(`${ev.start}T12:00:00`);
  const e = new Date(`${ev.end}T12:00:00`);
  const a = s.toLocaleDateString("de-CH", opts);
  const b = e.toLocaleDateString("de-CH", opts);
  return a === b ? a : `${a} – ${b}`;
}

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function getPgtEventLiveOnDate(now: Date): PgtSeasonEvent | null {
  const t = dayStart(now);
  for (const ev of pgtSeasonEvents2026) {
    const s = dayStart(new Date(ev.start + "T12:00:00"));
    const e = dayStart(new Date(ev.end + "T12:00:00"));
    if (t >= s && t <= e) return ev;
  }
  return null;
}

/** Noch nicht beendete Turniere, chronologisch. Mit `limit` wird gekürzt, sonst alle. */
export function getUpcomingPgtSeasonEvents(now: Date, limit?: number): PgtSeasonEvent[] {
  const t = dayStart(now);
  const upcoming = pgtSeasonEvents2026.filter((ev) => {
    const end = dayStart(new Date(`${ev.end}T12:00:00`));
    return end >= t;
  });
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export function livescoringLinkForEvent(ev: PgtSeasonEvent): string {
  return ev.livescoringUrl ?? PRO_GOLF_TOUR_LIVESCORING_URL;
}
