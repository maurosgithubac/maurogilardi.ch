/**
 * Seiten-Knoten für den schema.org-Graphen (WebPage-Typen, Breadcrumbs, Blog, Medien, Galerie, Gönner).
 * Alle Knoten verweisen per `@id` auf Person/WebSite aus dem Root-Graphen (`person-jsonld.ts`).
 * `<SeoPageJsonLd>` fasst die Rückgabewerte pro Seite zu einem `@graph` zusammen.
 */

import { aboutFaqItemsFlat, plainTextFromParagraph } from "@/content/aboutFaq";
import { seasonCampaign } from "@/content/campaign";
import { careerTimeline } from "@/content/career";
import { goennerMembershipTiers } from "@/content/goennerMemberships";
import type { EnrichedPressItem } from "@/content/media-press";
import { allSiteSponsorsFlat } from "@/content/sponsorsSite";
import { SITE_URL } from "@/lib/seo/constants";
import {
  GOENNER_CATALOG_ID,
  ORG_IDS,
  PERSON_ID,
  PORTRAIT_ID,
  WEBSITE_ID,
  absoluteUrl,
  formatChf,
  pressItemType,
} from "@/lib/seo/facts";

/** @deprecated Alias — `SITE_URL` aus constants verwenden */
export const SITE_ROOT = SITE_URL;

type Node = Record<string, unknown>;
type Crumb = { name: string; path: string };

const personRef = { "@id": PERSON_ID };
const websiteRef = { "@id": WEBSITE_ID };

export function pageId(path: string): string {
  return `${absoluteUrl(path)}#webpage`;
}

export function breadcrumbId(path: string): string {
  return `${absoluteUrl(path)}#breadcrumb`;
}

/** BreadcrumbList; Home wird automatisch vorangestellt. */
export function breadcrumbJsonLd(trail: Crumb[]): Node {
  const leaf = trail[trail.length - 1];
  const all: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(leaf?.path ?? "/"),
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export type WebPageSchemaInput = {
  path: string;
  name: string;
  description: string;
  /** schema.org-Typ — z. B. ProfilePage, CollectionPage, ImageGallery, FAQPage, AboutPage */
  type?: string | string[];
  /** Breadcrumb-Pfad ohne Home; wenn gesetzt, wird `breadcrumb` verknüpft */
  trail?: Crumb[];
  about?: Node | Node[];
  mainEntity?: Node;
  primaryImage?: string;
  extra?: Node;
};

export function webPageJsonLd(input: WebPageSchemaInput): Node {
  const url = absoluteUrl(input.path);
  return {
    "@type": input.type ?? "WebPage",
    "@id": pageId(input.path),
    url,
    name: input.name,
    description: input.description,
    inLanguage: "de-CH",
    isPartOf: websiteRef,
    about: input.about ?? personRef,
    ...(input.mainEntity ? { mainEntity: input.mainEntity } : {}),
    ...(input.trail ? { breadcrumb: { "@id": breadcrumbId(input.path) } } : {}),
    ...(input.primaryImage
      ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(input.primaryImage) } }
      : {}),
    ...(input.extra ?? {}),
  };
}

/** WebPage + BreadcrumbList in einem Aufruf */
export function pageGraph(input: WebPageSchemaInput & { trail: Crumb[] }): Node[] {
  return [webPageJsonLd(input), breadcrumbJsonLd(input.trail)];
}

/** Startseite: Einstieg, Hauptentität ist die Person */
export function homeWebPageJsonLd(description: string): Node {
  return webPageJsonLd({
    path: "/",
    name: "Mauro Gilardi | Schweizer Golf Professional",
    description,
    mainEntity: personRef,
    extra: { primaryImageOfPage: { "@id": PORTRAIT_ID } },
  });
}

export function ueberMichChildBreadcrumbJsonLd(leafName: string, path: string): Node {
  return breadcrumbJsonLd([
    { name: "Über mich", path: "/ueber-mich" },
    { name: leafName, path },
  ]);
}

/** Unterseiten von /ueber-mich: WebPage-Typ + Breadcrumb */
export function ueberMichChildGraph(input: Omit<WebPageSchemaInput, "trail"> & { leafName: string }): Node[] {
  return pageGraph({
    ...input,
    trail: [
      { name: "Über mich", path: "/ueber-mich" },
      { name: input.leafName, path: input.path },
    ],
  });
}

/* ——— FAQ ——— */

export function faqPageGraph(description: string): Node[] {
  const path = "/ueber-mich/faq";
  return ueberMichChildGraph({
    path,
    leafName: "FAQ",
    type: "FAQPage",
    name: "FAQ – Mauro Gilardi",
    description,
    extra: {
      mainEntity: aboutFaqItemsFlat.map(({ question, paragraphs }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: paragraphs.map((p) => plainTextFromParagraph(p)).join(" "),
        },
      })),
    },
  });
}

/* ——— Blog ——— */

export type BlogPostLike = {
  slug: string;
  title: string;
  description?: string | null;
  created_at: string;
  image_path?: string | null;
};

