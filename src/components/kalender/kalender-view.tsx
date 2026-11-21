"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { KalenderScrollFx } from "@/components/kalender/kalender-scroll";
import { KalenderJourney } from "@/components/kalender/kalender-journey";
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
      <section className="kal-live" aria-live="polite" aria-label="Aktueller Stand">
        <LiveStatus status={status} today={today} seasonLabel={seasonLabel} />
      </section>

      {events.length > 0 ? (
        <section className="kal-timeline" aria-label="Zeitleiste der Saison">
          <div className="mg-container">
            <SeasonTimeline events={events} status={status} today={today} />
          </div>
        </section>
      ) : null}

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

function SeasonTimeline({
  events,
  status,
  today,
}: {
  events: KalenderEvent[];
  status: SeasonStatus<KalenderEvent> | null;
  today: string | null;
}) {
  const first = events[0].start;
  const last = events[events.length - 1].end;
  const span = Math.max(daysBetween(first, last), 1);
  const at = (iso: string) => `${(daysBetween(first, iso) / span) * 100}%`;
  const todayInRange = today !== null && today >= first && today <= last;

  return (
    <div className="kal-tl" role="list" aria-label="Turniere in zeitlicher Reihenfolge">
      <div className="kal-tl__track" aria-hidden="true" />
      {todayInRange && today ? <div className="kal-tl__today" style={{ left: at(today) }} aria-label="Heute" /> : null}
      {events.map((ev, i) => {
        const s = status?.byId[ev.id] ?? "upcoming";
        return (
          <div
            key={ev.id}
            role="listitem"
            className="kal-tl__item"
            data-status={s}
            data-kind={ev.kind}
            data-up={i % 2 === 0}
            style={{ left: `${(daysBetween(first, ev.start) / span) * 100}%` }}
          >
            <span className="kal-tl__dot" aria-hidden="true" />
            <span className="kal-tl__label">
              <strong>{ev.start.slice(8)}.{ev.start.slice(5, 7)}.</strong>
              <span>{ev.country}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LiveStatus({
  status,
  today,
  seasonLabel,
}: {
  status: SeasonStatus<KalenderEvent> | null;
  today: string | null;
  seasonLabel: string;
}) {
  if (!status || !today) {
    return (
      <div className="kal-live__card">
        <p className="kal-live__eyebrow">Stand wird geladen</p>
      </div>
    );
  }

  const live = status.live[0];
  const next = status.next;

  return (
    <div className="kal-live__card">
      {live ? (
        <>
          <p className="kal-live__eyebrow">
            Jetzt live · Tag {daysBetween(live.start, today) + 1} von {daysBetween(live.start, live.end) + 1}
          </p>
          <p className="kal-live__title">{live.name}</p>
          <p className="kal-live__where">
            {live.place}, {live.country}
          </p>
        </>
      ) : null}

      {next ? (
        <>
          <p className="kal-live__eyebrow">{live ? "Danach" : "Nächste Reise"}</p>
          <p className="kal-live__title">{next.name}</p>
          <p className="kal-live__where">
            {next.dates} · {next.place}, {next.country}
          </p>
          <p className="kal-live__when">
            {daysBetween(today, next.start) === 1 ? "Morgen" : `in ${daysBetween(today, next.start)} Tagen`}
            {next.legKm !== null ? ` · Etappe ${formatKm(next.legKm)} ab ${next.fromPlace}` : ""}
          </p>
        </>
      ) : null}

      {!live && !next ? (
        status.lastPast ? (
          <>
            <p className="kal-live__eyebrow">Saison beendet</p>
            <p className="kal-live__title">Letztes Turnier: {status.lastPast.name}</p>
            <p className="kal-live__where">{status.lastPast.dates}</p>
            <p className="kal-live__when">Die Termine der nächsten Saison folgen, sobald sie feststehen.</p>
          </>
        ) : (
          <>
            <p className="kal-live__eyebrow">{seasonLabel}</p>
            <p className="kal-live__title">Noch keine Termine veröffentlicht</p>
          </>
        )
      ) : null}
    </div>
  );
}
