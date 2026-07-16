import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { EngagementQuizPopup } from "@/components/engagement-quiz-popup";
import { SeoRootJsonLd } from "@/components/seo-root-json-ld";
import { siteRootMetadata } from "@/lib/seo/site-metadata";
import "./globals.css";
import "./site-refresh.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sifonn = localFont({
  src: "./fonts/Sifonn.woff",
  variable: "--font-sifonn",
  display: "swap",
  weight: "700",
});

export const metadata: Metadata = siteRootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className={`${geistSans.variable} ${sifonn.variable} antialiased`}>
        <SeoRootJsonLd />
        <div className="global-top-tabs" role="navigation" aria-label="Schnellzugriff">
          <a
            href="/sponsoring#goenner-memberships-title"
            className="global-newsletter-tab global-twint-text-tab"
            aria-label="Direkt zu TWINT"
            title="TWINT"
          >
            TWINT
          </a>
          <a href="/#newsletter" className="global-newsletter-tab">
            Newsletter
          </a>
          <a
            href="/#pgt-events"
            className="global-events-tab"
            aria-label="Zu den anstehenden Terminen auf der Startseite"
            title="Termine"
          >
            <svg className="global-events-tab-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Termine</span>
          </a>
        </div>
        {children}
        <CookieConsentBanner />
        <EngagementQuizPopup />
      </body>
    </html>
  );
}
