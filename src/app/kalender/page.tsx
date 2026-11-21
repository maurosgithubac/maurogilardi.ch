import type { Metadata } from "next";
import { KalenderView } from "@/components/kalender/kalender-view";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HOTELPLANNER_2027_SEASON_LABEL } from "@/content/hotelplanner2027";
import { HOME_BASE } from "@/content/pgtVenueCoordinates";
import { buildSeason, fallbackRows, type KalenderEventRow } from "@/lib/kalender-events";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import "@/styles/pages/kalender.css";

export const metadata: Metadata = {
  title: "Kalender · HotelPlanner Tour 2027",
  description: `Alle Turniere der HotelPlanner Tour 2027 auf einem Globus und im Kalender. Die Reise startet in ${HOME_BASE.name}.`,
};

/** Wird nach jeder Änderung im Admin sofort neu erzeugt (revalidatePath). Zusätzlich alle 5 Minuten. */
export const revalidate = 300;

/** Termine aus der Datenbank. Ist die Tabelle nicht erreichbar, bleibt die Seite mit dem bisherigen Stand sichtbar. */
async function loadRows(): Promise<KalenderEventRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("kalender_events")
      .select("id,name,start_date,end_date,location,country,lat,lon,kind,info_url")
      .order("start_date", { ascending: true });
    if (error || !data) return fallbackRows();
    return data as KalenderEventRow[];
  } catch {
    return fallbackRows();
  }
}

export default async function KalenderPage() {
  const rows = await loadRows();
  const { events, totals } = buildSeason(rows);

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
