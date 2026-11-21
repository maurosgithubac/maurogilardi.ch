"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MIN_LEN = 8;

function strengthOf(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= MIN_LEN) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Zu kurz", "Schwach", "Ok", "Gut", "Stark"];
  return { score, label: pw.length < MIN_LEN ? labels[0] : labels[Math.max(1, score)] };
}

export function AdminChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const strength = strengthOf(nextPassword);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== nextPassword;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (nextPassword.length < MIN_LEN) {
      setError(`Neues Passwort: mindestens ${MIN_LEN} Zeichen.`);
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("Neues Passwort und Bestätigung stimmen nicht überein.");
      return;
    }
    if (nextPassword === currentPassword) {
      setError("Das neue Passwort muss sich vom aktuellen unterscheiden.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        setError("Sitzung ungültig — bitte neu anmelden.");
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) {
        setError("Aktuelles Passwort ist falsch.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: nextPassword,
        data: { must_change_password: false },
      });
      if (updateError) {
        setError(
          updateError.message.includes("same")
            ? "Das neue Passwort darf nicht dem alten entsprechen."
            : updateError.message,
        );
        return;
      }

      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setSuccess("Passwort wurde geändert. Du wirst zur Übersicht weitergeleitet …");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Passwort konnte nicht geändert werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ap-form ac-form" onSubmit={(e) => void onSubmit(e)}>
      <label className="ap-field">
        <span className="ap-label">Aktuelles Passwort</span>
        <input
          className="ap-input"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={busy}
          required
        />
      </label>
      <label className="ap-field">
        <span className="ap-label">Neues Passwort</span>
        <input
          className="ap-input"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={nextPassword}
          onChange={(e) => setNextPassword(e.target.value)}
          disabled={busy}
          minLength={MIN_LEN}
          required
          aria-describedby="ap-pw-hint"
        />
        <span id="ap-pw-hint" className="ap-hint">
          Mindestens {MIN_LEN} Zeichen.
        </span>
        {nextPassword ? (
          <span className="ac-strength" data-score={strength.score} aria-live="polite">
            <span className="ac-strength-bar" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="ac-strength-label">{strength.label}</span>
          </span>
        ) : null}
      </label>
      <label className="ap-field">
        <span className="ap-label">Neues Passwort bestätigen</span>
        <input
          className="ap-input"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={mismatch ? "true" : undefined}
          disabled={busy}
          minLength={MIN_LEN}
          required
        />
        {mismatch ? <span className="ac-mismatch" role="status">Die Passwörter stimmen noch nicht überein.</span> : null}
      </label>
      <label className="ac-show">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Passwörter anzeigen
      </label>

      {error ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="ap-banner ap-banner--ok" role="status">
          {success}
        </p>
      ) : null}

      <div className="ap-form-actions">
        <button type="submit" className={`ap-btn ap-btn--primary${busy ? " is-loading" : ""}`} disabled={busy}>
          {busy ? "Speichern…" : "Passwort ändern"}
        </button>
      </div>
    </form>
  );
}
