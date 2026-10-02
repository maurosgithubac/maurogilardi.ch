import type { Metadata } from "next";
import {
  SITE_URL,
  type SeoImageKey,
  seoOgImage,
  seoOgImagePaths,
} from "@/lib/seo/constants";
import { buildSeoTitle } from "@/lib/seo/build-seo-title";
import { seoPageTitles, seoSiteName } from "@/lib/seo/titles";
import {
  blogIndexGraph,
  erfolgePageGraph,
  partnerPageGraph,
  profilePageGraph,
  sponsoringPageGraph,
} from "@/lib/seo/webpage-jsonld";

/** Individuelle Metadata + JSON-LD-Objekte pro Hauptseite */

/**
 * Vollständige Seiten-Metadaten. Next.js merged `openGraph`/`twitter` NICHT tief —
 * deshalb setzt jede Seite type, locale, siteName, Bild usw. selbst.
 */
export function buildPageMetadata({
  path,
  title,
  description,
  image,
  keywords,
  ogDescription,
}: {
  path: string;
  title: string;
  description: string;
  image: SeoImageKey;
  keywords?: string[];
  /** Optional kürzere Variante für Social Cards */
  ogDescription?: string;
}): Metadata {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const social = ogDescription ?? description;
  return {
    title: { absolute: title },
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_CH",
      url,
      siteName: seoSiteName,
      title,
      description: social,
      images: seoOgImage(image),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: social,
      images: [seoOgImagePaths[image]],
    },
  };
}

export const HOME_PAGE_DESCRIPTION =
  "Mauro Gilardi ist Schweizer Golfprofi und Swiss PGA Professional aus Graubünden. 2026 gelang ihm der Aufstieg von der Pro Golf Tour in die HotelPlanner Tour.";

export const homePageMetadata: Metadata = buildPageMetadata({
  path: "/",
  title: seoPageTitles.home,
  description:
    HOME_PAGE_DESCRIPTION,
  image: "heroPrimary",
  keywords: ["Mauro Gilardi", "Gilardi Golf", "Schweizer Golfprofi", "Swiss PGA Professional", "HotelPlanner Tour", "Pro Golf Tour", "Golfprofi Graubünden"],
});

export const uebermichMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich",
  title: seoPageTitles.ueberMich,
  description:
    "Mauro Gilardi, Golfprofi aus Graubünden: vom Swiss Golf Team zum Swiss PGA Professional – und 2026 der Aufstieg von der Pro Golf Tour in die HotelPlanner Tour.",
  image: "portraitTournament",
  keywords: ["Mauro Gilardi", "Swiss PGA Professional", "Golfprofi Graubünden", "Schweizer Golfprofi", "Playing Professional", "Swiss Golf Team"],
});

/** ProfilePage + BreadcrumbList (Person kommt per @id aus dem Root-Graphen) */
export const uebermichSchema = profilePageGraph(
  "Profil von Mauro Gilardi: Schweizer Profigolfer aus Graubünden, Swiss PGA Playing Professional und Mitglied des Swiss Golf Teams — Werdegang, Werte und Projekte.",
);

export const blogIndexMetadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: seoPageTitles.blog,
  description:
    "Tour-Tagebuch des Schweizer Golfprofis Mauro Gilardi: Turnierberichte von der Pro Golf Tour, Training, Learnings und der Weg in die HotelPlanner Tour.",
  image: "tournamentAction",
  keywords: ["Mauro Gilardi Blog", "Golf Blog Schweiz", "Pro Golf Tour Turnierberichte", "HotelPlanner Tour"],
});

/** CollectionPage + Blog ohne Beitragsliste — die Blog-Seite nutzt `blogIndexGraph(posts)` mit Beiträgen */
export const blogIndexSchema = blogIndexGraph([]);

export const erfolgeMetadata: Metadata = buildPageMetadata({
  path: "/erfolge",
  title: seoPageTitles.erfolge,
  description:
    "Erfolge von Mauro Gilardi: Siege und Podestplätze auf der Pro Golf Tour, Rang 4 im Ranking 2026 und der Aufstieg in die HotelPlanner Tour – alle Meilensteine.",
  image: "progolfTour",
  keywords: ["Mauro Gilardi Erfolge", "Pro Golf Tour Resultate", "Pro Golf Tour Ranking", "HotelPlanner Tour Aufstieg"],
});

