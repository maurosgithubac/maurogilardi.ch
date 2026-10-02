import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/constants";

/**
 * Nicht-öffentliche Bereiche — für alle Crawler gesperrt.
 * `/_next/` bewusst NICHT gesperrt: Google braucht JS/CSS zum Rendern und `/_next/image` für die Bildersuche.
 */
const PRIVATE_PATHS = ["/admin", "/api/"];

/**
 * Such- und KI-Crawler, die ausdrücklich zugelassen sind (Sichtbarkeit in Google, Bing,
 * ChatGPT Search, Claude, Perplexity, Gemini/AI Overviews, Apple Intelligence).
 * CCBot (Common Crawl) ebenfalls erlaubt: offener Datensatz, Grundlage vieler Modelle —
 * für eine öffentliche Personen-Website überwiegt die Auffindbarkeit.
 */
const ALLOWED_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ALLOWED_BOTS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
