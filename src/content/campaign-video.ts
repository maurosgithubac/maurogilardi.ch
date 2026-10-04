export type CampaignVideo = {
  /** YouTube-Video-ID (auch für Shorts) */
  youtubeId: string;
  poster: string;
  width: number;
  height: number;
  /** Anzeige auf dem Play-Button, z. B. "1:33" */
  durationLabel: string;
  title: string;
};

export const aufstiegVideo: CampaignVideo = {
  youtubeId: "37bZjWo31l4",
  poster: "/brand-assets/video/aufstieg-geschafft-poster.jpg",
  width: 720,
  height: 1280,
  durationLabel: "1:33",
  title: "Aufstieg geschafft — meine Saison 2027 auf der HotelPlanner Tour",
};

/** Für Blog-Marker {{VIDEO:id|Bildunterschrift}} */
export const videosById: Record<string, CampaignVideo> = {
  "aufstieg-geschafft": aufstiegVideo,
};

/** Startseite und /2027 zeigen das Video bis Ende 4.12.2026 (Europe/Zurich), der Blogpost dauerhaft */
const FEATURED_UNTIL = new Date("2026-12-04T23:00:00.000Z");

export function isCampaignVideoFeatured(now: Date = new Date()): boolean {
  return now < FEATURED_UNTIL;
}

export function youtubeEmbedUrl(video: CampaignVideo): string {
  const params = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?${params.toString()}`;
}
