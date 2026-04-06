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
  tourPageUrl?: string;
  livescoringUrl?: string;
};

const _pgtSeasonEvents2026Raw: PgtSeasonEvent[] = [
  {
    id: "golf-mad-open-2026",
    name: "Golf Mad Open 2026",
    start: "2026-02-19",
    end: "2026-02-21",
    where: "Lykia Golf Links, Türkei",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/golf-mad-open-2026",
  },
  {
    id: "golf-mad-challenge-2026",
    name: "Golf Mad Challenge 2026",
    start: "2026-02-23",
    end: "2026-02-25",
    where: "Lykia Golf Links, Türkei",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/golf-mad-challenge-2026",
  },
  {
    id: "red-sea-ain-sokhna-open-2026-april",
    name: "Red Sea Ain Sokhna Open 2026 (April)",
    start: "2026-04-07",
    end: "2026-04-09",
    where: "Golf Club Ain Sokhna, Ägypten",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/red-sea-ain-sokhna-open-2026-april",
  },
  {
    id: "red-sea-egyptian-classic-2026-april",
    name: "Red Sea Egyptian Classic 2026 (April)",
    start: "2026-04-12",
    end: "2026-04-14",
    where: "Red Sea, Ägypten",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/red-sea-egyptian-classic-2026-april",
  },
  {
    id: "haugschlag-noe-open-2026",
    name: "Haugschlag NÖ Open by perfect eagle 2026",
    start: "2026-04-28",
    end: "2026-04-30",
    where: "Haugschlag, Niederösterreich",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/haugschlag-n%C3%B6-open-by-perfect-eagle-2026",
  },
  {
    id: "madaef-golfs-open-2026",
    name: "Madaëf Golfs Open 2026",
    start: "2026-05-10",
    end: "2026-05-12",
    where: "Frankreich",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/mada%C3%ABf-golfs-open-2026",
  },
  {
    id: "pro-golf-tour-ocean-2026",
    name: "Pro Golf Tour Océan 2026",
    start: "2026-05-14",
    end: "2026-05-16",
    where: "Frankreich",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/pro-golf-tour-oc%C3%A9an-2026",
  },
  {
    id: "the-sedin-open-slovakia-2026",
    name: "The Sedin Open by On the Tee Slovakia 2026",
    start: "2026-05-27",
    end: "2026-05-29",
    where: "Slowakei",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/the-sedin-open-by-on-the-tee-slovakia-2026",
  },
  {
    id: "raiffeisen-pgt-st-poelten-2026",
    name: "Raiffeisen Pro Golf Tour St. Pölten 2026",
    start: "2026-06-02",
    end: "2026-06-04",
    where: "St. Pölten, Österreich",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/raiffeisen-pro-golf-tour-st-p%C3%B6lten-2026",
  },
  {
    id: "vcg-bodensee-open-2026",
    name: "VcG Bodensee Open 2026",
    start: "2026-06-09",
    end: "2026-06-11",
    where: "Bodensee, Deutschland",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/vcg-bodensee-open-2026",
  },
  {
    id: "vcg-koeln-open-2026",
    name: "VcG Köln Open 2026",
    start: "2026-06-16",
    end: "2026-06-18",
    where: "Köln, Deutschland",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/vcg-k%C3%B6ln-open-2026",
  },
  {
    id: "vcg-neuhof-open-2026",
    name: "VcG Neuhof Open 2026",
    start: "2026-06-23",
    end: "2026-06-25",
    where: "Neuhof, Deutschland",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/vcg-neuhof-open-2026",
  },
  {
    id: "gradi-polish-open-2026",
    name: "Gradi Polish Open by Emeralld 2026",
    start: "2026-07-01",
    end: "2026-07-03",
    where: "Polen",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/gradi-polish-open-2026",
  },
  {
    id: "the-cuber-open-2026",
    name: "The Cuber Open 2026",
    start: "2026-07-21",
    end: "2026-07-23",
    where: "Deutschland",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/the-cuber-open-2026",
  },
  {
    id: "hormeta-pgt-bonmont-2026",
    name: "Hormeta Pro Golf Tour Bonmont 2026",
    start: "2026-07-27",
    end: "2026-07-29",
    where: "Golf Club de Bonmont, Schweiz",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/hormeta-pro-golf-tour-bonmont-2026",
  },
  {
    id: "staan-open-2026",
    name: "Staan Open 2026",
    start: "2026-08-13",
    end: "2026-08-15",
    where: "Niederlande",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/staan-open-2026",
  },
  {
    id: "gelpenberg-open-2026",
    name: "Gelpenberg Open 2026",
    start: "2026-08-19",
    end: "2026-08-21",
    where: "Deutschland",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/gelpenberg-open-2026",
  },
  {
    id: "stippelberg-open-2026",
    name: "Stippelberg Open 2026",
    start: "2026-08-25",
    end: "2026-08-27",
    where: "Belgien",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/stippelberg-open-2026",
  },
  {
    id: "the-iron-duke-belgian-open-2026",
    name: "The Iron Duke Belgian Open 2026",
    start: "2026-09-08",
    end: "2026-09-10",
    where: "Belgien",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/the-iron-duke-belgian-open-2026",
  },
  {
    id: "cleydael-open-2026",
    name: "Cleydael Open 2026",
    start: "2026-09-15",
    end: "2026-09-17",
    where: "Belgien",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/cleydael-open-2026",
  },
  {
    id: "hulencourt-masters-grand-final-2026",
    name: "Hulencourt Masters Pro Golf Tour Grand Final 2026",
    start: "2026-09-29",
    end: "2026-10-01",
    where: "Hulencourt, Belgien",
    tourPageUrl: "https://www.progolftour.de/pro-golf-tour/hulencourt-masters-pro-golf-tour-grand-final-2026",
  },
];

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

const UPCOMING_PGT_EVENTS_LIMIT = 4;

/** Noch nicht beendete Turniere, chronologisch — maximal `limit` (Standard: nächste 4). */
export function getUpcomingPgtSeasonEvents(now: Date, limit = UPCOMING_PGT_EVENTS_LIMIT): PgtSeasonEvent[] {
  const t = dayStart(now);
  const upcoming = pgtSeasonEvents2026.filter((ev) => {
    const end = dayStart(new Date(`${ev.end}T12:00:00`));
    return end >= t;
  });
  return upcoming.slice(0, limit);
}

export { UPCOMING_PGT_EVENTS_LIMIT };

export function livescoringLinkForEvent(ev: PgtSeasonEvent): string {
  return ev.livescoringUrl ?? PRO_GOLF_TOUR_LIVESCORING_URL;
}
