"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
    <div className="admin-app site-page">
      <SiteHeader variant="document" />
      <main className="admin-login">
        <div className="admin-login-card">
          <Link href="/" className="admin-login-logo-link">
            <Image
              src="/brand-assets/logos/Logo_negativ.svg"
              alt="Mauro Gilardi"
              width={160}
              height={38}
              className="admin-brand-logo"
              priority
            />
          </Link>
          <div className="admin-login-lockup">
            <span className="admin-brand-name">Mauro Gilardi</span>
            <span className="admin-brand-badge">Admin</span>
          </div>
          <p className="admin-login-dek">
            Zugang nur für freigeschaltete Admins. Gleiche Anmeldedaten wie dein Supabase-Benutzer.
          </p>
          <h1 className="admin-login-title">Anmelden</h1>
          <form onSubmit={onSubmit} className="admin-login-form">
            <label>
              E-Mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Passwort
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "..." : "Anmelden"}
            </button>
            {error ? <p className="admin-error">{error}</p> : null}
          </form>
          <Link href="/" className="admin-login-back">
            Zur Website
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
