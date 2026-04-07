"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostRow } from "@/types/content";
import { blogImageUrl } from "@/lib/storage-public-url";
import Image from "next/image";

type Props = {
  initial?: PostRow;
};

export function AdminPostForm({ initial }: Props) {
  const router = useRouter();
  const editing = !!initial?.id;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [imagePath, setImagePath] = useState(initial?.image_path ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = blogImageUrl(imagePath || null);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("bucket", "blog-images");
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { path?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Upload fehlgeschlagen.");
        return;
      }
      if (data.path) setImagePath(data.path);
    } catch {
      setError("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing && initial) {
        const res = await fetch(`/api/admin/posts/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description.trim() || null,
            body,
            image_path: imagePath || null,
            published,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error || "Speichern fehlgeschlagen.");
          return;
        }
      } else {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description.trim() || null,
            body,
            image_path: imagePath || null,
            published,
          }),
        });
        const data = (await res.json()) as { error?: string; post?: PostRow };
        if (!res.ok) {
          setError(data.error || "Speichern fehlgeschlagen.");
          return;
        }
        if (data.post?.id) {
          router.push(`/admin/posts/${data.post.id}`);
          router.refresh();
          return;
        }
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card-stack">
      <header className="admin-page-head">
        <p className="admin-page-kicker">Blog</p>
        <h1 className="admin-h1">{editing ? "Beitrag bearbeiten" : "Neuer Beitrag"}</h1>
        <p className="admin-muted admin-page-lead">
          {editing
            ? "Bearbeite Inhalt, Titelbild und Veröffentlichungsstatus dieses Beitrags."
            : "Neuen Blog-Artikel anlegen und direkt mit Bild für die Website vorbereiten."}
        </p>
      </header>

      <form className="admin-form admin-form-card" onSubmit={onSubmit}>
        <div className="admin-field-grid">
          <label className="admin-field admin-field--wide">
            Titel
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="admin-field admin-field--wide">
            Kurzbeschreibung
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Eine Zeile für Vorschau & SEO"
            />
          </label>
        </div>

        <label className="admin-field">
          Text
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={12} required />
        </label>

        <div className="admin-media-block">
          <label className="admin-field">
            Titelbild
            <input type="file" accept="image/*" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
            {uploading ? <span className="admin-hint">Lade Bild hoch…</span> : <span className="admin-hint">JPG/PNG empfohlen.</span>}
          </label>
          {previewUrl ? (
            <div className="admin-preview">
              <Image src={previewUrl} alt="" width={320} height={200} className="admin-preview-img" />
            </div>
          ) : null}
        </div>

        <label className="admin-check">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          Veröffentlicht
        </label>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-form-actions">
          <button type="submit" className="admin-submit" disabled={saving}>
            {saving ? "Speichert..." : editing ? "Änderungen speichern" : "Beitrag erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
}