/** WebPage + ItemList aus dem Karriere-Zeitstrahl (career.ts) */
export const erfolgeSchema = erfolgePageGraph(
  "Karriere-Zeitstrahl von Mauro Gilardi: vom Golfeinstieg 2005 über Amateurtitel und den Wechsel zu den Profis 2022 bis zum Aufstieg in die HotelPlanner Tour 2026.",
);

export const sponsoringMetadataSeo: Metadata = buildPageMetadata({
  path: "/sponsoring",
  title: seoPageTitles.sponsoring,
  description:
    "Golf Gönner werden bei Mauro Gilardi: Ab 100 CHF im Jahr trägst du die Saison des Schweizer Golfprofis auf der HotelPlanner Tour mit – inkl. Gönnerturnier.",
  image: "golfEvent",
  keywords: ["Golf Gönner werden", "Gönnervereinigung Golf", "Golfprofi unterstützen", "Mauro Gilardi Gönner"],
});

/** WebPage + OfferCatalog der Gönner-Modelle + DonateAction (neutral, keine Product-Auszeichnung) */
export const sponsoringSchema = sponsoringPageGraph(
  "Gönner-Modelle der MG Gönnervereinigung (100er Club, Birdie, Eagle, Albatros) und Sponsoring — so trägst du die Profikarriere von Mauro Gilardi mit.",
);

export const partnerMetadata: Metadata = buildPageMetadata({
  path: "/partner",
  title: seoPageTitles.partner,
  description:
    "Golf Sponsoring Schweiz: Partnerschaft mit Mauro Gilardi, Swiss PGA Professional – Sichtbarkeit, Golf-Erlebnisse und Geschichten von der HotelPlanner Tour.",
  image: "golfTeam",
  keywords: ["Golf Sponsoring Schweiz", "Sport Sponsoring Unternehmen", "Sponsoring Golfprofi", "HotelPlanner Tour Sponsoring"],
});

/** Kampagnenseite /2027 — «Saison möglich machen» (Gönner, HotelPlanner Tour) */
export const SAISON_2027_DESCRIPTION =
  "Aufstieg in die HotelPlanner Tour geschafft: Werde Gönner ab 100 CHF im Jahr und trage die Saison 2027 von Mauro Gilardi eine Stufe unter der DP World Tour mit.";

export const saison2027Metadata: Metadata = buildPageMetadata({
  path: "/2027",
  title: seoPageTitles.saison2027,
  description: SAISON_2027_DESCRIPTION,
  image: "heroPrimary",
  keywords: ["HotelPlanner Tour 2027", "Mauro Gilardi Saison 2027", "Golf Gönner werden", "Golfprofi unterstützen"],
});

/** WebPage für Unternehmen (BusinessAudience) — Pakete individuell, ab 2'000 CHF pro Jahr */
export const partnerSchema = partnerPageGraph(
  "Sponsoring und Partnerschaften für Unternehmen mit Mauro Gilardi, Swiss PGA Professional — individuelle Pakete ab 2'000 CHF pro Jahr.",
);

export const uebermichFaqMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich/faq",
  title: seoPageTitles.faq,
  description:
    "FAQ zu Mauro Gilardi: Pro Golf Tour, HotelPlanner Tour, Swiss PGA, Swiss Golf Team, Rankings und wie du Gönner oder Sponsor wirst – kurz und ehrlich erklärt.",
  image: "ironSwing",
});

export const uebermichSponsorenMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich/sponsoren",
  title: seoPageTitles.sponsoren,
  description:
    "Sponsoren und Partner von Mauro Gilardi: Unternehmen und Gönner, die den Schweizer Golfprofi auf dem Weg von der Pro Golf Tour in die HotelPlanner Tour tragen.",
  image: "swissGolfFlag",
});

export const uebermichGallerieMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich/gallerie",
  title: seoPageTitles.gallerie,
  description:
    "Bildergalerie von Mauro Gilardi: Impressionen von Turnieren auf der Pro Golf Tour, Training in Graubünden, Golf-Events und Momenten mit dem Swiss Golf Team.",
  image: "coastCourse",
});

