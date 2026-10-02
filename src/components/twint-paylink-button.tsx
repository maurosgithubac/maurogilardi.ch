"use client";

import { useEffect, useId } from "react";
import { TWINT_PAYLINK_URL } from "@/lib/twint";

/** Feste Version statt "@2" — keine ungeprüften Updates von unpkg. */
const PAYLINK_MODULE_URL = "https://unpkg.com/@raisenow/paylink-button@2.0.1/dist/TwintButton.js";

type Props = {
  kicker?: string;
  compact?: boolean;
  /** "hero" = eigener Marken-Button (Link), "widget" = offizielles RaiseNow-Widget */
  variant?: "widget" | "hero";
};

export function TwintPaylinkButton({
  kicker = "Mit freiem Betrag unterstützen",
  compact = true,
  variant = "widget",
}: Props) {
  // useId ist auf Server und Client identisch → kein Hydration-Mismatch
  const containerId = `rnw-paylink-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (variant === "hero") return;

    const target = document.getElementById(containerId);
    if (!target) return;

    target.innerHTML = "";

    const script = document.createElement("script");
    script.type = "module";
    script.dataset.twintPaylink = containerId;
    script.textContent = `
      import {TwintButton} from "${PAYLINK_MODULE_URL}";
      TwintButton.render("#${containerId}", {
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
  }, [variant, containerId]);

  if (variant === "hero") {
    return (
      <a href={TWINT_PAYLINK_URL} className="mg-btn mg-btn--dark" target="_blank" rel="noopener noreferrer">
        Mit TWINT unterstützen <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <div className={`hero-twint-wrap${compact ? " hero-twint-wrap--compact" : ""}`} aria-label="Direkte Unterstützung per TWINT">
      {kicker ? <p className="hero-twint-kicker">{kicker}</p> : null}
      <div className="hero-twint-button-shell">
        <div id={containerId} />
      </div>
    </div>
  );
}
