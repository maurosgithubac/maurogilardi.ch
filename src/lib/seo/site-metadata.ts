import type { Metadata } from "next";
import { readEnvOptional } from "@/lib/env";

const siteUrl = "https://www.maurogilardi.ch";

/** Root metadata — Open Graph, Twitter, Keywords, ohne bestehendes Layout-Verhalten zu verändern */
export const siteRootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Mauro Gilardi – Schweizer Golf Professional | SwissPGA",
    template: "%s | Mauro Gilardi – Schweizer Golf Pro",
  },

  description:
    "Mauro Gilardi ist Schweizer Golf Professional (SwissPGA Pro) aus Graubünden. Aktiv auf der Pro Golf Tour in Europa, Mitglied des Swiss Golf Teams. Tour-Updates, Blog und Sponsoring.",

  keywords: [
    "Mauro Gilardi",
    "Schweizer Golf Professional",
    "Swiss Golf Pro",
    "Golf Professional Schweiz",
    "SwissPGA",
    "SwissPGA Pro",
    "Schweizer Golfspieler",
    "Schweizer Golf",
    "Golf Schweiz",
    "Bündner Golfer",
    "Golf Graubünden",
    "Pro Golf Tour",
    "Pro Golf Tour Schweiz",
    "Golf Profi Schweiz",
    "Schweizer Golfer",
    "Swiss Golf Player",
    "Golf Talent Schweiz",
    "Golf Professional",
    "Golfspieler Schweiz",
    "SwissGolf",
    "Swiss Golf Team",
    "Golf Tour Europa",
    "PGT Golf",
    "Leistungssport Golf",
    "Schweizer Nationalteam Golf",
  ],

  authors: [{ name: "Mauro Gilardi", url: siteUrl }],
  creator: "Mauro Gilardi",
  publisher: "Mauro Gilardi",

  alternates: {
    canonical: siteUrl,
    languages: {
      "de-CH": siteUrl,
    },
  },

  openGraph: {
    type: "profile",
    locale: "de_CH",
    url: siteUrl,
    siteName: "Mauro Gilardi – Schweizer Golf Professional",
    title: "Mauro Gilardi – Schweizer Golf Professional | SwissPGA",
    description:
      "Mauro Gilardi – SwissPGA Golf Professional aus Graubünden, Schweiz. Aktiv auf der Pro Golf Tour in Europa. Verfolge seinen Weg auf der Tour.",
    images: [
      {
        url: "/brand-assets/images/1L9A8795.JPG",
        width: 1200,
        height: 630,
        alt: "Mauro Gilardi – Schweizer Golf Professional auf dem Golfplatz",
      },
    ],
    firstName: "Mauro",
    lastName: "Gilardi",
    gender: "male",
    username: "maurogilardi",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mauro Gilardi – Schweizer Golf Professional | SwissPGA",
    description:
      "SwissPGA Pro aus Graubünden, aktiv auf der Pro Golf Tour in Europa. Swiss Golf Team Mitglied.",
    images: ["/brand-assets/images/1L9A8795.JPG"],
    creator: "@maurogilardi",
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

  appleWebApp: {
    capable: true,
    title: "Mauro Gilardi Golf",
    statusBarStyle: "default",
  },

  category: "sports",
};