export const uebermichMediaMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich/media",
  title: seoPageTitles.media,
  description:
    "Mauro Gilardi in den Medien: Presseberichte, Interviews und Auftritte des Schweizer Golfprofis und Swiss PGA Professional – plus Kontakt für Medienanfragen.",
  image: "readingGreen",
});

export const uebermichEquipmentMetadata: Metadata = buildPageMetadata({
  path: "/ueber-mich/equipment",
  title: seoPageTitles.equipment,
  description:
    "What's in the Bag: Driver, Holz, Rescue, Eisen, Wedges und Putter von Mauro Gilardi, Swiss PGA Professional – das Turnier-Equipment auf der Tour.",
  image: "puttingAction",
});

export const impressumMetadata: Metadata = buildPageMetadata({
  path: "/impressum",
  title: seoPageTitles.impressum,
  description:
    "Impressum von maurogilardi.ch: verantwortliche Person, Kontaktangaben, Haftungshinweise und Hosting der Website von Mauro Gilardi, Swiss PGA Professional.",
  image: "heroPrimary",
});

export const datenschutzMetadata: Metadata = buildPageMetadata({
  path: "/datenschutz",
  title: seoPageTitles.datenschutz,
  description:
    "Datenschutzerklärung von maurogilardi.ch: welche Daten bei Newsletter, Kontakt- und Gönnerformular anfallen, Cookies, Hosting und deine Rechte nach DSG/DSGVO.",
  image: "heroPrimary",
});

/** Blog-Beitrag: Fallback, wenn kein Beitrag gefunden wird (Seite rendert 404) */
export const blogPostNotFoundMetadata: Metadata = {
  title: { absolute: seoPageTitles.blogFallback },
  robots: { index: false, follow: true },
};

const BLOG_DESCRIPTION_MAX = 160;
const BLOG_DESCRIPTION_TAILS = [
  "Tour-Update von Mauro Gilardi, Schweizer Golfprofi.",
  "Tour-Update von Mauro Gilardi.",
];

/** Kurze CMS-Teaser (oft ~100 Zeichen) mit Marke auf 140–160 Zeichen ergänzen — ohne zu kürzen */
function blogPostDescription(title: string, description: string | null): string {
  const base = description?.trim();
  if (!base) {
    return `${title} – Tour-Update von Mauro Gilardi, Schweizer Golfprofi und Swiss PGA Professional, aus dem Turnieralltag auf der Pro Golf Tour.`;
  }
  if (base.length >= 135) return base;
  const sentence = /[.!?…]$/.test(base) ? base : `${base}.`;
  for (const tail of BLOG_DESCRIPTION_TAILS) {
    const candidate = `${sentence} ${tail}`;
    if (candidate.length <= BLOG_DESCRIPTION_MAX) return candidate;
  }
  return base;
}

/** Blog-Beitrag als `article` inkl. publishedTime, modifiedTime, authors, section */
export function buildBlogPostMetadata(post: {
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
  /** Später: echtes Änderungsdatum, sobald `posts.updated_at` existiert */
  updated_at?: string | null;
  imageUrl: string | null;
}): Metadata {
  const title = buildSeoTitle(post.title);
  const description = blogPostDescription(post.title, post.description);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageAlt = `${post.title} – Blog von Mauro Gilardi`;
  const ogImages = post.imageUrl ? [{ url: post.imageUrl, alt: imageAlt }] : seoOgImage("tournamentAction");

  return {
    title: { absolute: title },
    description,
    keywords: [post.title, "Mauro Gilardi", "Schweizer Golfprofi", "Pro Golf Tour", "HotelPlanner Tour"],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "de_CH",
      url,
      siteName: seoSiteName,
      title,
      description,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at ?? post.created_at,
      authors: [`${SITE_URL}/ueber-mich`],
      section: "Tour-Tagebuch",
      tags: ["Golf", "Pro Golf Tour", "Mauro Gilardi"],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.imageUrl ?? seoOgImagePaths.tournamentAction],
    },
  };
}
