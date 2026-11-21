import { formatPgtEventDateRange } from "@/content/pgtSeasonEvents";
import { HOME_BASE, distanceKm } from "@/content/pgtVenueCoordinates";
import { hotelplanner2027Events } from "@/content/hotelplanner2027";
import { pgtVenueCoordinates } from "@/content/pgtVenueCoordinates";
import type { KalenderEvent, KalenderTotals } from "@/components/kalender/kalender-view";

export type KalenderKind = "turnier" | "camp";

/** Zeile aus der Tabelle kalender_events. */
export type KalenderEventRow = {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  location: string;
  country: string;
  lat: number | null;
  lon: number | null;
  kind: KalenderKind;
  info_url: string | null;
};

export const KALENDER_TAG = "kalender";

/**
 * Ortssuche über OpenStreetMap (Nominatim). Gibt null zurück, wenn nichts gefunden wird.
 * Der Dienst verlangt einen aussagekräftigen User-Agent; hier nur der Projektname.
 */
export async function geocodeLocation(location: string, country: string): Promise<{ lat: number; lon: number } | null> {
  const query = [location, country].filter((x) => x && x.trim()).join(", ");
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "maurogilardi-kalender/1.0", "Accept-Language": "de" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  } catch {
    return null;
  }
}

/** Startwerte aus dem bisherigen Code, falls die Tabelle leer oder nicht erreichbar ist. */
export function fallbackRows(): KalenderEventRow[] {
  return hotelplanner2027Events.map((ev) => {
    const v = pgtVenueCoordinates[ev.id];
    return {
      id: ev.id,
      name: ev.name,
      start_date: ev.start,
      end_date: ev.end,
      location: v?.place ?? ev.where,
      country: v?.country ?? "",
      lat: v?.lat ?? null,
      lon: v?.lon ?? null,
      kind: ev.kind === "camp" ? "camp" : "turnier",
      info_url: ev.tourPageUrl ?? null,
    };
  });
}

/** Kette Wattwil → Turnier 1 → … → Rückreise, samt Summen. Eingabe: Zeilen aus der Tabelle. */
export function buildSeason(rows: KalenderEventRow[]): { events: KalenderEvent[]; totals: KalenderTotals } {
  const sorted = [...rows].sort((a, b) => a.start_date.localeCompare(b.start_date));
  let prev: { lat: number; lon: number } = HOME_BASE;
  let prevLabel: string = HOME_BASE.name;
  let chainKm = 0;
  let longest: { km: number; name: string; from: string; to: string } | null = null;
  const countries = new Set<string>();

  const events: KalenderEvent[] = sorted.map((r) => {
    const hasPoint = r.lat != null && r.lon != null;
    const leg = hasPoint ? distanceKm(prev, { lat: r.lat as number, lon: r.lon as number }) : null;
    if (leg != null) {
      chainKm += leg;
      if (!longest || leg > longest.km) longest = { km: leg, name: r.name, from: prevLabel, to: r.location };
    }
    if (r.country) countries.add(r.country);
    const row: KalenderEvent = {
      id: r.id,
      name: r.name,
      start: r.start_date,
      end: r.end_date,
      dates: formatPgtEventDateRange({ id: r.id, name: r.name, where: r.location, start: r.start_date, end: r.end_date }),
      place: r.location,
      country: r.country,
      lat: r.lat,
      lon: r.lon,
      legKm: leg,
      fromPlace: prevLabel,
      kind: r.kind,
      url: r.info_url ?? undefined,
    };
    if (hasPoint) {
      prev = { lat: r.lat as number, lon: r.lon as number };
      prevLabel = r.location;
    }
    return row;
  });

  const returnKm = prev === HOME_BASE ? 0 : distanceKm(prev, HOME_BASE);
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

/** Eingabe aus dem Admin-Formular prüfen und bereinigen. */
export function parseKalenderInput(body: Record<string, unknown>):
  | { ok: true; value: Omit<KalenderEventRow, "id"> & { needsGeocode: boolean } }
  | { ok: false; error: string } {
  const name = String(body.name ?? "").trim();
  const start = String(body.start_date ?? "").trim();
  const end = String(body.end_date ?? start).trim();
  const location = String(body.location ?? "").trim();
  const country = String(body.country ?? "").trim();
  const kind = body.kind === "camp" ? "camp" : "turnier";
  const info = String(body.info_url ?? "").trim() || null;
  const latRaw = body.lat;
  const lonRaw = body.lon;
  const lat = latRaw === "" || latRaw == null ? null : Number(latRaw);
  const lon = lonRaw === "" || lonRaw == null ? null : Number(lonRaw);

  if (name.length < 2 || name.length > 160) return { ok: false, error: "Name fehlt." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return { ok: false, error: "Startdatum fehlt." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) return { ok: false, error: "Enddatum fehlt." };
  if (end < start) return { ok: false, error: "Das Enddatum liegt vor dem Startdatum." };
  if (location.length < 2 || location.length > 200) return { ok: false, error: "Ort fehlt." };
  if (info && !/^https?:\/\//.test(info)) return { ok: false, error: "Der Link muss mit https:// beginnen." };
  if ((lat != null && !Number.isFinite(lat)) || (lon != null && !Number.isFinite(lon))) {
    return { ok: false, error: "Koordinaten sind ungültig." };
  }

  return {
    ok: true,
    value: {
      name,
      start_date: start,
      end_date: end,
      location,
      country,
      lat,
      lon,
      kind,
      info_url: info,
      needsGeocode: lat == null || lon == null,
    },
  };
}