const BLOG_ID = `${SITE_URL}/blog#blog`;

export function blogIndexGraph(posts: BlogPostLike[]): Node[] {
  const path = "/blog";
  return [
    ...pageGraph({
      path,
      type: "CollectionPage",
      name: "Blog – Tour-Tagebuch von Mauro Gilardi",
      description:
        "Turnierberichte, Training und Einblicke vom Schweizer Profigolfer Mauro Gilardi auf der Pro Golf Tour und HotelPlanner Tour.",
      trail: [{ name: "Blog", path }],
      mainEntity: { "@id": BLOG_ID },
    }),
    {
      "@type": "Blog",
      "@id": BLOG_ID,
      url: absoluteUrl(path),
      name: "Gilardi Golf Blog",
      inLanguage: "de-CH",
      author: personRef,
      publisher: personRef,
      isPartOf: websiteRef,
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${absoluteUrl(`/blog/${p.slug}`)}#article`,
        url: absoluteUrl(`/blog/${p.slug}`),
        headline: p.title,
        datePublished: p.created_at,
        author: personRef,
      })),
    },
  ];
}

export function blogPostingGraph(
  post: BlogPostLike & { image?: string | null; dateModified?: string | null; wordCount?: number },
): Node[] {
  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(path);
  const image = post.image ? absoluteUrl(post.image) : undefined;
  return [
    ...pageGraph({
      path,
      name: post.title,
      description: post.description || post.title,
      trail: [
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ],
      about: personRef,
      mainEntity: { "@id": `${url}#article` },
      ...(image ? { primaryImage: image } : {}),
      extra: { datePublished: post.created_at },
    }),
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: post.title,
      ...(post.description ? { description: post.description } : {}),
      ...(image ? { image: [image] } : {}),
      datePublished: post.created_at,
      dateModified: post.dateModified || post.created_at,
      inLanguage: "de-CH",
      ...(post.wordCount ? { wordCount: post.wordCount } : {}),
      author: personRef,
      publisher: personRef,
      mainEntityOfPage: { "@id": pageId(path) },
      isPartOf: { "@id": BLOG_ID },
      about: [personRef, { "@type": "Thing", name: "Golf" }],
      keywords: "Mauro Gilardi, Golf Schweiz, Swiss PGA, Pro Golf Tour, HotelPlanner Tour",
    },
  ];
}

/* ——— Medien ——— */

export function mediaPageGraph(items: EnrichedPressItem[], description: string): Node[] {
  const path = "/ueber-mich/media";
  return ueberMichChildGraph({
    path,
    leafName: "Medien",
    type: "CollectionPage",
    name: "Mauro Gilardi in den Medien",
    description,
    mainEntity: {
      "@type": "ItemList",
      "@id": `${absoluteUrl(path)}#presse`,
      name: "Presseberichte und Profile über Mauro Gilardi",
      numberOfItems: items.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": pressItemType(item),
          name: item.title,
          ...(pressItemType(item) === "NewsArticle" ? { headline: item.title } : {}),
          url: item.href,
          ...(item.dek ? { description: item.dek } : {}),
          publisher: { "@type": "Organization", name: item.outletLabel },
          ...(item.sortYear > 0 ? { temporalCoverage: String(item.sortYear) } : {}),
          about: personRef,
        },
      })),
    },
  });
}

/* ——— Galerie ——— */

export function galleryPageGraph(images: { src: string; alt: string }[], description: string): Node[] {
  return ueberMichChildGraph({
    path: "/ueber-mich/gallerie",
    leafName: "Galerie",
    type: ["CollectionPage", "ImageGallery"],
    name: "Galerie – Mauro Gilardi",
    description,
    extra: {
      image: images.map((img) => ({
        "@type": "ImageObject",
        contentUrl: absoluteUrl(img.src),
        caption: img.alt,
        creator: personRef,
        copyrightHolder: personRef,
      })),
    },
  });
}

/* ——— Sponsoren ——— */

export function sponsorenPageGraph(description: string): Node[] {
  const path = "/ueber-mich/sponsoren";
  const sponsors = allSiteSponsorsFlat();
  return ueberMichChildGraph({
    path,
    leafName: "Sponsoren",
    name: "Sponsoren von Mauro Gilardi",
    description,
    mainEntity: {
      "@type": "ItemList",
      "@id": `${absoluteUrl(path)}#sponsoren`,
      name: "Sponsoren und Partner",
      numberOfItems: sponsors.length,
      itemListElement: sponsors.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item:
          s.id === "goennervereinigung"
            ? { "@id": ORG_IDS.goennervereinigung }
            : s.id === "swissgolf"
              ? { "@id": ORG_IDS.swissGolfTeam }
              : { "@type": "Organization", name: s.displayName, ...(s.href?.startsWith("http") ? { url: s.href } : {}) },
      })),
    },
  });
}

/* ——— Gönner-Modelle (neutral: OfferCatalog einer Organisation, kein Product/Rich-Result) ——— */

