"use client";

import { useSyncExternalStore } from "react";
import { hotelplanner2027Events, HOTELPLANNER_TOUR_URL, liveHotelplannerEvent } from "@/content/hotelplanner2027";
import { daysBetween, todayIso } from "@/lib/season-status";
import "@/styles/pages/live-banner.css";

const CLOCK_TICK_MS = 15 * 60 * 1000;

function subscribeClock(onChange: () => void) {
  const id = window.setInterval(onChange, CLOCK_TICK_MS);
  return () => window.clearInterval(id);
}

/** Nur die ID ist ein stabiler Snapshot. Serverseitig gibt es keinen Banner. */
const readLiveId = () => liveHotelplannerEvent(new Date())?.id ?? null;
const serverLiveId = () => null;

/** Kleiner Streifen, nur sichtbar, solange ein Turnier der HotelPlanner Tour läuft. */
export function LiveBanner() {
  const liveId = useSyncExternalStore(subscribeClock, readLiveId, serverLiveId);
  const live = liveId ? hotelplanner2027Events.find((ev) => ev.id === liveId) : undefined;
  if (!live) return null;

  const today = todayIso(new Date());
  const day = daysBetween(live.start, today) + 1;
  const days = daysBetween(live.start, live.end) + 1;

  return (
    <aside className="live-banner" aria-label="Live-Turnier">
      <div className="live-banner__inner mg-container">
        <span className="live-banner__badge">
          <span className="live-banner__dot" aria-hidden="true" />
          Live
        </span>
        <span className="live-banner__text">
          <strong>{live.name}</strong>
          <span className="live-banner__meta">
            {live.where} · Tag {day} von {days}
          </span>
        </span>
        <a
          href={live.tourPageUrl ?? HOTELPLANNER_TOUR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="live-banner__link"
        >
          Zum Turnier <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}
