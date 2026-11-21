import type { KalenderEvent } from "@/components/kalender/kalender-view";
import { daysBetween } from "@/lib/season-status";

/** Banner oben auf /kalender: die nächsten zwei Turniere, mit Countdown oder „läuft jetzt“. */
export function KalenderNextBanner({ events, today }: { events: KalenderEvent[]; today: string | null }) {
  const upcoming = (today ? events.filter((e) => e.end >= today) : events).slice(0, 2);
  if (upcoming.length === 0) return null;

  return (
    <section className="kal-next" aria-label="Die nächsten Turniere">
      <div className="mg-container">
        <p className="kal-next__eyebrow">Die nächsten Turniere</p>
        <div className="kal-next__grid">
          {upcoming.map((ev) => {
            const live = today !== null && ev.start <= today && today <= ev.end;
            const inDays = today !== null && !live ? daysBetween(today, ev.start) : null;
            return (
              <article key={ev.id} className={`kal-next__card${live ? " is-live" : ""}`}>
                <div className="kal-next__top">
                  <span className="kal-next__kind">{ev.kind === "camp" ? "Trainingscamp" : "Turnier"}</span>
                  <span className="kal-next__when">
                    {live ? "Läuft jetzt" : inDays === null ? "" : inDays === 1 ? "Morgen" : `in ${inDays} Tagen`}
                  </span>
                </div>
                <h3 className="kal-next__name">{ev.name}</h3>
                <p className="kal-next__meta">
                  {ev.dates} · {ev.place}
                  {ev.country ? `, ${ev.country}` : ""}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
