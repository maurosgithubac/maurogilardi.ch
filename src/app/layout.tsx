import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mauro Gilardi | SwissPGA",
  description:
    "Ich bin Mauro — hier findest du meinen Blog, meine Termine und Sponsoren. Kurz und von der Tour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="global-top-tabs" role="navigation" aria-label="Schnellzugriff">
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
      </body>
    </html>
  );
}
