"use client";

import { useEffect, useMemo } from "react";

export const TWINT_PAYLINK_URL = "https://pay.raisenow.io/pjczf";

type Props = {
  kicker?: string;
  compact?: boolean;
  /** Native branded CTA for the homepage hero. Widget stays for other pages. */
  variant?: "widget" | "hero";
};

export function TwintPaylinkButton({
  kicker = "Mit freiem Betrag unterstützen",
  compact = true,
  variant = "widget",
}: Props) {
  const containerId = useMemo(
    () => `rnw-paylink-button-pjczf-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  const selector = useMemo(() => `#${containerId}`, [containerId]);

  useEffect(() => {
    if (variant === "hero") return;

    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;

    target.innerHTML = "";

    const script = document.createElement("script");
    script.type = "module";
    script.dataset.twintPaylink = containerId;
    script.textContent = `
      import {TwintButton} from "https://unpkg.com/@raisenow/paylink-button@2/dist/TwintButton.js";
      TwintButton.render("${selector}", {
        "solution-id": "pjczf",
        "solution-type": "pay",
        "language": "de",
        "size": "large",
        "width": "fixed",
        "color-scheme": "dark",
      });
    `;

    document.body.appendChild(script);

    return () => {
      script.remove();
      target.innerHTML = "";
    };
  }, [selector, variant, containerId]);

  if (variant === "hero") {
    return (
      <a
        href={TWINT_PAYLINK_URL}
        className="hero-twint-cta"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Mit TWINT unterstützen"
      >
        TWINT
      </a>
    );
  }

  return (
    <div className={`hero-twint-wrap${compact ? " hero-twint-wrap--compact" : ""}`} aria-label="Direkte Unterstützung per TWINT">
      <p className="hero-twint-kicker">{kicker}</p>
      <div className="hero-twint-button-shell">
        <div id={containerId} />
      </div>
    </div>
  );
}
