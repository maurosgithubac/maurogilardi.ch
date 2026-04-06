"use client";

import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { SponsorRow } from "@/types/content";
import { sponsorLogoUrl } from "@/lib/storage-public-url";

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/sponsors");
    const data = (await res.json()) as { sponsors?: SponsorRow[] };
    if (res.ok) setSponsors(data.sponsors ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function uploadLogo(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.set("bucket", "sponsor-logos");
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { path?: string; error?: string };
    if (!res.ok) {
      setError(data.error || "Upload fehlgeschlagen.");
      return null;
    }
    return data.path ?? null;
  }

  async function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const logoInput = form.elements.namedItem("logo");
    const file = logoInput instanceof HTMLInputElement ? logoInput.files?.[0] : undefined;
    if (!file || !name.trim()) {
      setError("Name und Logo-Datei erforderlich.");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadLogo(file);
      if (!path) return;
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logo_path: path,
          website_url: websiteUrl.trim() || null,
          sort_order: sortOrder,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      setName("");
      setWebsiteUrl("");
      setSortOrder(0);
      form.reset();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Partner löschen?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="admin-muted">Lade…</p>;
  }

  return (
    <div className="admin-card-stack">
      <h1 className="admin-h1">Partner</h1>
      <form onSubmit={onAdd} className="admin-form">
        <label className="admin-field">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="admin-field">
          Website (optional)
          <input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://" />
        </label>
        <label className="admin-field">
          Reihenfolge
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </label>
        <label className="admin-field">
          Logo
          <input name="logo" type="file" accept="image/*" required />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button type="submit" className="admin-submit" disabled={busy}>
          Partner hinzufügen
        </button>
      </form>

      <ul className="admin-sponsor-list">
        {sponsors.map((s) => {
          const src = sponsorLogoUrl(s.logo_path);
          return (
            <li key={s.id} className="admin-sponsor-row">
              <div className="admin-sponsor-logo-wrap">
                {src ? <Image src={src} alt={s.name} width={100} height={40} className="admin-sponsor-logo" /> : s.name}
              </div>
              <div>
                <div>{s.name}</div>
                <span className="admin-muted">#{s.sort_order}</span>
              </div>
              <button type="button" className="admin-danger" onClick={() => onDelete(s.id)} disabled={busy}>
                Löschen
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
