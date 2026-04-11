/**
 * Externe Berichte und Profile — manuell gepflegt.
 * Neue Treffer: Eintrag hinzufügen, Outlet-Gruppe wählen, Link prüfen.
 */

export type PressOutletId =
  | "swiss-golf"
  | "golf-ch"
  | "golf-de"
  | "suedostschweiz"
  | "progolf-tour"
  | "swiss-pga"
  | "swiss-golf-talents"
  | "weitere";

export type PressOutlet = {
  id: PressOutletId;
  label: string;
  /** Kurz für Screenreader / SEO */
  description: string;
};

export const pressOutlets: PressOutlet[] = [
  {
    id: "swiss-golf",
    label: "Swiss Golf",
    description: "Verband, News & Magazin",
  },
  {
    id: "golf-ch",
    label: "Golf.ch",
    description: "Schweizer Golf-Portal",
  },
  {
    id: "golf-de",
    label: "Golf.de",
    description: "Golf in Deutschland / Pro-Touren",
  },
  {
    id: "suedostschweiz",
    label: "Südostschweiz",
    description: "Regionalsport Graubünden",
  },
  {
    id: "progolf-tour",
    label: "Pro Golf Tour",
    description: "Offizielle Tour & Presse",
  },
  {
    id: "swiss-pga",
    label: "Swiss PGA",
    description: "Verband der Golflehrer & Profispieler CH",
  },
  {
    id: "swiss-golf-talents",
    label: "Friends of Swiss Golf Talents",
    description: "Förderung Nachwuchs & Elite",
  },
  {
    id: "weitere",
    label: "Weitere",
    description: "Portale & Daten",
  },
];

export type PressItem = {
  title: string;
  href: string;
  outletId: PressOutletId;
  /** z. B. «2025» oder «Juli 2025» wenn bekannt */
  period?: string;
  /** Eine Zeile Kontext */
  dek?: string;
};

