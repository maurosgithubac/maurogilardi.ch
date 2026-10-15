import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Playfair_Display } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SeoRootJsonLd } from "@/components/seo-root-json-ld";
import { siteRootMetadata } from "@/lib/seo/site-metadata";
import "./globals.css";
import "./site-refresh.css";
import "@/styles/mg-tokens.css";
import "@/styles/mg-chrome.css";
import "@/styles/mg-home.css";
import "@/styles/mg-pages.css";
import "@/styles/mg-video.css";

/**
 * Markenschrift Gilardi Golf: Playfair Display für Titel UND Fliesstext
 * (verbindlich laut Brand-System des Sponsoring-Dossiers). Variable Font inkl. Kursiv.
 */
const Analytics = dynamic(() => import("@vercel/analytics/next").then((mod) => mod.Analytics));
const AnalyticsEvents = dynamic(() =>
  import("@/components/analytics-events").then((mod) => mod.AnalyticsEvents),
);
const CookieConsentBanner = dynamic(() =>
  import("@/components/cookie-consent-banner").then((mod) => mod.CookieConsentBanner),
);
const EngagementQuizPopup = dynamic(() =>
  import("@/components/engagement-quiz-popup").then((mod) => mod.EngagementQuizPopup),
);

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = siteRootMetadata;

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font-Variablen auf <html>, damit :root-Tokens sie auflösen können
    <html lang="de-CH" className={playfair.variable}>
      <body className="antialiased">
        <SeoRootJsonLd />
        <MotionProvider>
          {children}
          <CookieConsentBanner />
          <EngagementQuizPopup />
        </MotionProvider>
        <AnalyticsEvents />
        <Analytics />
      </body>
    </html>
  );
}
