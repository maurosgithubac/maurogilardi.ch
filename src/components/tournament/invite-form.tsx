"use client";

import { useState } from "react";
import type { InviteKind } from "@/lib/tournament";

type Initial = {
  clinic: boolean;
  golf_round: boolean;
  dinner: boolean;
  note: string;
  responded: boolean;
};

export function InviteForm({
  token,
  kind,
  name,
  email,
  closed,
  clinicTime,
  flightTime,
  dinnerTime,
  initial,
}: {
  token: string;
  kind: InviteKind;
  name: string;
  email: string;
  closed: boolean;
  clinicTime: string;
  flightTime: string;
  dinnerTime: string;
  initial: Initial;
}) {
  const [clinic, setClinic] = useState(initial.clinic);
  const [round, setRound] = useState(initial.golf_round);
  const [dinner, setDinner] = useState(initial.dinner);
  const [note, setNote] = useState(initial.note);
  const [busy, setBusy] = useState<"save" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(initial.responded ? "Gespeichert. Du kannst die Auswahl noch ändern." : null);

  async function submit(decline: boolean) {
    setBusy(decline ? "decline" : "save");
    setError(null);
    setDone(null);
    try {
      const res = await fetch(`/api/turnier/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, golf_round: round, dinner, note, decline }),
      });
      const data = (await res.json()) as { error?: string; warning?: string; invite?: Initial };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      if (decline) {
        setClinic(false);
        setRound(false);
        setDinner(false);
      }
      setDone(
        data.warning
          ? "Gespeichert. Die Bestätigung per Mail ist nicht rausgegangen, der Eintrag ist aber da."
          : decline
            ? "Schade. Ich habe deine Absage und schicke dir eine kurze Bestätigung."
            : "Danke. Du bekommst eine Bestätigung per Mail. Über diesen Link kannst du später noch ändern.",
      );
    } catch {
      setError("Speichern fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  const choices = [
    ...(kind === "clinic"
      ? [{ id: "clinic" as const, title: "Golfklinik", text: clinicTime, on: clinic, set: setClinic }]
      : []),
    {
      id: "round" as const,
      title: "Golfrunde",
      text: `Scramble, erstes Flight ca. ${flightTime}. Ich spiele mit jedem Flight ein bis zwei Löcher mit.`,
      on: round,
      set: setRound,
    },
    {
      id: "dinner" as const,
      title: "Abendessen",
      text: `Ab ${dinnerTime} im Clubhaus, Saisonrückschau, Ausblick und Fragen.`,
      on: dinner,
      set: setDinner,
    },
  ];

  return (
    <form
      className="tn-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <dl className="tn-who">
        <div>
          <dt>Name</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>E-Mail</dt>
          <dd>{email}</dd>
        </div>
      </dl>

      {closed ? (
        <p className="tn-banner" role="status">
          Die Anmeldung ist geschlossen. Wenn sich bei dir noch etwas ändert, schreib mir kurz.
        </p>
      ) : (
        <>
          <fieldset className="tn-choices">
            <legend>Wobei bist du dabei?</legend>
            {choices.map((choice) => (
              <label key={choice.id} className={`tn-choice${choice.on ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={choice.on}
                  onChange={(event) => choice.set(event.target.checked)}
                />
                <span>
                  <strong>{choice.title}</strong>
                  <span>{choice.text}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="tn-note">
            <span>Bemerkung, freiwillig</span>
            <textarea value={note} maxLength={500} rows={3} onChange={(event) => setNote(event.target.value)} />
          </label>

          {error ? (
            <p className="tn-banner tn-banner--error" role="alert">
              {error}
            </p>
          ) : null}
          {done ? (
            <p className="tn-banner tn-banner--ok" role="status">
              {done}
            </p>
          ) : null}

          <div className="tn-actions">
            <button type="submit" className="tn-primary" disabled={busy !== null}>
              {busy === "save" ? "Speichern…" : "Anmeldung speichern"}
            </button>
            <button type="button" className="tn-quiet" disabled={busy !== null} onClick={() => void submit(true)}>
              {busy === "decline" ? "Speichern…" : "Ich kann nicht dabei sein"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
