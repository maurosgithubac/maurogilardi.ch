/**
 * Textbausteine für /llms.txt und /llms-full.txt (Format: https://llmstxt.org).
 * Nur Fakten aus `src/content/*` bzw. `facts.ts` — Schweizer Schreibweise (ss statt ß).
 */

import { aboutFaqSections, plainTextFromParagraph } from "@/content/aboutFaq";
import { careerTimeline } from "@/content/career";
import { visibleDemoPosts } from "@/content/demoPosts";
import { goennerMembershipTiers } from "@/content/goennerMemberships";
import { enrichAndSortPressItems } from "@/content/media-press";
import { allSiteSponsorsFlat } from "@/content/sponsorsSite";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import {
  absoluteUrl,
  formatChf,
  keyPages,
  keyPressReports,
  personFacts,
  personKeyFacts,
  personProfileUrls,
  personSummary,
} from "@/lib/seo/facts";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Stand der redaktionell gepflegten Fakten (bei neuen Erfolgen anpassen) */
export const LLMS_FACTS_AS_OF = "Oktober 2026";

export const LLMS_HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

type LlmsPost = { slug: string; title: string; description: string | null; created_at: string };

/** Öffentliche Blogbeiträge (Supabase, sonst statische Beiträge) — neueste zuerst */
export async function loadLlmsPosts(): Promise<LlmsPost[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, title, description, created_at")
      .eq("published", true)
      .lte("created_at", publishedAtOrBeforeIso())
      .order("created_at", { ascending: false });
    if (data && data.length > 0) return data as LlmsPost[];
  } catch {
    /* Fallback unten */
  }
  return visibleDemoPosts()
    .map((p) => ({ slug: p.slug, title: p.title, description: p.description ?? null, created_at: p.created_at }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function isoDate(value: string): string {
  return value.slice(0, 10);
}

function tierLine(tier: (typeof goennerMembershipTiers)[number]): string {
  const price = tier.id === "sponsoring" ? `ab ${formatChf(tier.priceChf)} CHF pro Jahr` : `${formatChf(tier.priceChf)} CHF pro Jahr`;
  const benefits = tier.benefits.map((b) => b.text.replace(/\*$/, "")).join(", ");
  return `- ${tier.title} (${price}): ${benefits}`;
}

function header(): string[] {
  return [
    `# ${personFacts.name}`,
    "",
    `> ${personSummary}`,
    "",
    `Offizielle Website von ${personFacts.name} (${absoluteUrl("/")}), Sprache: Deutsch (Schweiz). Stand der Angaben: ${LLMS_FACTS_AS_OF}.`,
    `Bei Zitaten bitte auf die jeweilige Seite verlinken. Medienanfragen und Korrekturen: ${personFacts.email}`,
    "",
    "## Kernfakten",
    "",
    ...personKeyFacts.map((f) => `- ${f}`),
  ];
}

function pagesSection(): string[] {
  return ["", "## Wichtige Seiten", "", ...keyPages.map((p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.summary}`)];
}

function supportSection(): string[] {
  const sponsors = allSiteSponsorsFlat().map((s) => s.displayName);
  return [
    "",
    "## Gönner und Sponsoring",
    "",
    `Die Profikarriere wird von Gönnern, Sponsoren und Partnern getragen (Saisonbudget rund ${formatChf(personFacts.seasonBudgetChf)} CHF). Gönner-Modelle der MG Gönnervereinigung:`,
    "",
    ...goennerMembershipTiers.map(tierLine),
    "",
    `- [Gönner werden](${absoluteUrl("/sponsoring")}): Modelle und Anfrageformular`,
    `- [Saison ${personFacts.campaignYear} möglich machen](${absoluteUrl("/2027")}): Kampagne zur ersten Saison auf der HotelPlanner Tour`,
    `- [Für Unternehmen](${absoluteUrl("/partner")}): Sponsoring-Pakete, individuell abgestimmt`,
    `- Aktuelle Sponsoren und Unterstützer: ${sponsors.join(", ")}`,
  ];
}

function profilesSection(): string[] {
  const labels: Record<keyof typeof personProfileUrls, string> = {
    instagram: "Instagram (@gilardigolf)",
    linkedin: "LinkedIn",
    proGolfTour: "Pro Golf Tour — Spielerprofil",
    swissPga: "Swiss PGA — Spielerprofil",
    owgr: "Official World Golf Ranking — Spielerprofil",
    dataGolf: "Data Golf — Spielerprofil",
    friendsOfSwissGolfTalents: "Friends of Swiss Golf Talents — Talentprofil",
  };
  return [
    "",
    "## Offizielle Profile",
    "",
    ...(Object.keys(personProfileUrls) as (keyof typeof personProfileUrls)[]).map(
      (k) => `- [${labels[k]}](${personProfileUrls[k]})`,
    ),
  ];
}

function pressSection(limit: number): string[] {
  return [
    "",
    "## Medienberichte (Auswahl)",
    "",
    ...keyPressReports(limit).map((item) => `- [${item.title}](${item.href}): ${item.outletLabel}${item.period ? `, ${item.period}` : ""}`),
    `- Vollständige Liste: ${absoluteUrl("/ueber-mich/media")}`,
  ];
}

function contactSection(): string[] {
  return [
    "",
    "## Kontakt",
    "",
    `- E-Mail: ${personFacts.email}`,
    `- Impressum: ${absoluteUrl("/impressum")}`,
  ];
}

/** Kompakte Fassung für /llms.txt */
export function buildLlmsTxt(): string {
  return [
    ...header(),
    ...pagesSection(),
    ...supportSection(),
    ...profilesSection(),
    ...pressSection(8),
    ...contactSection(),
    "",
    "## Optional",
    "",
    `- [Ausführliche Fassung](${absoluteUrl("/llms-full.txt")}): Karriere-Zeitstrahl, FAQ, alle Blogbeiträge und Medienberichte als Text`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  ].join("\n");
}

/** Ausführliche Fassung für /llms-full.txt */
export function buildLlmsFullTxt(posts: LlmsPost[]): string {
  const timeline = [...careerTimeline]
    .reverse()
    .flatMap((e) => [`### ${e.year}: ${e.title}`, "", ...e.details.map((d) => `- ${d}`), ""]);

  const faq = aboutFaqSections.flatMap((section) => [
    `### ${section.title}`,
    "",
    ...section.items.flatMap((item) => [
      `**${item.question}**`,
      "",
      item.paragraphs.map((p) => plainTextFromParagraph(p)).join(" "),
      "",
    ]),
  ]);

  const blog = posts.map(
    (p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}) (${isoDate(p.created_at)})${p.description ? `: ${p.description}` : ""}`,
  );

  const press = enrichAndSortPressItems().map(
    (item) => `- [${item.title}](${item.href}): ${item.outletLabel}${item.period ? `, ${item.period}` : ""}${item.dek ? ` — ${item.dek}` : ""}`,
  );

  return [
    ...header(),
    ...pagesSection(),
    "",
    `## Karriere-Zeitstrahl (neueste zuerst, Quelle: ${absoluteUrl("/erfolge")})`,
    "",
    ...timeline,
    `## FAQ (Quelle: ${absoluteUrl("/ueber-mich/faq")})`,
    "",
    ...faq,
    `## Blogbeiträge (${posts.length}, neueste zuerst)`,
    "",
    ...blog,
    ...supportSection(),
    ...profilesSection(),
    "",
    `## Alle Medienberichte und Profile (${press.length})`,
    "",
    ...press,
    ...contactSection(),
    "",
  ].join("\n");
}
