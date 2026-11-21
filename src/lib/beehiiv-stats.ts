/**
 * Newsletter-Kennzahlen aus Beehiiv (v2 API, nur lesend, nur serverseitig).
 * Der API-Schlüssel kommt aus BEEHIIV_API_KEY und verlässt den Server nie.
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";

export type NewsletterStats = {
  subscribers: number;
  /** Prozent, z. B. 62.9 */
  openRate: number | null;
  clickRate: number | null;
  sent: number | null;
  source: "beehiiv" | "supabase";
};

type PublicationStats = {
  active_subscriptions?: number;
  average_open_rate?: number;
  average_click_rate?: number;
  total_sent?: number;
};

/** Aktive Abonnenten und Kennzahlen aus Beehiiv. Gibt null zurück, wenn nicht konfiguriert oder nicht erreichbar. */
export async function loadBeehiivStats(): Promise<NewsletterStats | null> {
  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim();
  if (!apiKey || !publicationId) return null;

  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${encodeURIComponent(publicationId)}?expand[]=stats`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      // Zahlen ändern sich langsam: alle 10 Minuten reichen und schonen das API-Limit
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { stats?: PublicationStats } };
    const s = json.data?.stats;
    if (!s || typeof s.active_subscriptions !== "number") return null;
    return {
      subscribers: s.active_subscriptions,
      openRate: typeof s.average_open_rate === "number" ? s.average_open_rate : null,
      clickRate: typeof s.average_click_rate === "number" ? s.average_click_rate : null,
      sent: typeof s.total_sent === "number" ? s.total_sent : null,
      source: "beehiiv",
    };
  } catch {
    return null;
  }
}
