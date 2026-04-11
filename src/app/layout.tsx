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
    "Ich bin Mauro — hier findest du meinen Blog, meine Termine und Partner. Kurz und von der Tour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className={`${geistSans.variable} antialiased`}>
        <a href="/#newsletter" className="global-newsletter-tab">
          Newsletter
        </a>
        {children}
      </body>
    </html>
  );
}
