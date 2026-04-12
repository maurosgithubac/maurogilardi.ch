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
  | "dp-world-tour"
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
  {
    outletId: "swiss-golf",
    title: "Swiss Golf on Tour: Q-School und erste Profisaison",
    href: "https://swissgolf.ch/de/news-magazin/news/details/874-swiss-golf-on-tour-eine-woche-grosser-herausforderungen/",
    period: "2022",
    dek: "Oktober 2022: Rubrik «Swiss Golf on Tour» — Gilardi bestätigt die Q-School I in Verden (12. Platz, +3) und die Full Category auf der Pro Golf Tour für 2023.",
  },
  {
    outletId: "swiss-golf",
    title: "Armee-Spitzensport: neue Rekrutenschule-Jahrgänge (Verweis Magglingen)",
    href: "https://swissgolf.ch/de/news-magazin/news/details/982-foerderung-der-schweizer-armee-fuer-zwei-schweizer-golfer/",
    period: "2023",
    dek: "März 2023: Bericht zu neuen Förderathleten — erwähnt den vorherigen Jahrgang der Spitzensport-RS mit u. a. Mauro Gilardi und Cédric Gugler.",
  },
  {
    outletId: "progolf-tour",
    title: "Qualifying School I Verden 2022 — Ergebnisliste",
    href: "https://www.progolftour.de/tournament-details/qualifying-school-i-verden-2022",
    period: "2022",
    dek: "Offizielles Leaderboard der Tour — Gilardi geteilter 12. Rang (+3), Qualifikation für die Saison 2023.",
  },
  {
    outletId: "weitere",
    title: "European Amateur Team Championship 2020: Bronze für die Schweiz",
    href: "https://www.ega-golf.ch/content/germany-wins-european-amateur-team-championship-first-time",
    period: "2020",
    dek: "European Golf Association (September 2020): Bronzespiel — Mauro Gilardi gewinnt sein Single gegen Andrea Romano (Italien).",
  },
  {
    outletId: "weitere",
    title: "2020 European Amateur Team Championship (Überblick)",
    href: "https://en.wikipedia.org/wiki/2020_European_Amateur_Team_Championship",
    period: "2020",
    dek: "Wikipedia (englisch): Team-EM in Hilversum — Schweiz auf dem Podest, Einzel- und Mannschaftsergebnisse.",
  },
  {
    outletId: "weitere",
    title: "Official World Golf Ranking — Spielerprofil",
    href: "https://www.owgr.com/playerprofile/mauro-gilardi-27006",
    period: "2024",
    dek: "OWGR: Weltrangliste, Punkte und Turnierhistorie (fortlaufend aktualisiert).",
  },
  {
    outletId: "swiss-golf",
    title: "Bonmont Pro Golf Tour — Vorschau (FR)",
    href: "https://swissgolf.ch/fr/news-magazine/news/details/1697-tout-ce-quil-faut-savoir-sur-le-bonmont-pro-golf-tour/",
    period: "2025",
    dek: "Swiss Golf (Französisch): erste Austragung in Chéserex — erwähnt Mauro Gilardi nach dem Cuber-Open-Sieg.",
  },
  {
    outletId: "swiss-golf",
    title: "Alles Wissenswerte zur Swiss Challenge 2025",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1653-alles-wissenswerte-zur-swiss-challenge-2025/",
    period: "2025",
    dek: "Vorschau HotelPlanner Tour in Sempach — Startfeld und Rahmen zum Heim-Event.",
  },
  {
    outletId: "swiss-golf",
    title: "Pro Golf Tour: Ronan Kleu wird Zweiter in Ägypten",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1596-pro-golf-tour-ronan-kleu-wird-zweiter-in-aegypten/",
    period: "2025",
    dek: "Bericht zum Red Sea Ain Sokhna Open — u. a. Mauro Gilardi im Feld (36. Platz, −5).",
  },
  {
    outletId: "swiss-golf",
    title: "Challenge Tour: Jeremy Freiburghaus — bestes Saisonresultat",
    href: "https://swissgolf.ch/de/news-magazin/news/details/1461-challenge-tour-jeremy-freiburghaus-erzielt-sein-bestes-saisonresultat/",
    period: "2024",
    dek: "Black Desert NI Open — erwähnt den Cut von Mauro Gilardi (45. Platz).",
  },
  {
    outletId: "swiss-golf",
    title: "Swiss Golf Team — Kader & Profile",
    href: "https://swissgolf.ch/de/sport/leistungssport/swiss-golf-team/",
    period: "2026",
    dek: "Offizielle Teamseite — Profil Eintrag Mauro Gilardi (Pro seit 2022, Pro Golf Tour).",
  },
  {
    outletId: "swiss-golf",
    title: "Omega European Masters — Verbandsmeldung",
    href: "https://swissgolf.ch/de/news-magazin/news/details/398-omega-european-masters/",
    period: "2021",
    dek: "Swiss Golf zur OEM in Crans-Montana — Kontext zur ersten European-Tour-Teilnahme als Amateur.",
  },
  {
    outletId: "swiss-golf-talents",
    title: "Mauro Gilardi — Pro Golf Tour Ägypten (Reiseblog)",
    href: "https://friendsofswissgolftalents.ch/mauro-gilardi-pro-golf-tour-aegypten/",
    period: "2022",
    dek: "FSGT, Mai 2022: Tour-Eindrücke und Turnierwochen am Roten Meer.",
  },
  {
    outletId: "swiss-golf-talents",
    title: "Im 2023 haben wir zwei neue Pros auf der Tour",
    href: "https://friendsofswissgolftalents.ch/im-2023-haben-wir-zwei-neue-pros-auf-der-tour/",
    period: "2022",
    dek: "September 2022: Wechsel in den Profibereich — u. a. Mauro Gilardi und Swiss Challenge.",
  },
  {
    outletId: "weitere",
    title: "20 minutes: Amateurs führen das Schweizer Lager in Crans",
    href: "https://www.20min.ch/fr/story/dans-le-clan-suisse-ce-sont-les-amateurs-qui-montrent-la-voie-928409990265",
    period: "2021",
    dek: "Omega European Masters — Ergebnisliste nennt Mauro Gilardi (SUI) +13.",
  },
  {
    outletId: "golf-ch",
    title: "Memorial Olivier Barras 2025",
    href: "https://www.golf.ch/de/news/swiss-pga/memorial-olivier-barras-2025-24-bis-26-juni",
    period: "2025",
    dek: "Swiss-PGA-Turnier in Crans — Abschnitt zu Mauro Gilardi (Swiss Challenge, Heimsieg Domat/Ems).",
  },
  {
    outletId: "golf-ch",
    title: "Golfclub Domat/Ems — Golfplatz-Portrait",
    href: "https://www.golf.ch/de/golfplatz/golfclub-domat-ems",
    period: "2025",
    dek: "Golf.ch zum Heimclub — Schauplatz der Swiss Golf Open Championship 2025.",
  },
  {
    outletId: "golf-ch",
    title: "Swiss Challenge startet in Sempach",
    href: "https://www.golf.ch/de/news/hotelplaner-tour/15-swiss-challenge-startet-sempach",
    period: "2025",
    dek: "Wildcard- und Startlisten-Kontext zur HotelPlanner Tour am Sempachersee.",
  },
  {
    outletId: "progolf-tour",
    title: "Red Sea Ain Sokhna Open 2024 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/red-sea-ain-sokhna-open-2024",
    period: "2024",
    dek: "Offizielles Leaderboard — Mauro Gilardi (RTD nach zwei Runden).",
  },
  {
    outletId: "progolf-tour",
    title: "Red Sea Ain Sokhna Open 2025 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/red-sea-ain-sokhna-open-2025",
    period: "2025",
    dek: "Offizielles Leaderboard — 36. Platz, Gesamt −5.",
  },
  {
    outletId: "progolf-tour",
    title: "Red Sea Ain Sokhna Open 2026 (April) — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/red-sea-ain-sokhna-open-2026-april",
    period: "2026",
    dek: "Offizielles Leaderboard — geteilter 2. Rang (−11).",
  },
  {
    outletId: "progolf-tour",
    title: "PGT Presse: Spektakuläres Finale in Ägypten (Ulenaers)",
    href: "https://www.progolftour.de/press-detail/a-spectacular-finale-ulenaers-triumphs-in-egypt",
    period: "2026",
    dek: "Pressemitteilung zur April-Ausgabe 2026 — erwähnt das Finaltableau inkl. Gilardi T2.",
  },
  {
    outletId: "progolf-tour",
    title: "The Cuber Open 2024 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/the-cuber-open-2024",
    period: "2024",
    dek: "Offizielles Leaderboard — geteilter 35. Rang (−3).",
  },
  {
    outletId: "progolf-tour",
    title: "Bonmont Pro Golf Tour 2025 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/bonmont-pro-golf-tour-2025",
    period: "2025",
    dek: "Erstes PGT-Event in der Schweiz (Chéserex) — geteilter 38. Rang (−5).",
  },
  {
    outletId: "progolf-tour",
    title: "Stippelberg Open 2025 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/stippelberg-open-2025",
    period: "2025",
    dek: "Offizielles Leaderboard — geteilter 8. Rang (−8), wie im Swiss-Golf-Artikel 1725.",
  },
  {
    outletId: "progolf-tour",
    title: "Staan Open 2025 — Ergebnisse",
    href: "https://www.progolftour.de/tournament-details/staan-open-2025",
    period: "2025",
    dek: "Offizielles Leaderboard — 7. Platz (−12).",
  },
  {
    outletId: "progolf-tour",
    title: "Order of Merit 2025 (englisch)",
    href: "https://www.progolftour.de/order-of-merit-en?year=2025",
    period: "2025",
    dek: "Saisonschluss-Rangliste — Mauro Gilardi auf Platz 13 der Wertung.",
  },
  {
    outletId: "dp-world-tour",
    title: "Swiss Challenge 2025 — Turnierseite",
    href: "https://www.europeantour.com/hotelplanner-tour/swiss-challenge-2025/",
    period: "2025",
    dek: "HotelPlanner Tour in Sempach — offizielle Event- und Resultatübersicht.",
  },
  {
    outletId: "dp-world-tour",
    title: "Swiss Challenge 2024 — Turnierseite",
    href: "https://www.europeantour.com/hotelplanner-tour/swiss-challenge-2024/",
    period: "2024",
    dek: "HotelPlanner Tour (Folgensbourg, F) — offizielle Tour-Seite.",
  },
  {
    outletId: "dp-world-tour",
    title: "Swiss Challenge 2023 — Resultate",
    href: "https://www.europeantour.com/hotelplanner-tour/swiss-challenge-2023/results",
    period: "2023",
    dek: "Archiv-Resultate des Swiss-Challenge-Stops (European Tour Group).",
  },
  {
    outletId: "dp-world-tour",
    title: "Swiss Challenge 2022 — Resultate",
    href: "https://www.europeantour.com/hotelplanner-tour/swiss-challenge-2022/results",
    period: "2022",
    dek: "Archiv-Resultate — Kontext zur Challenge-Tour-Saison in Europa.",
  },
  {
    outletId: "dp-world-tour",
    title: "Swiss Challenge 2021 — Resultate",
    href: "https://www.europeantour.com/hotelplanner-tour/swiss-challenge-2021/results",
    period: "2021",
    dek: "Archiv-Resultate — historischer Stopp der Challenge Tour.",
  },
  {
    outletId: "dp-world-tour",
    title: "Black Desert NI Open 2024 — Turnierseite",
    href: "https://www.europeantour.com/hotelplanner-tour/n-i-open-2024/",
    period: "2024",
    dek: "HotelPlanner Tour Nordirland — zum Cut-Resultat in Swiss-Golf-News 1461.",
  },
  {
    outletId: "dp-world-tour",
    title: "Omega European Masters 2021 — Resultate",
    href: "https://www.europeantour.com/dpworld-tour/omega-european-masters-2021/results",
    period: "2021",
    dek: "DP World Tour — offizielle Resultatseite (Amateur-Start in Crans).",
  },
  {
    outletId: "weitere",
    title: "2021 European Amateur Team Championship (Wikipedia, EN)",
    href: "https://en.wikipedia.org/wiki/2021_European_Amateur_Team_Championship",
    period: "2021",
    dek: "Mannschafts-EM PGA Catalunya — Schweizer Kader inkl. Mauro Gilardi.",
  },
  {
    outletId: "weitere",
    title: "2022 European Amateur Team Championship (Wikipedia, EN)",
    href: "https://en.wikipedia.org/wiki/2022_European_Amateur_Team_Championship",
    period: "2022",
    dek: "Mannschafts-EM Royal St George’s — Schweizer Team mit Gilardi.",
  },
  {
    outletId: "weitere",
    title: "Eurosport Italia — Spielerprofil",
    href: "https://www.eurosport.it/golf/mauro-gilardi_prs600995/person.shtml",
    period: "2026",
    dek: "Porträtseite und News-Feed (italienisch).",
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
