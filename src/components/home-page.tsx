"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { siteContent, TournamentFilter } from "@/content/siteContent";

const filters: { id: TournamentFilter; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "pgt", label: "ProGolf Tour" },
  { id: "2026", label: "2026" },
];

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState<TournamentFilter>("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTournaments = useMemo(() => {
    if (activeFilter === "all") {
      return siteContent.tournaments;
    }
    return siteContent.tournaments.filter((entry) => entry.tags.includes(activeFilter));
  }, [activeFilter]);

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email.includes("@")) {
      setNewsletterMessage("Bitte gib eine gültige E-Mail Adresse ein.");
      return;
    }

    setIsSubmitting(true);
    setNewsletterMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setNewsletterMessage(data.error || "Etwas ist schiefgelaufen. Bitte später erneut versuchen.");
        return;
      }

      setNewsletterMessage(data.message || "Vielen Dank für das Abonnieren!");
      event.currentTarget.reset();
    } catch {
      setNewsletterMessage("Verbindung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <Link href="#top" className="brand">
          <span className="brand-mark">{siteContent.brand.short}</span>
          <span>{siteContent.brand.name}</span>
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="main-nav"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          Menü
        </button>

        <nav id="main-nav" className={`main-nav ${isMenuOpen ? "open" : ""}`}>
          {[
            { href: "#weg-zum-ziel", label: "Weg zum Ziel" },
            { href: "#turniere", label: "Turniere" },
            { href: "#news", label: "News" },
            { href: "#partner", label: "Partner" },
            { href: "#kontakt", label: "Kontakt" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top" className="page-shell">
        <section className="hero">
          <div>
            <p className="eyebrow">{siteContent.brand.role}</p>
            <h1>{siteContent.brand.headline}</h1>
            <p className="lead">{siteContent.brand.intro}</p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#kontakt">
                Teil meines Teams werden
              </a>
              <a className="btn btn-ghost" href="#weg-zum-ziel">
                Mehr über meinen Weg
              </a>
            </div>
          </div>

          <aside className="hero-stats">
            {[
              { value: "4", label: "Cuts auf Challenge Tour" },
              { value: "2", label: "Jahresziel Aufstieg" },
              { value: "2025", label: "Fokusjahr ProGolf Tour" },
            ].map((stat) => (
              <article key={stat.label} className="stat-card">
                <p className="stat-number">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </article>
            ))}
          </aside>
        </section>

        <section className="section">
          <h2>Wofür ich stehe</h2>
          <div className="grid grid-3">
            {siteContent.values.map((value) => (
              <article key={value.title} className="card">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="weg-zum-ziel" className="section">
          <h2>Weg zum Ziel</h2>
          <div className="story">
            {siteContent.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section id="turniere" className="section">
          <div className="section-head">
            <h2>Turniere</h2>
            <div className="filters" role="group" aria-label="Turnierfilter">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`chip ${activeFilter === filter.id ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-3">
            {filteredTournaments.map((entry) => (
              <article key={entry.name} className="card tournament-card">
                <p className="date">{entry.date}</p>
                <h3>{entry.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section id="news" className="section">
          <h2>News</h2>
          <div className="accordion">
            {siteContent.news.map((item, index) => (
              <details key={item.month} open={index === 0}>
                <summary>{item.month}</summary>
                <p>{item.text}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="partner" className="section">
          <h2>Partner</h2>
          <div className="grid grid-3">
            {siteContent.partnerGroups.map((group) => (
              <article key={group.title} className="card">
                <h3>{group.title}</h3>
                <p>{group.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="kontakt" className="section card contact">
          <h2>MG Newsletter</h2>
          <p>Werde Teil meines Teams und erhalte News zu Turnieren und Ergebnissen.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <label htmlFor="email" className="sr-only">
              E-Mail Adresse
            </label>
            <input id="email" name="email" type="email" placeholder="E-Mail Adresse hier eintragen" required />
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sende..." : "Abonnieren"}
            </button>
          </form>
          <p className="form-message" aria-live="polite">
            {newsletterMessage}
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>{`© ${new Date().getFullYear()} ${siteContent.brand.name}. Alle Rechte vorbehalten.`}</p>
      </footer>
    </>
  );
}
