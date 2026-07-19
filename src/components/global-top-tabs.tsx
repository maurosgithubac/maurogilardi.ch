"use client";

const RAISE_NOW_PAYLINK_URL = "https://pay.raisenow.io/pjczf";

function openPaylink(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.href = url;
  }
}

function triggerTwintCheckout() {
  const paylinkAnchor = document.querySelector<HTMLAnchorElement>(
    "[id^='rnw-paylink-button-pjczf-'] a[href]",
  );
  if (paylinkAnchor?.href) {
    openPaylink(paylinkAnchor.href);
    return;
  }

  const selector = ["[id^='rnw-paylink-button-pjczf-'] button", "[id^='rnw-paylink-button-pjczf-'] [role='button']"].join(
    ", ",
  );

  const twintAction = document.querySelector<HTMLElement>(selector);
  if (twintAction) {
    twintAction.click();
    return;
  }

  openPaylink(RAISE_NOW_PAYLINK_URL);
}

export function GlobalTopTabs() {
  return (
    <div className="global-top-tabs" role="navigation" aria-label="Schnellzugriff">
      <button
        type="button"
        className="global-newsletter-tab global-twint-text-tab"
        aria-label="Direkt zu TWINT"
        title="TWINT"
        onClick={triggerTwintCheckout}
      >
        TWINT
      </button>
      <a href="/#newsletter" className="global-newsletter-tab">
        Newsletter
      </a>
      <a href="#kontakt" className="global-newsletter-tab" title="Kontakt">
        Kontakt
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
  );
}
