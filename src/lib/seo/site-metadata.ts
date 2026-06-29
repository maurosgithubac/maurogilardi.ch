import type { Metadata } from "next";
import { socialProfiles } from "@/content/socialProfiles";
import { readEnvOptional } from "@/lib/env";
import {
  SITE_URL,
  entityKeywords,
  seoImageAlts,
  seoImages,
  seoOgImages,
  seoTwitterImages,
} from "@/lib/seo/constants";
import { seoPageTitles, seoSiteName } from "@/lib/seo/titles";

const defaultDescription =
  "Gilardi Golf – Mauro Gilardi, Swiss PGA Professional und Schweizer Golfprofi aus Graubünden. Playing Professional auf der Pro Golf Tour, Golf Coach und Golf Events in der Schweiz.";

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

  alternates: {
    canonical: SITE_URL,
    languages: {
      "de-CH": SITE_URL,
    },
  },

  openGraph: {
    type: "profile",
    locale: "de_CH",
    url: SITE_URL,
    siteName: seoSiteName,
    title: seoPageTitles.home,
    description: defaultDescription,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
    firstName: "Mauro",
    lastName: "Gilardi",
    gender: "male",
    username: socialProfiles.instagram.handle,
  },

  twitter: {
    card: "summary_large_image",
    title: seoPageTitles.home,
    description: defaultDescription,
    images: seoTwitterImages(seoImages.heroPrimary),
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
