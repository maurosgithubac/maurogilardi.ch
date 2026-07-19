import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { socialProfiles } from "@/content/socialProfiles";
import { FooterContactForm } from "@/components/footer-contact-form";
import { SiteFooterLegalLinks } from "@/components/site-footer-legal-links";

type SiteFooterProps = {
  variant?: "default" | "on-dark";
  showContactForm?: boolean;
};

export function SiteFooterCredit() {
  return (
    <p className="site-footer-credit">
      Webseite umgesetzt von{" "}
      <a
        href="https://sibatusig.ch"
        target="_blank"
        rel="noopener noreferrer"
        className="site-footer-credit-brand"
      >
        sibatusig.ch
      </a>
    </p>
  );
}

export function SiteFooter({ variant = "default", showContactForm = true }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const footerClassName = variant === "on-dark" ? "site-footer site-footer--on-dark" : "site-footer";

  return (
    <footer className={footerClassName}>
      <div className="site-footer-inner">
        {showContactForm ? <FooterContactForm /> : null}

        <p>
          © {year}{" "}
          <Link href="/ueber-mich" className="site-footer-brand-link">
            {siteContent.brand.name}
          </Link>
        </p>
        <p className="site-footer-links">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/sponsoring">Sponsoring</Link>
          <Link href="/ueber-mich">Über mich</Link>
          {showContactForm ? <a href="#kontakt">Kontakt</a> : null}
          <a href={socialProfiles.instagram.url} target="_blank" rel="noopener noreferrer">
            {socialProfiles.instagram.label}
          </a>
          <a href={socialProfiles.linkedin.url} target="_blank" rel="noopener noreferrer">
            {socialProfiles.linkedin.label}
          </a>
          <SiteFooterLegalLinks />
        </p>
        <SiteFooterCredit />
      </div>
    </footer>
  );
}
