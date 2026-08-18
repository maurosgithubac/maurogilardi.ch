"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MIN_LEN = 8;

export function AdminChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

      const { error: updateError } = await supabase.auth.updateUser({ password: nextPassword });
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
      setSuccess("Passwort wurde geändert. Du bleibst angemeldet.");
    } catch {
      setError("Passwort konnte nicht geändert werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mgf-form mgf-password-form" onSubmit={(e) => void onSubmit(e)}>
      <label>
        Aktuelles Passwort
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={busy}
          required
        />
      </label>
      <label>
        Neues Passwort
        <input
          type="password"
          autoComplete="new-password"
          value={nextPassword}
          onChange={(e) => setNextPassword(e.target.value)}
          disabled={busy}
          minLength={MIN_LEN}
          required
        />
      </label>
      <label>
        Neues Passwort bestätigen
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={busy}
          minLength={MIN_LEN}
          required
        />
      </label>

      {error ? <p className="mgf-banner mgf-banner--warn">{error}</p> : null}
      {success ? <p className="mgf-banner mgf-banner--ok">{success}</p> : null}

      <div className="mgf-form-actions">
        <button type="submit" className="mgf-btn mgf-btn--primary" disabled={busy}>
          {busy ? "Speichern…" : "Passwort ändern"}
        </button>
      </div>
    </form>
  );
}
