import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { socialProfiles } from "@/content/socialProfiles";
import { MgLogo } from "@/components/brand/mg-logo";
import { FooterContactForm } from "@/components/footer-contact-form";
import { SiteFooterLegalLinks } from "@/components/site-footer-legal-links";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";

type SiteFooterProps = {
  /** @deprecated Altbestand — der Footer ist immer dunkel */
  variant?: "default" | "on-dark";
  /** false = schlanke Variante ohne CTA und Kontaktformular (z. B. Admin) */
  showContactForm?: boolean;
};

export function SiteFooterCredit() {
  return (
    <p className="mg-footer__credit">
      Webseite umgesetzt von{" "}
      <a href="https://sibatusig.ch" target="_blank" rel="noopener noreferrer" className="site-footer-credit-brand">
        sibatusig.ch
      </a>
    </p>
  );
}

const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Entdecken",
    links: [
      { href: "/", label: "Home" },
      { href: "/blog", label: "Blog" },
      { href: "/erfolge", label: "Erfolge" },
      { href: "/ueber-mich", label: "Über mich" },
    ],
  },
  {
    title: "Unterstützen",
    links: [
      { href: "/sponsoring", label: "Gönner werden" },
      { href: "/sponsoring#modelle", label: "100er Club" },
      { href: "/partner", label: "Für Unternehmen" },
      { href: "/ueber-mich/sponsoren", label: "Meine Sponsoren" },
    ],
  },
  {
    title: "Mehr",
    links: [
      { href: "/ueber-mich/gallerie", label: "Galerie" },
      { href: "/ueber-mich/media", label: "Medien & Presse" },
      { href: "/ueber-mich/equipment", label: "Mein Bag" },
      { href: "/ueber-mich/faq", label: "FAQ" },
    ],
  },
  {
    title: "Folgen",
    links: [
      { href: socialProfiles.instagram.url, label: socialProfiles.instagram.label, external: true },
      { href: socialProfiles.linkedin.url, label: socialProfiles.linkedin.label, external: true },
      { href: "/#newsletter", label: "Newsletter" },
      { href: `mailto:${siteContent.contact.email}`, label: "E-Mail" },
    ],
  },
];

export function SiteFooter({ showContactForm = true }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mg-footer mg-grain" data-theme="dark">
      <div className="mg-glow mg-footer__glow" aria-hidden="true" />

      {showContactForm ? (
        <section className="mg-footer__cta mg-container" aria-labelledby="mg-footer-cta-title">
          <Reveal>
            <p className="mg-eyebrow">Teil meines Teams</p>
          </Reveal>
          <SplitText
            as="h2"
            id="mg-footer-cta-title"
            className="mg-footer__cta-title"
            text="Nächster Halt: HotelPlanner Tour."
          />
          <Reveal className="mg-footer__cta-row" delay={0.15}>
            <p className="mg-lead">
              Jeder Gönner, jeder Partner und jede Nachricht trägt mich ein Stück weiter Richtung DP World Tour.
            </p>
            <div className="mg-footer__cta-actions">
              <Link href="/sponsoring" className="mg-btn mg-btn--primary mg-btn--lg">
                Gönner werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/partner" className="mg-btn mg-btn--glass mg-btn--lg">
                Partner werden
              </Link>
            </div>
          </Reveal>
        </section>
      ) : null}

      <div className="mg-footer__main mg-container">
        {showContactForm ? <FooterContactForm /> : null}

        <nav className="mg-footer__cols" aria-label="Fusszeile">
          {COLUMNS.map((col) => (
            <div key={col.title} className="mg-footer__col">
              <p className="mg-footer__col-title">{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mg-footer__mark mg-container" aria-hidden="true">
        <MgLogo className="mg-footer__logo" withName={false} />
      </div>

      <div className="mg-footer__bottom mg-container">
        <p>
          © {year} {siteContent.brand.name} · SwissPGA Golf Professional
        </p>
        <p className="mg-footer__legal">
          <SiteFooterLegalLinks />
        </p>
        <SiteFooterCredit />
      </div>
    </footer>
  );
}
