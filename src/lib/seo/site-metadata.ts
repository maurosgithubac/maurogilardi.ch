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

const defaultDescription =
  "Swiss PGA Professional Mauro Gilardi: Schweizer Golfprofi, Spitzensportler, Playing Professional, Golf Coach, Referent und Gastgeber exklusiver Golf Experiences in der Schweiz.";

/** Root metadata — Open Graph; Summary-Card-Feldern für externe Link-Vorschau (kein eigenes Twitter/X-Konto) */
export const siteRootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
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
    siteName: "Mauro Gilardi | Swiss PGA Professional",
    title: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
    description: defaultDescription,
    images: seoOgImages(seoImages.heroPrimary, seoImageAlts.heroPrimary),
    firstName: "Mauro",
    lastName: "Gilardi",
    gender: "male",
    username: socialProfiles.instagram.handle,
  },

  twitter: {
    card: "summary_large_image",
    title: "Mauro Gilardi | Swiss PGA Professional & Golfprofi",
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
    title: "Mauro Gilardi Golf",
    statusBarStyle: "default",
  },

  category: "sports",
};
