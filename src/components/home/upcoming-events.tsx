"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import {
  formatPgtEventDateRange,
  livescoringLinkForEvent,
  PRO_GOLF_TOUR_TURNIERE_URL,
  type PgtSeasonEvent,
} from "@/content/pgtSeasonEvents";
import { MG_EASE } from "@/components/motion/motion-provider";

export function UpcomingEvents({ events }: { events: PgtSeasonEvent[] }) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();

  if (events.length === 0) {
    return (
      <div className="mg-events__empty">
        <p className="mg-body">
          Die Saison ist gespielt — der neue Turnierkalender folgt. Bis dahin findest du alle Termine bei der Tour.
        </p>
        <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer" className="mg-link-arrow">
          Kalender Pro Golf Tour <span className="mg-btn__arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  const visible = showAll ? events : events.slice(0, 3);

  return (
    <>
      <ol id={listId} className="mg-events__list">
        <AnimatePresence initial={false}>
          {visible.map((ev) => (
            <motion.li
              key={ev.id}
              className="mg-events__item"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: MG_EASE }}
            >
              <time className="mg-events__date mg-mono" dateTime={ev.start}>
                {formatPgtEventDateRange(ev)}
              </time>
              <div className="mg-events__meta">
                <p className="mg-events__name">{ev.name}</p>
                <p className="mg-events__where">{ev.where}</p>
              </div>
              <a
                href={livescoringLinkForEvent(ev)}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-events__live"
                aria-label={`Livescoring ${ev.name}`}
              >
                Live ↗
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {events.length > 3 ? (
        <button
          type="button"
          className="mg-link-arrow mg-events__toggle"
          aria-expanded={showAll}
          aria-controls={listId}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Weniger anzeigen" : `Alle ${events.length} Turniere`}
        </button>
      ) : null}
    </>
  );
}
