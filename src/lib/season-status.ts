/**
 * Status einzelner Turniere relativ zu einem Kalendertag (lokal, YYYY-MM-DD).
 * Reine Funktionen, ohne Zugriff auf die Uhr. Der Aufrufer übergibt den Tag.
 */

export type SeasonEventLike = { id: string; start: string; end: string };

export type EventStatus = "live" | "next" | "upcoming" | "past";

export function todayIso(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Ganze Tage von `from` bis `to` (beide YYYY-MM-DD). Negativ, wenn `to` vorher liegt. */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export type SeasonStatus<T extends SeasonEventLike> = {
  byId: Record<string, EventStatus>;
  live: T[];
  next: T | null;
  lastPast: T | null;
};

export function classifySeason<T extends SeasonEventLike>(events: T[], today: string): SeasonStatus<T> {
  const byId: Record<string, EventStatus> = {};
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const live = sorted.filter((ev) => ev.start <= today && today <= ev.end);
  const future = sorted.filter((ev) => ev.start > today);
  const past = sorted.filter((ev) => ev.end < today);
  const next = future[0] ?? null;

  for (const ev of live) byId[ev.id] = "live";
  for (const ev of past) byId[ev.id] = "past";
  for (const ev of future) byId[ev.id] = ev === next ? "next" : "upcoming";

  return { byId, live, next, lastPast: past[past.length - 1] ?? null };
}
