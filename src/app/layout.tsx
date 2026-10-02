import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { EngagementQuizPopup } from "@/components/engagement-quiz-popup";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SeoRootJsonLd } from "@/components/seo-root-json-ld";
import { siteRootMetadata } from "@/lib/seo/site-metadata";
import "./globals.css";
import "./site-refresh.css";
import "@/styles/mg-tokens.css";
import "@/styles/mg-chrome.css";
import "@/styles/mg-home.css";
import "@/styles/mg-pages.css";

/** Display: Inter Tight — Überschriften, grosse Zahlen */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

/** Fliesstext & UI */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Zahlen, Daten, Scores */
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const sifonn = localFont({
  src: "./fonts/Sifonn.woff",
  variable: "--font-sifonn",
  display: "swap",
  weight: "700",
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
    <html lang="de-CH" className={`${interTight.variable} ${inter.variable} ${mono.variable} ${sifonn.variable}`}>
      <body className="antialiased">
        <SeoRootJsonLd />
        <MotionProvider>
          {children}
          <CookieConsentBanner />
          <EngagementQuizPopup />
        </MotionProvider>
      </body>
    </html>
  );
}
