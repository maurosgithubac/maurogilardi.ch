import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@/styles/pages/not-found.css";

export const metadata: Metadata = {
  title: "Seite nicht gefunden — Mauro Gilardi",
  description: "Diese Seite gibt es auf maurogilardi.ch nicht (mehr).",
  robots: { index: false, follow: true },
};

const NEXT_STEPS = [
  { href: "/blog", label: "Blog", text: "Tour-Updates und Geschichten von unterwegs" },
  { href: "/erfolge", label: "Erfolge", text: "Resultate, Turniere und Meilensteine" },
  { href: "/sponsoring", label: "Gönner", text: "Meinen Weg auf der Tour unterstützen" },
] as const;

export default function NotFound() {
  return (
    <div className="mg-page site-page mg-notfound-page">
      <SiteHeader variant="document" />
      <main id="inhalt" className="mg-notfound">
        <section className="mg-container mg-notfound__inner" aria-labelledby="notfound-title">
          <Reveal y={20} className="mg-notfound__code" aria-hidden="true">
            404
          </Reveal>

          <div className="mg-notfound__copy">
            <p className="mg-eyebrow">Seite nicht gefunden</p>
            <SplitText
              as="h1"
              id="notfound-title"
              className="mg-h2 mg-notfound__title"
              text="Der Ball liegt wohl im Rough."
              onMount
              delay={0.1}
            />
            <Reveal y={16} delay={0.25}>
              <p className="mg-lead mg-notfound__lead">
                Diese Seite gibt es nicht – oder nicht mehr. Kein Problem: Drop ohne Strafschlag, und weiter geht’s
                auf dem Fairway.
              </p>
            </Reveal>
            <Reveal y={16} delay={0.35} className="mg-notfound__actions">
              <Link href="/" className="mg-btn mg-btn--dark mg-btn--lg">
                Zur Startseite <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>

          <Reveal as="div" y={16} delay={0.45} className="mg-notfound__next">
            <h2 className="mg-notfound__next-title">Oder direkt weiter</h2>
            <ul className="mg-notfound__links">
              {NEXT_STEPS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="mg-notfound__link">
                    <span className="mg-notfound__link-label">{item.label}</span>
                    <span className="mg-notfound__link-text">{item.text}</span>
                    <span className="mg-btn__arrow mg-notfound__link-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      </main>
      <SiteFooter showContactForm={false} />
    </div>
  );
}
