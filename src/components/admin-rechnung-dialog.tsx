"use client";

import { useEffect, useState } from "react";

export type RechnungWahl = { status: "neu" | "bestand"; season: number };

type Props = {
  open: boolean;
  name: string;
  artLabel: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (wahl: RechnungWahl) => void;
};

/**
 * Auswahl vor dem Rechnungs-Entwurf: neuer oder bestehender Mitglied, laufendes oder kommendes Jahr.
 * Die Art (Gönner, Sponsor, Partner) kommt aus dem Profil und wird nur angezeigt.
 */
export function AdminRechnungDialog({ open, name, artLabel, busy, onClose, onConfirm }: Props) {
  const current = new Date().getFullYear();
  const seasons = [current, current + 1];
  const [status, setStatus] = useState<"neu" | "bestand">("neu");
  const [season, setSeason] = useState<number>(current);

  useEffect(() => {
    if (open) {
      setStatus("neu");
      setSeason(current);
    }
  }, [open, current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ap-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rechnung-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="ap-eyebrow">{artLabel}</p>
        <h2 id="rechnung-dialog-title" className="ap-h2">
          Rechnung für {name}
        </h2>

        <div className="ap-dialog-group">
          <span className="ap-dialog-label">Mitglied</span>
          <div className="ap-segment" role="group" aria-label="Neues oder bestehendes Mitglied">
            <button
              type="button"
              className={`ap-segment-btn${status === "neu" ? " is-active" : ""}`}
              aria-pressed={status === "neu"}
              onClick={() => setStatus("neu")}
            >
              Neu
            </button>
            <button
              type="button"
              className={`ap-segment-btn${status === "bestand" ? " is-active" : ""}`}
              aria-pressed={status === "bestand"}
              onClick={() => setStatus("bestand")}
            >
              Bestehend
            </button>
          </div>
        </div>

        <div className="ap-dialog-group">
          <span className="ap-dialog-label">Saison</span>
          <div className="ap-segment" role="group" aria-label="Saison">
            {seasons.map((y) => (
              <button
                key={y}
                type="button"
                className={`ap-segment-btn${season === y ? " is-active" : ""}`}
                aria-pressed={season === y}
                onClick={() => setSeason(y)}
              >
                {y}
                {y === current ? " · laufend" : " · kommend"}
              </button>
            ))}
          </div>
        </div>

        <p className="ap-dialog-hint">
          Die Datei öffnet sich als Entwurf in deinem Mailprogramm, mit der PDF im Anhang. Versendet wird nichts.
        </p>

        <div className="ap-dialog-actions">
          <button type="button" className="ap-btn ap-btn--ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className="ap-btn ap-btn--primary"
            disabled={busy}
            onClick={() => onConfirm({ status, season })}
          >
            {busy ? "Erstelle…" : "Entwurf öffnen"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Anzeigename der Art aus Profil oder Anmeldung. */
export function artLabelOf(m: { membership_id: string; category?: string | null }): string {
  if (m.membership_id === "sponsoring" || m.category === "sponsor") return "Sponsor";
  if (m.membership_id === "partner" || m.category === "partner") return "Partner";
  return "Gönner";
}
