import type { Metadata } from "next";
import { socialProfiles } from "@/content/socialProfiles";
import { readEnvOptional } from "@/lib/env";
import {
  SITE_URL,
  entityKeywords,
  seoOgImage,
  seoOgImagePaths,
} from "@/lib/seo/constants";
import { seoPageTitles, seoSiteName } from "@/lib/seo/titles";

const defaultDescription =
  "Mauro Gilardi ist Schweizer Golfprofi und Swiss PGA Professional aus Graubünden. 2026 gelang ihm der Aufstieg von der Pro Golf Tour in die HotelPlanner Tour.";

/** Root metadata — Open Graph; Summary-Card-Feldern für externe Link-Vorschau (kein eigenes Twitter/X-Konto) */
export const siteRootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: seoPageTitles.home,
    template: "%s",
  },

  description: defaultDescription,

  keywords: [...entityKeywords],

  authors: [{ name: "Mauro Gilardi", url: SITE_URL }],
  creator: "Mauro Gilardi",
  publisher: "Mauro Gilardi",

  /*
   * Kein globales `alternates.canonical`: Es würde an jede Seite ohne eigenes
   * canonical vererbt (404, Admin) und dort fälschlich auf die Startseite zeigen.
   * Jede öffentliche Seite setzt ihr canonical selbst (buildPageMetadata).
   */

  openGraph: {
    type: "profile",
    locale: "de_CH",
    url: SITE_URL,
    siteName: seoSiteName,
    title: seoPageTitles.home,
    description: defaultDescription,
    images: seoOgImage("heroPrimary"),
    firstName: "Mauro",
    lastName: "Gilardi",
    gender: "male",
    username: socialProfiles.instagram.handle,
  },

  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.home,
    description: defaultDescription,
    images: [seoOgImagePaths.heroPrimary],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  ...(readEnvOptional("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION")
    ? {
        verification: {
          google: readEnvOptional("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"),
        },
      }
    : {}),

  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },

  appleWebApp: {
    capable: true,
    title: "Gilardi Golf | Mauro Gilardi",
    statusBarStyle: "default",
  },

  category: "sports",
};