export function goennerOfferCatalog(): Node {
  return {
    "@type": "OfferCatalog",
    "@id": GOENNER_CATALOG_ID,
    name: "Gönner-Modelle der MG Gönnervereinigung",
    itemListElement: goennerMembershipTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.title,
      description: tier.benefits.map((b) => b.text.replace(/\*$/, "")).join(", "),
      url: tier.id === "sponsoring" ? absoluteUrl("/partner") : `${absoluteUrl("/sponsoring")}#modelle`,
      offeredBy: { "@id": ORG_IDS.goennervereinigung },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        ...(tier.id === "sponsoring" ? { minPrice: tier.priceChf } : { price: tier.priceChf }),
        priceCurrency: "CHF",
        unitText: "pro Jahr",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "ANN" },
      },
    })),
  };
}

export function donateAction(targetPath: string): Node {
  return {
    "@type": "DonateAction",
    name: `Gönner werden — Saison ${seasonCampaign.year} von Mauro Gilardi mittragen`,
    recipient: personRef,
    target: { "@type": "EntryPoint", urlTemplate: absoluteUrl(targetPath) },
  };
}

/** /2027 — Kampagne zur Saisonfinanzierung */
export function saison2027Graph(description: string): Node[] {
  const path = "/2027";
  const { year, goalChf } = seasonCampaign;
  return pageGraph({
    path,
    name: `Saison ${year} möglich machen – Mauro Gilardi`,
    description,
    trail: [{ name: `Saison ${year}`, path }],
    about: [
      personRef,
      {
        "@type": "Thing",
        name: `Saisonfinanzierung ${year} – HotelPlanner Tour`,
        description: `Saisonbudget von rund ${formatChf(goalChf)} CHF für die erste Saison von Mauro Gilardi auf der HotelPlanner Tour (Turniere, Reisen, Training), getragen von Gönnern, Sponsoren und Partnern.`,
      },
    ],
    extra: {
      mentions: [{ "@id": ORG_IDS.goennervereinigung }, { "@id": GOENNER_CATALOG_ID }],
      potentialAction: donateAction("/2027#modelle"),
    },
  });
}

/* ——— Über mich / Erfolge / Rechtliches ——— */

/** /ueber-mich — ProfilePage, Hauptentität ist die Person */
export function profilePageGraph(description: string): Node[] {
  return pageGraph({
    path: "/ueber-mich",
    type: "ProfilePage",
    name: "Über Mauro Gilardi – Schweizer Golf Professional",
    description,
    trail: [{ name: "Über mich", path: "/ueber-mich" }],
    mainEntity: personRef,
    extra: { primaryImageOfPage: { "@id": PORTRAIT_ID } },
  });
}

/** /erfolge — Karriere-Zeitstrahl als ItemList (Quelle: career.ts) */
export function erfolgePageGraph(description: string): Node[] {
  const path = "/erfolge";
  return pageGraph({
    path,
    name: "Erfolge und Karriere-Meilensteine – Mauro Gilardi",
    description,
    trail: [{ name: "Erfolge", path }],
    mainEntity: {
      "@type": "ItemList",
      "@id": `${absoluteUrl(path)}#zeitstrahl`,
      name: "Karriere-Zeitstrahl von Mauro Gilardi",
      numberOfItems: careerTimeline.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: careerTimeline.map((entry, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${entry.year}: ${entry.title}`,
        description: entry.details.join(" "),
      })),
    },
  });
}

/** Einfache Unterseite (Impressum, Datenschutz …) mit Breadcrumb */
export function simplePageGraph(path: string, name: string, crumb: string, description: string): Node[] {
  return pageGraph({ path, name, description, trail: [{ name: crumb, path }] });
}

/* ——— Gönner & Sponsoring (neutral: WebPage + OfferCatalog, keine Product-/Review-Auszeichnung) ——— */

/** /sponsoring — Gönner-Modelle der MG Gönnervereinigung */
export function sponsoringPageGraph(description: string): Node[] {
  return pageGraph({
    path: "/sponsoring",
    name: "Gönner werden – Mauro Gilardi",
    description,
    trail: [{ name: "Gönner werden", path: "/sponsoring" }],
    about: [personRef, { "@id": ORG_IDS.goennervereinigung }],
    mainEntity: goennerOfferCatalog(),
    extra: { potentialAction: donateAction("/sponsoring#modelle") },
  });
}

/** /partner — Sponsoring für Unternehmen (Betrag ab Mindestbeitrag, individuell) */
export function partnerPageGraph(description: string): Node[] {
  return pageGraph({
    path: "/partner",
    name: "Partnerschaft und Sponsoring für Unternehmen – Mauro Gilardi",
    description,
    trail: [{ name: "Für Unternehmen", path: "/partner" }],
    about: personRef,
    extra: {
      audience: { "@type": "BusinessAudience", name: "Unternehmen und Marken" },
      mentions: [{ "@id": GOENNER_CATALOG_ID }],
    },
  });
}
