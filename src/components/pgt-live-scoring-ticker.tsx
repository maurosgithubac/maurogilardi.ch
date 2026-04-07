"use client";

import { useEffect, useState } from "react";
import {
  getPgtEventLiveOnDate,
  livescoringLinkForEvent,
  type PgtSeasonEvent,
} from "@/content/pgtSeasonEvents";

export function PgtLiveScoringTicker() {
  const [liveEvent, setLiveEvent] = useState<PgtSeasonEvent | null>(null);

  useEffect(() => {
    setLiveEvent(getPgtEventLiveOnDate(new Date()));
  }, []);

  if (!liveEvent) return null;

  const href = livescoringLinkForEvent(liveEvent);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pgt-live-scoring-ticker"
      aria-label={`Livescoring Pro Golf Tour — ${liveEvent.name}`}
    >
      <span className="pgt-live-scoring-ticker-dot" aria-hidden />
      <span className="pgt-live-scoring-ticker-label">LIVESCORING</span>
      <span className="pgt-live-scoring-ticker-mobile">Live: {liveEvent.name}</span>
      <span className="pgt-live-scoring-ticker-event">{liveEvent.name}</span>
      <span className="pgt-live-scoring-ticker-cta">Zur Livescoring-Seite →</span>
    </a>
  );
}
