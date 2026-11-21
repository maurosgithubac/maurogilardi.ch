"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { KalenderScrollFx } from "@/components/kalender/kalender-scroll";
import { KalenderJourney } from "@/components/kalender/kalender-journey";
import { KalenderNextBanner } from "@/components/kalender/kalender-next";
import { GlobeArcs, type GlobeFocus, type GlobeItem } from "@/components/globe/globe-arcs";
import { classifySeason, daysBetween, todayIso, type EventStatus, type SeasonStatus } from "@/lib/season-status";

export type KalenderEvent = {
  id: string;
  name: string;
  start: string;
  end: string;
  dates: string;
  place: string;
  country: string;
  lat: number | null;
  lon: number | null;
  /** Luftlinie vom vorherigen Halt (Heimatort oder vorheriges Turnier). */
  legKm: number | null;
  fromPlace: string;
  kind: "turnier" | "camp";
  url?: string;
};

export type KalenderTotals = {
  tournaments: number;
  countries: number;
  chainKm: number;
  returnKm: number;
  totalKm: number;
  longest: { km: number; name: string; from: string; to: string } | null;
};

type Props = {
  events: KalenderEvent[];
  totals: KalenderTotals;
  homeName: string;
  seasonLabel: string;
};

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const STATUS_LABEL: Record<EventStatus, string> = {
  live: "Live",
  next: "Nächste Reise",
  upcoming: "Kommend",
  past: "Gespielt",
};

const CLOCK_TICK_MS = 15 * 60 * 1000;

function subscribeClock(onChange: () => void) {
  const id = window.setInterval(onChange, CLOCK_TICK_MS);
  return () => window.clearInterval(id);
}

const readToday = () => todayIso(new Date());
const serverToday = () => null;

const formatKm = (km: number) => `${Math.round(km).toLocaleString("de-CH")} km`;

export function KalenderView({ events, totals, homeName, seasonLabel }: Props) {
  // Erst im Browser bekannt (Datum des Besuchers), serverseitig null.
  const today = useSyncExternalStore(subscribeClock, readToday, serverToday);
  const [focus, setFocus] = useState<GlobeFocus | null>(null);

  const status = useMemo(() => (today ? classifySeason(events, today) : null), [events, today]);

  const globeItems: GlobeItem[] = useMemo(
    () =>
      events.flatMap((ev) =>
        ev.lat === null || ev.lon === null
          ? []
          : [
              {
                id: ev.id,
                name: ev.name,
                dates: ev.dates,
                place: ev.place,
                country: ev.country,
                lat: ev.lat,
                lon: ev.lon,
                status: status?.byId[ev.id] ?? "upcoming",
              },
            ],
      ),
    [events, status],
  );

  const globeIndexById = useMemo(() => {
    const map = new Map<string, number>();
    globeItems.forEach((it, i) => map.set(it.id, i));
    return map;
  }, [globeItems]);

  const handleActive = useCallback(
    (id: string) => {
      const index = globeIndexById.get(id);
      if (index === undefined) return;
      setFocus((prev) => (prev?.index === index ? prev : { index, n: (prev?.n ?? 0) + 1 }));
    },
    [globeIndexById],
  );

  const focusEvent = (id: string) => {
    const index = globeIndexById.get(id);
    if (index === undefined) return;
    setFocus((prev) => ({ index, n: (prev?.n ?? 0) + 1 }));
    document.getElementById("kal-globe")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const byMonth = MONTHS.map((name, i) => ({
    name,
    events: events.filter((ev) => Number(ev.start.slice(5, 7)) === i + 1),
  })).filter((m) => m.events.length > 0);

  return (
    <>
      <KalenderScrollFx onActive={handleActive} />
      <KalenderNextBanner events={events} today={today} />

      <KalenderJourney events={events} totals={totals} homeName={homeName} />
      <section className="kal-calendar" aria-label="Turnierkalender">
        <div className="mg-container">
          {events.length === 0 ? (
            <p className="kal-empty">Die Termine sind noch nicht veröffentlicht. Sobald sie feststehen, erscheinen sie hier.</p>
          ) : null}

          {byMonth.map((month) => (
            <section key={month.name} className="kal-month" aria-labelledby={`kal-m-${month.name}`}>
              <header className="kal-month__head" data-reveal>
                <h2 id={`kal-m-${month.name}`}>{month.name}</h2>
                <span>
                  {month.events.length} {month.events.length === 1 ? "Turnier" : "Turniere"}
                </span>
              </header>

              <ol className="kal-cards">
                {month.events.map((ev) => {
                  const s = status?.byId[ev.id] ?? "upcoming";
                  const clickable = globeIndexById.has(ev.id);
                  return (
                    <li key={ev.id} className="kal-card" data-status={s} data-id={ev.id} data-focus data-reveal>
                      <button
                        type="button"
                        className="kal-card__main"
                        onClick={() => focusEvent(ev.id)}
                        disabled={!clickable}
                        aria-label={`${ev.name}, ${ev.dates}, ${ev.place}. Auf dem Globus zeigen`}
                      >
                        <span className="kal-card__chip" aria-hidden="true">
                          {Number(ev.start.slice(8))}.–{Number(ev.end.slice(8))}.
                        </span>
                        <span className="kal-card__text">
                          <span className="kal-card__badge">
                            {ev.kind === "camp" ? "Trainingscamp" : status ? STATUS_LABEL[s] : ""}
                          </span>
                          <strong>{ev.name}</strong>
                          <span>{ev.dates}</span>
                          <span className="kal-card__place">
                            {ev.place}, {ev.country}
                          </span>
                        </span>
                      </button>
                      <div className="kal-card__meta">
                        {ev.legKm !== null ? (
                          <span>
                            Etappe {formatKm(ev.legKm)} ab {ev.fromPlace}
                          </span>
                        ) : null}
                        {ev.url ? (
                          <a href={ev.url} target="_blank" rel="noopener noreferrer">
                            Turnierseite
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
