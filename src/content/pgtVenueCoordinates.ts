/**
 * Koordinaten der Turnierorte (Breite, Länge) für /kalender.
 * Schlüssel = Turnier-ID aus hotelplanner2027.ts.
 *
 * precision:
 * - "club"   = Golfclub belegt
 * - "ort"    = Ortsmitte geschätzt, Club nicht exakt belegt
 */

export type VenueCoordinate = {
  lat: number;
  lon: number;
  country: string;
  place: string;
  precision: "club" | "ort";
};

/** Startpunkt aller Reisen (Wattwil, Heimat). */
export const HOME_BASE = { name: "Wattwil", lat: 47.2966, lon: 9.0867 } as const;

/** Luftlinie in km (Haversine, Erdradius 6371 km). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export const pgtVenueCoordinates: Record<string, VenueCoordinate> = {
  "marrakesch-practice-camp-2027": { lat: 31.63, lon: -7.98, country: "Marokko", place: "Marrakesch", precision: "ort" },
  "sdc-open-2027": { lat: -25.42, lon: 30.12, country: "Südafrika", place: "Highland Gate, Dullstroom", precision: "ort" },
  "jonsson-workwear-durban-open-2027": { lat: -29.7, lon: 31.07, country: "Südafrika", place: "The Woods, Mount Edgecombe", precision: "ort" },
  "circa-cape-town-open-2027": { lat: -34.0, lon: 18.46, country: "Südafrika", place: "Royal Cape Golf Club, Kapstadt", precision: "ort" },
  "ntt-data-proam-standard-bank-2027": { lat: -33.96, lon: 22.45, country: "Südafrika", place: "Fancourt, George", precision: "ort" },
};