/** Rohliste — Reihenfolge egal; Anzeige sortiert nach Jahr (neu zuerst). */
export const pressItems: PressItem[] = [
  {
    outletId: "swiss-golf",
    title: "Chiara Sola und Mauro Gilardi gewinnen die Swiss Golf Open Championship",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1661-chiara-sola-und-mauro-gilardi-gewinnen-die-swiss-golf-open-championship/",
    period: "2025",
    dek: "Offizieller Verbandsartikel — Platzrekord 64 (−8), Gesamt −21 und 12 Schläge Vorsprung in Domat/Ems.",
  },
  {
    outletId: "swiss-golf",
    title: "Swiss Challenge: Mauro Gilardi auf Platz 17",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1654-swiss-challenge-mauro-gilardi-auf-platz-17/",
    period: "2025",
    dek: "HotelPlanner Tour (Challenge-Tour-Feeder) in Sempach — bis dahin bestes Ergebnis auf dieser Stufe.",
  },
  {
    outletId: "swiss-golf",
    title: "Pro Golf Tour: Drittes Top-10 der Saison für Mauro Gilardi",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1725-pro-golf-tour-drittes-top-10-der-saison-fuer-mauro-gilardi/",
    period: "2025",
    dek: "Stippelberg Open — erneut Top-10, Order of Merit im Fokus.",
  },
  {
    outletId: "swiss-golf",
    title: "Südostschweiz: «Vor dem Duell mit den Weltbesten»",
    href: "https://swissgolf.ch/de/news-magazin/news/details/377-suedostschweiz-vor-dem-duell-mit-den-weltbesten/",
    period: "2021",
    dek: "Swiss Golf verweist auf die Südostschweiz: Wildcard zum Omega European Masters in Crans-Montana als Amateur.",
  },
  {
    outletId: "golf-ch",
    title: "Mauro Gilardi feiert ersten Profisieg",
    href: "https://www.golf.ch/de/news/pro-golf-tour/mauro-gilardi-feiert-ersten-profisieg",
    period: "2025",
    dek: "The Cuber Open (Pro Golf Tour), Finale 63 (−8).",
  },
  {
    outletId: "golf-ch",
    title: "Mauro Gilardi wieder bester Schweizer",
    href: "https://www.golf.ch/de/news/hotelplaner-tour/mauro-gilardi-wieder-bester-schweizer",
    period: "2025",
    dek: "HotelPlanner Tour — stärkstes Schweizer Resultat im Feld.",
  },
  {
    outletId: "golf-ch",
    title: "Swiss Golf Open Championship: Zwei klare Sieger",
    href: "https://www.golf.ch/de/news/swiss-golf/swiss-golf-open-championship-zwei-klare-sieger",
    period: "2025",
    dek: "Golf.ch zum Meisterschafts-Wochenende in Domat/Ems.",
  },
  {
    outletId: "golf-ch",
    title: "Mauro Gilardi signe son deuxième meilleur résultat de la saison",
    href: "https://www.golf.ch/fr/nouvelles/pro-golf-tour/mauro-gilardi-signe-son-deuxieme-meilleur-resultat-de-la-saison",
    period: "2025",
    dek: "Golf.ch (Französisch) — Staan Open, zweitbestes Saisonresultat.",
  },
  {
    outletId: "golf-de",
    title: "Macionga Dritter bei Gilardis irrer Aufholjagd",
    href: "https://www.golf.de/sport/profi-touren/pro-golf-tour/artikel/macionga-dritter-bei-gilardis-irrer-aufholjagd.html",
    period: "2025",
    dek: "Golf.de — Cuber Open, Wetterunterbrechung, Aufholjagd mit 63 am Finaltag.",
  },
  {
    outletId: "suedostschweiz",
    title: "Curling-Vizeweltmeisterin verhilft Mauro Gilardi als Caddie zum Erfolg",
    href: "https://www.suedostschweiz.ch/regionalsport/golf-buendner-golfer-mit-top-resultat-curling-vizeweltmeisterin-verhilft-mauro-gilardi-als-caddie-zum-erfolg",
    period: "2025",
    dek: "Swiss Challenge / HotelPlanner — Caddie-Story und Region.",
  },
  {
    outletId: "progolf-tour",
    title: "The Cuber Open 2025: Gilardi celebrates his first title",
    href: "https://www.progolftour.de/press-detail/gilardi-celebrates-his-first-title",
    period: "2025",
    dek: "Offizielle Pressemitteilung der Pro Golf Tour (englisch).",
  },
  {
    outletId: "progolf-tour",
    title: "The Cuber Open 2025 — Turnier & Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/the-cuber-open-2025",
    period: "2025",
    dek: "Leaderboard und Eventinfos auf der Tour-Website.",
  },
  {
    outletId: "progolf-tour",
    title: "Spielerprofil (Order of Merit, Starts)",
    href: "https://www.progolftour.de/spieler-profil/55943",
    dek: "Tour-Profil mit Saisondaten.",
  },
  {
    outletId: "swiss-pga",
    title: "Spielerprofil Swiss PGA",
    href: "https://swisspga.ch/spieler-detail/156?year=2025",
    period: "2025",
    dek: "Ranking, Turniere und Profil beim Verband.",
  },
  {
    outletId: "swiss-pga",
    title: "Order of Merit Herren",
    href: "https://swisspga.ch/order-of-merit",
    dek: "Aktuelle Wertung — Platzierung im Schweizer Profifeld.",
  },
  {
    outletId: "swiss-golf-talents",
    title: "Mauro Gilardi — Talentportrait",
    href: "https://friendsofswissgolftalents.ch/talent/mauro-gilardi/",
    dek: "Förderprogramm, Werdegang, Amateur-Erfolge und Ziele.",
  },
  {
    outletId: "weitere",
    title: "Mauro Gilardi gewinnt auf der Pro Golf Tour",
    href: "https://golfhome.ch/mauro-gilardi-gewinnt-auf-der-pro-golf-tour/",
    period: "2025",
    dek: "Golfhome.ch — Bericht zum Cuber-Open-Sieg.",
  },
  {
    outletId: "weitere",
    title: "Spielerprofil & Statistik (Data Golf)",
    href: "https://datagolf.com/player-profiles?dg_id=27006",
    dek: "Internationale Strokes-Gained- und Turnierübersicht (englisch).",
  },
];

export type EnrichedPressItem = PressItem & {
  outletLabel: string;
  /** Für Sortierung (Jahreszahl aus period oder 0) */
  sortYear: number;
};

function parseSortYear(period?: string): number {
  if (!period) return 0;
  const m = period.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : 0;
}

export function enrichAndSortPressItems(): EnrichedPressItem[] {
  const labelById = new Map(pressOutlets.map((o) => [o.id, o.label] as const));
  const enriched = pressItems.map((item) => ({
    ...item,
    outletLabel: labelById.get(item.outletId) ?? item.outletId,
    sortYear: parseSortYear(item.period),
  }));
  return enriched.sort((a, b) => {
    if (b.sortYear !== a.sortYear) return b.sortYear - a.sortYear;
    return a.title.localeCompare(b.title, "de");
  });
}

export function pressItemsByOutlet(): Map<PressOutletId, PressItem[]> {
  const map = new Map<PressOutletId, PressItem[]>();
  for (const o of pressOutlets) {
    map.set(o.id, []);
  }
  for (const item of pressItems) {
    map.get(item.outletId)?.push(item);
  }
  return map;
}

export function pressStats(items: EnrichedPressItem[]) {
  const years = items.map((i) => i.sortYear).filter((y) => y > 0);
  const yearMin = years.length ? Math.min(...years) : null;
  const yearMax = years.length ? Math.max(...years) : null;
  const outletCount = new Set(items.map((i) => i.outletId)).size;
  return {
    articleCount: items.length,
    outletCount,
    yearSpan:
      yearMin != null && yearMax != null
        ? yearMin === yearMax
          ? `${yearMin}`
          : `${yearMin}–${yearMax}`
        : "—",
  };
}
