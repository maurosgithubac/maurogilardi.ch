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

const STATUS_OPTIONS = [
  { id: "neu", title: "Neu", sub: "Neues Mitglied" },
  { id: "bestand", title: "Bestehend", sub: "Bereits Mitglied" },
] as const;

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
        className="ap-dialog iv-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rechnung-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="iv-dialog-head">
          <p className="ap-eyebrow">{artLabel}</p>
          <h2 id="rechnung-dialog-title" className="ap-h2">
            Rechnung für {name}
          </h2>
        </div>

        <fieldset className="iv-group">
          <legend className="ap-label iv-group-label">Mitglied</legend>
          <div className="iv-choices">
            {STATUS_OPTIONS.map((o) => (
              <button key={o.id} type="button" className="iv-choice" aria-pressed={status === o.id} onClick={() => setStatus(o.id)}>
                <span className="iv-choice-check" aria-hidden="true" />
                <span className="iv-choice-title">{o.title}</span>
                <span className="iv-choice-sub">{o.sub}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="iv-group">
          <legend className="ap-label iv-group-label">Saison</legend>
          <div className="iv-choices">
            {seasons.map((y) => (
              <button key={y} type="button" className="iv-choice" aria-pressed={season === y} onClick={() => setSeason(y)}>
                <span className="iv-choice-check" aria-hidden="true" />
                <span className="iv-choice-title">{y}</span>
                <span className="iv-choice-sub">{y === current ? "Laufende Saison" : "Kommende Saison"}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <p className="iv-dialog-note">
          Die Datei öffnet sich als Entwurf in deinem Mailprogramm, mit der PDF im Anhang. Versendet wird nichts.
        </p>

        <div className="ap-dialog-foot">
          <button type="button" className="ap-btn ap-btn--ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className={`ap-btn ap-btn--primary${busy ? " is-loading" : ""}`}
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
