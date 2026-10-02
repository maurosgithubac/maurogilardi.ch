import Link from "next/link";
import { seasonCampaign } from "@/content/campaign";
import { getCommittedAnnualChf } from "@/lib/public-stats";

/** "75'000" — fester Apostroph (Server-Komponente, aber konsistent zur übrigen Seite) */
function chf(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

/**
 * Schlanker Finanzierungs-Streifen: Saisonziel, getragener Betrag (live aus dem Portal),
 * dünner Balken, Link zu den Gönner-Optionen. So wenig Höhe wie möglich.
 */
export async function FundingStrip({ href = "/2027#modelle" }: { href?: string }) {
  if (!seasonCampaign.showFunding) return null;
  const committed = await getCommittedAnnualChf();
  if (committed == null) return null;

  const { year, goalChf } = seasonCampaign;
  const pct = Math.min(100, Math.round((committed / goalChf) * 100));
  const open = Math.max(0, goalChf - committed);

  return (
    <section className="mg-funding" aria-label={`Saisonbudget ${year}`}>
      <div className="mg-funding__inner mg-container">
        <p className="mg-funding__text">
          <span className="mg-funding__label">Saison {year}</span>
          <strong className="mg-mono">
            CHF {chf(committed)} <span>von {chf(goalChf)}</span>
          </strong>
          <span className="mg-funding__open">{open > 0 ? `noch ${chf(open)} offen` : "Ziel erreicht — merci!"}</span>
        </p>
        <div
          className="mg-funding__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goalChf}
          aria-valuenow={Math.min(committed, goalChf)}
          aria-label={`${pct} Prozent des Saisonbudgets ${year} getragen`}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <Link href={href} className="mg-funding__cta" data-track="funding_strip_click">
          Mithelfen <span className="mg-btn__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Finanzierungs-Karte im Hero (Landing Screen): Glas-Karte auf dem Foto,
 * grosse Prozentzahl, kräftiger Balken — sofort sichtbar ohne Scrollen.
 */
export async function FundingHeroCard({ href = "/2027#modelle" }: { href?: string }) {
  if (!seasonCampaign.showFunding) return null;
  const committed = await getCommittedAnnualChf();
  if (committed == null) return null;

  const { year, goalChf } = seasonCampaign;
  const pct = Math.min(100, Math.round((committed / goalChf) * 100));
  const open = Math.max(0, goalChf - committed);

  return (
    <Link href={href} className="mg-funding-card" data-track="funding_hero_click" aria-label={`Saison ${year}: ${pct} Prozent getragen — mithelfen`}>
      <span className="mg-funding-card__top">
        <span className="mg-funding-card__label">Saison {year} finanzieren</span>
        <span className="mg-funding-card__pct mg-mono">{pct} %</span>
      </span>
      <span
        className="mg-funding-card__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goalChf}
        aria-valuenow={Math.min(committed, goalChf)}
      >
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="mg-funding-card__bottom">
        <span className="mg-mono">
          CHF {chf(committed)} <span className="mg-funding-card__muted">von {chf(goalChf)}</span>
        </span>
        <span className="mg-funding-card__cta">
          {open > 0 ? `Noch ${chf(open)} — mithelfen` : "Merci — Ziel erreicht"}{" "}
          <span className="mg-btn__arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}
