import type { Metadata } from "next";
import { KalenderView, type KalenderEvent, type KalenderTotals } from "@/components/kalender/kalender-view";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatPgtEventDateRange } from "@/content/pgtSeasonEvents";
import { HOTELPLANNER_2027_SEASON_LABEL, hotelplanner2027Events } from "@/content/hotelplanner2027";
import { HOME_BASE, distanceKm, pgtVenueCoordinates, type VenueCoordinate } from "@/content/pgtVenueCoordinates";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import "@/styles/pages/kalender.css";

export const metadata: Metadata = {
  title: "Kalender · HotelPlanner Tour 2027",
  description: `Alle Turniere der HotelPlanner Tour 2027 auf einem Globus und im Kalender. Die Reise startet in ${HOME_BASE.name}.`,
};

/**
 * Saison als Kette: Wattwil -> Turnier 1 -> Turnier 2 -> ... -> Rückreise nach Wattwil.
 * Jede Etappe ist die Luftlinie vom vorherigen Ort zum nächsten Turnier.
 */
function buildSeason(): { events: KalenderEvent[]; totals: KalenderTotals } {
  const sorted = [...hotelplanner2027Events].sort((a, b) => a.start.localeCompare(b.start));
  let prevPoint: VenueCoordinate | typeof HOME_BASE = HOME_BASE;
  let prevLabel: string = HOME_BASE.name;
  let chainKm = 0;
  let longest: { km: number; name: string; from: string; to: string } | null = null;
  const countries = new Set<string>();

  const events: KalenderEvent[] = sorted.map((ev) => {
    const venue = pgtVenueCoordinates[ev.id];
    if (!venue) {
      return {
        id: ev.id,
        name: ev.name,
        start: ev.start,
        end: ev.end,
        dates: formatPgtEventDateRange(ev),
        place: ev.where,
        country: "",
        lat: null,
        lon: null,
        legKm: null,
        fromPlace: prevLabel,
        kind: ev.kind ?? "turnier",
        url: ev.tourPageUrl,
      };
    }
    const leg = distanceKm(prevPoint, venue);
    chainKm += leg;
    countries.add(venue.country);
    if (!longest || leg > longest.km) longest = { km: leg, name: ev.name, from: prevLabel, to: venue.place };
    const row: KalenderEvent = {
      id: ev.id,
      name: ev.name,
      start: ev.start,
      end: ev.end,
      dates: formatPgtEventDateRange(ev),
      place: venue.place,
      country: venue.country,
      lat: venue.lat,
      lon: venue.lon,
      legKm: leg,
      fromPlace: prevLabel,
      kind: ev.kind ?? "turnier",
      url: ev.tourPageUrl,
    };
    prevPoint = venue;
    prevLabel = venue.place;
    return row;
  });

  const returnKm = prevPoint === HOME_BASE ? 0 : distanceKm(prevPoint, HOME_BASE);
  const totals: KalenderTotals = {
    tournaments: events.filter((e) => e.kind === "turnier").length,
    countries: countries.size,
    chainKm,
    returnKm,
    totalKm: chainKm + returnKm,
    longest,
  };
  return { events, totals };
}

export default function KalenderPage() {
  const { events, totals } = buildSeason();

  return (
    <div className="mg-page site-page kalender-page">
      <SiteHeader variant="overlay" />

      <main id="inhalt">
        <PageHero
          eyebrow={`${HOTELPLANNER_2027_SEASON_LABEL} · Kalender`}
          title="Eine Saison. Eine Linie um die Welt."
          lead={`Turnier für Turnier, am Stück gespielt. Die Reise startet und endet in ${HOME_BASE.name}.`}
          image={seoImages.progolfTour}
          imageAlt={seoImageAlts.progolfTour}
        />

        <KalenderView events={events} totals={totals} homeName={HOME_BASE.name} seasonLabel={HOTELPLANNER_2027_SEASON_LABEL} />
      </main>
      <SiteFooter />
    </div>
  );
}
