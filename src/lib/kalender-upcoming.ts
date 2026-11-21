import { fallbackRows, type KalenderEventRow } from "@/lib/kalender-events";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Kommender Termin für Admin-Kacheln (Seitenleiste und Saison-Route). */
export type UpcomingEvent = Pick<KalenderEventRow, "id" | "name" | "start_date" | "end_date" | "location" | "country"> & {
  /** Tage bis zum Start (0 = läuft gerade oder heute) */
  days: number;
};

/** Nächste Turniere ab heute, aufsteigend. Fällt auf die Startwerte zurück, wenn die Tabelle nicht erreichbar ist. */
export async function loadUpcomingEvents(limit = 8): Promise<UpcomingEvent[]> {
  let rows: KalenderEventRow[];
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("kalender_events")
      .select("id,name,start_date,end_date,location,country,lat,lon,kind,info_url")
      .order("start_date", { ascending: true });
    rows = !error && data ? (data as KalenderEventRow[]) : fallbackRows();
  } catch {
    rows = fallbackRows();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return rows
    .filter((r) => r.kind !== "camp" && (r.end_date || r.start_date) >= todayIso)
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      name: r.name,
      start_date: r.start_date,
      end_date: r.end_date,
      location: r.location,
      country: r.country,
      days: Math.max(0, Math.round((new Date(`${r.start_date}T00:00:00`).getTime() - today.getTime()) / 86400000)),
    }));
}
