"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
/** Maximale Positionen; wie MAX_ITEMS in lib/flex-invoice.ts (dort wird nicht im Browser geladen). */
const MAX_ITEMS = 5;

export type RecipientOption = {
  key: string;
  name: string;
  organization: string;
  street: string;
  postalCode: string;
  city: string;
  email: string;
  group: string;
};

type Source = "members" | "contacts";
type Device = "desktop" | "mobile";

const todayCh = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const ContactEmpty = { name: "", organization: "", street: "", postal_code: "", city: "", email: "" };

export function AdminRechnungenClient({
  members,
  contacts,
  contactsMissing,
}: {
  members: RecipientOption[];
  contacts: RecipientOption[];
  contactsMissing: boolean;
}) {
  const router = useRouter();
  const [source, setSource] = useState<Source>("members");
  const [recipientKey, setRecipientKey] = useState<string>("");
  const [title, setTitle] = useState("Rechnung");
  const [invoiceNumber, setInvoiceNumber] = useState(`RG-${new Date().getFullYear()}-001`);
  const [invoiceDate, setInvoiceDate] = useState(todayCh());
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<{ description: string; amount: string }[]>([{ description: "", amount: "" }]);
  const [note, setNote] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [html, setHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [newContact, setNewContact] = useState(ContactEmpty);
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Vorschau passt sich der Breite an: das ganze A4-Blatt, nur das PDF-Layout
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const list = source === "members" ? members : contacts;
  const recipient = list.find((r) => r.key === recipientKey) ?? null;

  const payload = useMemo(
    () => ({
      title,
      invoiceNumber,
      invoiceDate,
      dueDate,
      note,
      recipient: recipient
        ? {
            name: recipient.name,
            organization: recipient.organization,
            street: recipient.street,
            postalCode: recipient.postalCode,
            city: recipient.city,
            email: recipient.email,
          }
        : { name: "", organization: "", street: "", postalCode: "", city: "", email: "" },
      items: items
        .slice(0, MAX_ITEMS)
        .map((it) => ({ description: it.description, amountChf: Number(String(it.amount).replace(/[’'\s]/g, "").replace(",", ".")) || 0 })),
    }),
    [title, invoiceNumber, invoiceDate, dueDate, note, recipient, items],
  );

  // Vorschau mit kurzer Verzögerung neu erzeugen
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!recipient || payload.items.every((it) => !it.description && !it.amountChf)) {
        setHtml("");
        setPreviewError(recipient ? null : "Wähle einen Empfänger, dann erscheint die Rechnung hier.");
        return;
      }
      try {
        const res = await fetch("/api/admin/rechnungen/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { html?: string; error?: string };
        if (!res.ok) {
          setPreviewError(data.error ?? "Vorschau nicht möglich.");
          return;
        }
        setPreviewError(null);
        setHtml(data.html ?? "");
      } catch {
        setPreviewError("Verbindung fehlgeschlagen.");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [payload, recipient]);

  function setItem(i: number, key: "description" | "amount", value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  }

  function addItem() {
    setItems((prev) => (prev.length < MAX_ITEMS ? [...prev, { description: "", amount: "" }] : prev));
  }

  function removeItem(i: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function downloadPdf() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/rechnungen/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "PDF konnte nicht erstellt werden.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rechnung-${invoiceNumber.replace(/[^\w.-]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ kind: "ok", text: "PDF heruntergeladen. Es wurde nichts versendet." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "PDF konnte nicht erstellt werden." });
    } finally {
      setBusy(false);
    }
  }

  async function saveContact() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/rechnungskontakte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Kontakt konnte nicht gespeichert werden.");
      setNewContact(ContactEmpty);
      setSource("contacts");
      setMessage({ kind: "ok", text: "Kontakt gespeichert." });
      router.refresh();
      setRecipientKey(data.id);
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Fehler beim Speichern." });
    } finally {
      setBusy(false);
    }
  }

  async function deleteContact(id: string) {
    if (!window.confirm("Diesen Rechnungskontakt löschen?")) return;
    const res = await fetch(`/api/admin/rechnungskontakte/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRecipientKey("");
      router.refresh();
    }
  }

  const total = payload.items.reduce((s, it) => s + it.amountChf, 0);

  return (
    <div className="ar">
      <div className="ar-form">
        <section className="ap-card ar-block">
          <h2 className="ap-h2">Empfänger</h2>
          <div className="ap-segment" role="tablist" aria-label="Quelle wählen">
            <button type="button" role="tab" aria-selected={source === "members"} className={`ap-segment-btn${source === "members" ? " is-active" : ""}`} onClick={() => { setSource("members"); setRecipientKey(""); }}>
              Plattform ({members.length})
            </button>
            <button type="button" role="tab" aria-selected={source === "contacts"} className={`ap-segment-btn${source === "contacts" ? " is-active" : ""}`} onClick={() => { setSource("contacts"); setRecipientKey(""); }}>
              Rechnungskontakte ({contacts.length})
            </button>
          </div>
          <label className="ap-field">
            <span>Person auswählen</span>
            <select className="ap-select" value={recipientKey} onChange={(e) => setRecipientKey(e.target.value)}>
              <option value="">— bitte wählen —</option>
              {list.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                  {r.organization ? ` · ${r.organization}` : ""}
                  {r.group ? ` (${r.group})` : ""}
                </option>
              ))}
            </select>
          </label>
          {source === "contacts" && recipient ? (
            <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={() => void deleteContact(recipient.key)}>
              Diesen Kontakt löschen
            </button>
          ) : null}

          {source === "contacts" ? (
            <details className="ar-new" open={contacts.length === 0}>
              <summary>Neuen Rechnungskontakt anlegen</summary>
              {contactsMissing ? (
                <p className="ap-banner ap-banner--warn" role="status">
                  Die Kontakt-Tabelle fehlt. In Supabase ausführen: <code>supabase/026_rechnungskontakte.sql</code>
                </p>
              ) : null}
              <div className="ar-grid">
                <label className="ap-field"><span>Name</span><input className="ap-input" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} /></label>
                <label className="ap-field"><span>Firma (optional)</span><input className="ap-input" value={newContact.organization} onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })} /></label>
                <label className="ap-field ar-wide"><span>Strasse</span><input className="ap-input" value={newContact.street} onChange={(e) => setNewContact({ ...newContact, street: e.target.value })} /></label>
                <label className="ap-field"><span>PLZ</span><input className="ap-input" value={newContact.postal_code} onChange={(e) => setNewContact({ ...newContact, postal_code: e.target.value })} /></label>
                <label className="ap-field"><span>Ort</span><input className="ap-input" value={newContact.city} onChange={(e) => setNewContact({ ...newContact, city: e.target.value })} /></label>
                <label className="ap-field ar-wide"><span>E-Mail</span><input className="ap-input" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} /></label>
              </div>
              <button type="button" className="ap-btn ap-btn--secondary" disabled={busy} onClick={() => void saveContact()}>
                Kontakt speichern
              </button>
            </details>
          ) : null}
        </section>

        <section className="ap-card ar-block">
          <h2 className="ap-h2">Rechnung</h2>
          <div className="ar-grid">
            <label className="ap-field"><span>Titel</span><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label className="ap-field"><span>Nummer</span><input className="ap-input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></label>
            <label className="ap-field"><span>Datum</span><input className="ap-input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></label>
            <label className="ap-field"><span>Zahlbar bis (optional)</span><input className="ap-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="z. B. 31.01.2027" /></label>
          </div>

          <div className="ar-items">
            <span className="ap-field-label">Positionen (max. {MAX_ITEMS})</span>
            {items.map((it, i) => (
              <div className="ar-item" key={i}>
                <input className="ap-input" placeholder="Beschreibung" value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} />
                <input className="ap-input ar-amount" inputMode="decimal" placeholder="CHF" value={it.amount} onChange={(e) => setItem(i, "amount", e.target.value)} />
                <button type="button" className="ap-icon-btn" aria-label={`Position ${i + 1} entfernen`} onClick={() => removeItem(i)}>×</button>
              </div>
            ))}
            {items.length < MAX_ITEMS ? (
              <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={addItem}>+ Position</button>
            ) : null}
            <p className="ar-total">Total: <strong>CHF {total.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</strong></p>
          </div>

          <label className="ap-field">
            <span>Notiz (optional)</span>
            <textarea className="ap-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </section>

        <div className="ar-actions">
          <button type="button" className="ap-btn ap-btn--primary" disabled={busy || !recipient || !html} onClick={() => void downloadPdf()}>
            {busy ? "Erstelle…" : "PDF herunterladen"}
          </button>
          {message ? (
            <p className={`ap-banner ${message.kind === "error" ? "ap-banner--warn" : ""}`} role="status">{message.text}</p>
          ) : null}
        </div>
      </div>

      <section className="ar-preview" aria-label="Vorschau">
        <div className="ar-preview-head">
          <h2 className="ap-h2">Vorschau</h2>
          <div className="ap-segment" role="group" aria-label="Bildschirmgrösse">
            <button type="button" className={`ap-segment-btn${device === "desktop" ? " is-active" : ""}`} onClick={() => setDevice("desktop")}>Desktop</button>
            <button type="button" className={`ap-segment-btn${device === "mobile" ? " is-active" : ""}`} onClick={() => setDevice("mobile")}>Handy</button>
          </div>
        </div>
        {previewError ? <p className="ar-empty">{previewError}</p> : null}
        <div ref={frameRef} className={`ar-frame ar-frame--${device}`} style={{ height: 1123 * scale }}>
          {html ? (
            <iframe
              title="Rechnungsvorschau"
              srcDoc={html}
              className="ar-iframe"
              style={{ width: 794, height: 1123, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
