import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Über mich | Mauro Gilardi",
  description: "Über mich: Performance trifft Persönlichkeit — ich bin Mauro Gilardi, SwissPGA.",
};

export default function UeberMichPage() {
  return (
    <div className="site-page about-page">
      <SiteHeader variant="document" />

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero">
          <Image
            src="/brand-assets/images/195.png"
            alt="Mauro Gilardi im Turnier"
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">Über mich</p>
            <h1>Karriere wie ein Unternehmen.</h1>
            <p className="about-hero-lead">
              Leistungssport, Unternehmertum und klare Strukturen verbinden sich zu einem Weg mit einem Ziel:
              langfristiger Erfolg im Golf - und darüber hinaus.
            </p>
            <div className="about-hero-actions">
              <Link href="/blog" className="about-btn about-btn-primary">
                Zum Blog
              </Link>
              <Link href="/goenner" className="about-btn about-btn-ghost">
                Gönner werden
              </Link>
            </div>
          </div>
        </section>

        <section className="about-story" aria-labelledby="about-story-title">
          <div className="about-story-inner">
            <h2 id="about-story-title">Mein Weg</h2>
            <div className="about-story-layout">
              <div className="about-story-grid">
                {siteContent.story.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <aside className="about-story-portrait" aria-label="Portrait">
                <div className="about-story-portrait-frame">
                  <Image
                    src="/brand-assets/images/1L9A8795.JPG"
                    alt="Portrait von Mauro Gilardi"
                    fill
                    className="about-story-portrait-img"
                    sizes="(max-width: 640px) 52vw, 220px"
                    quality={95}
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="about-values" aria-labelledby="about-values-title">
          <div className="about-values-inner">
            <h2 id="about-values-title">Was mich trägt</h2>
            <ul className="about-values-grid">
              {siteContent.values.map((v) => (
                <li key={v.title} className="about-value-card">
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
