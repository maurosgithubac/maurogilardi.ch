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
        {children}
        <CookieConsentBanner />
        <EngagementQuizPopup />
      </body>
    </html>
  );
}
