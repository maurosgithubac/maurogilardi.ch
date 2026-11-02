/**
 * Turniere der HotelPlanner Tour 2027 für /kalender.
 * Quelle: https://www.europeantour.com/hotelplanner-tour/schedule/2027/ („Road to Mallorca“-Abschnitt).
 * Die Seite zeigt bisher nur die ersten vier Turniere (Januar bis Februar 2027).
 */
import type { PgtSeasonEvent } from "@/content/pgtSeasonEvents";
import { todayIso } from "@/lib/season-status";

export const HOTELPLANNER_2027_SEASON_LABEL = "Saison 2027 · HotelPlanner Tour";

/** Offizielle Website der HotelPlanner Tour. */
export const HOTELPLANNER_TOUR_URL = "https://www.europeantour.com/hotelplanner-tour/";

/** Turnier, das heute läuft (ohne Trainingscamps). Im Browser mit dem Datum des Besuchers aufrufen. */
export function liveHotelplannerEvent(now: Date): PgtSeasonEvent | null {
  const today = todayIso(now);
  return hotelplanner2027Events.find((ev) => ev.kind !== "camp" && ev.start <= today && today <= ev.end) ?? null;
}

const SCHEDULE_URL = "https://www.europeantour.com/hotelplanner-tour/schedule/2027/";

export const hotelplanner2027Events: PgtSeasonEvent[] = [
  {
    id: "marrakesch-practice-camp-2027",
    name: "Practice Camp Marrakesch",
    start: "2027-01-08",
    end: "2027-01-15",
    where: "Marrakesch, Marokko",
    kind: "camp",
  },
  {
    id: "sdc-open-2027",
    name: "SDC Open",
    start: "2027-01-21",
    end: "2027-01-24",
    where: "Highland Gate Golf & Trout Estate, Dullstroom, Südafrika",
    tourPageUrl: SCHEDULE_URL,
  },
  {
    id: "jonsson-workwear-durban-open-2027",
    name: "Jonsson Workwear Durban Open",
    start: "2027-01-28",
    end: "2027-01-31",
    where: "The Woods at Mount Edgecombe, Durban, Südafrika",
    tourPageUrl: SCHEDULE_URL,
  },
  {
    id: "circa-cape-town-open-2027",
    name: "CIRCA Cape Town Open",
    start: "2027-02-04",
    end: "2027-02-07",
    where: "Royal Cape Golf Club, Kapstadt, Südafrika",
    tourPageUrl: SCHEDULE_URL,
  },
  {
    id: "ntt-data-proam-standard-bank-2027",
    name: "NTT DATA Pro-Am in Partnership with Standard Bank",
    start: "2027-02-11",
    end: "2027-02-14",
    where: "Fancourt, George, Südafrika",
    tourPageUrl: SCHEDULE_URL,
  },
];
