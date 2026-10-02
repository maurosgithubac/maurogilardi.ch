"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MgLogo } from "@/components/brand/mg-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError(signError.message.includes("Invalid login") ? "E-Mail oder Passwort ungültig." : signError.message);
        return;
      }
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Sitzung konnte nicht gestartet werden.");
        return;
      }
      const { data: row, error: adminErr } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (adminErr || !row) {
        await supabase.auth.signOut();
        setError("Kein Admin-Zugang. Bitte User-ID in Supabase „admin_users“ eintragen.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-app">
      <main className="ap-login">
        <div className="ap-login-card">
          <Link href="/" className="ap-login-brand" aria-label="Zur Website von Mauro Gilardi">
            <MgLogo withName={false} className="ap-login-mark" title="MG" />
          </Link>
          <p className="ap-eyebrow">Gönner-Admin</p>
          <h1 className="ap-h1">Anmelden</h1>
          <p className="ap-page-desc">Zugang nur für freigeschaltete Admins. Gleiche Anmeldedaten wie dein Supabase-Benutzer.</p>
          <form onSubmit={onSubmit} className="ap-form ap-login-form">
            <label className="ap-field">
              <span className="ap-label">E-Mail</span>
              <input
                className="ap-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Passwort</span>
              <input
                className="ap-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error ? (
              <p className="ap-banner ap-banner--error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="ap-btn ap-btn--primary ap-btn--block" disabled={loading}>
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>
        </div>
        <Link href="/" className="ap-login-back">
          ← Zur Website
        </Link>
      </main>
    </div>
  );
}
