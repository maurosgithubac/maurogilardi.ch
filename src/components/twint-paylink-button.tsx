"use client";

import { useEffect, useMemo } from "react";

type Props = {
  kicker?: string;
  compact?: boolean;
};

export function TwintPaylinkButton({
  kicker = "Mit freiem Betrag unterstützen",
  compact = true,
}: Props) {
  const containerId = useMemo(
    () => `rnw-paylink-button-pjczf-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  const selector = useMemo(() => `#${containerId}`, [containerId]);

  useEffect(() => {
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
  }, [selector]);

  return (
    <div className={`hero-twint-wrap${compact ? " hero-twint-wrap--compact" : ""}`} aria-label="Direkte Unterstützung per TWINT">
      <p className="hero-twint-kicker">{kicker}</p>
      <div className="hero-twint-button-shell">
        <div id={containerId} />
      </div>
    </div>
  );
}
