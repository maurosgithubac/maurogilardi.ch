"use client";

import Image from "next/image";
import { useState } from "react";
import { trackEvent } from "@/components/analytics-events";
import type { CampaignVideo } from "@/content/campaign-video";

type Props = {
  video: CampaignVideo;
  /** Startet sofort (z. B. im Popup, nach dem Klick auf den Auslöser) */
  autoPlay?: boolean;
  /** Analytics-Label, wo das Video abgespielt wurde */
  trackLabel: string;
  sizes?: string;
  className?: string;
};

/**
 * Hochformat-Video, das bis zum Klick nur das optimierte Vorschaubild lädt.
 * Die MP4 wird erst beim Abspielen angefordert — die Seite bleibt schnell.
 */
export function VerticalVideo({ video, autoPlay = false, trackLabel, sizes = "(max-width: 640px) 90vw, 22rem", className }: Props) {
  const [playing, setPlaying] = useState(autoPlay);

  function start() {
    trackEvent("video_play", { label: trackLabel });
    setPlaying(true);
  }

  return (
    <div className={`mg-vvideo${className ? ` ${className}` : ""}`} style={{ aspectRatio: `${video.width} / ${video.height}` }}>
      {playing ? (
        <video
          className="mg-vvideo__media"
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label={video.title}
        />
      ) : (
        <button type="button" className="mg-vvideo__poster" onClick={start} aria-label={`Video abspielen: ${video.title}`}>
          <Image src={video.poster} alt="" fill sizes={sizes} className="mg-vvideo__media" />
          <span className="mg-vvideo__play" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="mg-vvideo__duration" aria-hidden="true">
            {video.durationLabel}
          </span>
        </button>
      )}
    </div>
  );
}
