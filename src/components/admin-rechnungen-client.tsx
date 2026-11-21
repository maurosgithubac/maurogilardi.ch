"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CountUp } from "@/components/admin/ui/count-up";
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

const chf = (n: number) => n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parsePrice = (v: string) => Number(String(v).replace(/[’'\s]/g, "").replace(",", ".")) || 0;
const stagger = (n: number) => ({ "--i": n }) as React.CSSProperties;

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
  const [items, setItems] = useState<{ description: string; qty: string; unit: string; price: string }[]>([{ description: "", qty: "1", unit: "Stk.", price: "" }]);
  const [note, setNote] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [html, setHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
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
        .map((it) => ({ description: it.description, unit: it.unit || "Stk.", quantity: Math.max(1, Math.round(Number(it.qty) || 1)), unitPriceChf: parsePrice(it.price) })),
    }),
    [title, invoiceNumber, invoiceDate, dueDate, note, recipient, items],
  );

  // Vorschau mit kurzer Verzögerung neu erzeugen
  useEffect(() => {
    const t = setTimeout(async () => {
      setPreviewLoading(true);
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
      } finally {
        setPreviewLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [payload, recipient]);

  function setItem(i: number, key: "description" | "qty" | "unit" | "price", value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  }

  function addItem() {
    setItems((prev) => (prev.length < MAX_ITEMS ? [...prev, { description: "", qty: "1", unit: "Stk.", price: "" }] : prev));
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

  const total = payload.items.reduce((s, it) => s + it.quantity * it.unitPriceChf, 0);
  const filled = payload.items.filter((it) => it.description.trim() || it.unitPriceChf).length;
  const canPdf = Boolean(recipient) && Boolean(html) && !busy;
  const hint = !recipient ? "Wähle zuerst einen Empfänger." : !html ? "Die Vorschau wird noch erstellt." : "Es wird nichts versendet.";
  const addressLine = recipient ? [recipient.street, [recipient.postalCode, recipient.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") : "";

  return (
    <div className="iv">
      <div className="iv-form">
        <section className="ap-card iv-card" style={stagger(0)}>
          <header className="iv-card-head">
            <h2 className="iv-h2">Empfänger</h2>
            <p className="iv-sub">Wer bekommt die Rechnung?</p>
          </header>
          <div className="ap-segment iv-seg" role="group" aria-label="Quelle wählen">
            <button type="button" aria-pressed={source === "members"} className="ap-segment-btn" onClick={() => { setSource("members"); setRecipientKey(""); }}>
              Plattform <span className="ap-segment-count">{members.length}</span>
            </button>
            <button type="button" aria-pressed={source === "contacts"} className="ap-segment-btn" onClick={() => { setSource("contacts"); setRecipientKey(""); }}>
              Rechnungskontakte <span className="ap-segment-count">{contacts.length}</span>
            </button>
          </div>
          <label className="ap-field">
            <span className="ap-label">Person auswählen</span>
            <select className="ap-select" value={recipientKey} onChange={(e) => setRecipientKey(e.target.value)}>
              <option value="">Bitte wählen</option>
              {list.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                  {r.organization ? ` · ${r.organization}` : ""}
                  {r.group ? ` (${r.group})` : ""}
                </option>
              ))}
            </select>
          </label>

          {recipient ? (
            <div className="iv-recipient" key={recipient.key}>
              <span className="iv-avatar" aria-hidden="true">{recipient.name.trim().charAt(0).toUpperCase()}</span>
              <div className="iv-recipient-text">
                <strong>{recipient.name}</strong>
                {recipient.organization ? <span>{recipient.organization}</span> : null}
                <span>{addressLine || "Keine Adresse hinterlegt"}</span>
                {recipient.email ? <span>{recipient.email}</span> : null}
              </div>
              {source === "contacts" ? (
                <button type="button" className="ap-btn ap-btn--danger-ghost ap-btn--sm" onClick={() => void deleteContact(recipient.key)}>
                  Löschen
                </button>
              ) : null}
            </div>
          ) : (
            <p className="iv-empty-line">
              {source === "contacts" && contacts.length === 0
                ? "Noch keine Rechnungskontakte. Lege unten den ersten an."
                : "Noch niemand gewählt. Die Adresse erscheint dann in der Vorschau."}
            </p>
          )}

          {source === "contacts" ? (
            <details className="iv-new" open={contacts.length === 0}>
              <summary>
                <span className="iv-plus" aria-hidden="true">+</span> Neuen Rechnungskontakt anlegen
              </summary>
              <div className="iv-new-body">
                {contactsMissing ? (
                  <p className="ap-banner ap-banner--warn" role="status">
                    Die Kontakt-Tabelle fehlt. In Supabase ausführen: <code>supabase/026_rechnungskontakte.sql</code>
                  </p>
                ) : null}
                <div className="iv-grid">
                  <label className="ap-field"><span className="ap-label">Name</span><input className="ap-input" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} /></label>
                  <label className="ap-field"><span className="ap-label">Firma (optional)</span><input className="ap-input" value={newContact.organization} onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })} /></label>
                  <label className="ap-field iv-wide"><span className="ap-label">Strasse</span><input className="ap-input" value={newContact.street} onChange={(e) => setNewContact({ ...newContact, street: e.target.value })} /></label>
                  <label className="ap-field"><span className="ap-label">PLZ</span><input className="ap-input" value={newContact.postal_code} onChange={(e) => setNewContact({ ...newContact, postal_code: e.target.value })} /></label>
                  <label className="ap-field"><span className="ap-label">Ort</span><input className="ap-input" value={newContact.city} onChange={(e) => setNewContact({ ...newContact, city: e.target.value })} /></label>
                  <label className="ap-field iv-wide"><span className="ap-label">E-Mail</span><input className="ap-input" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} /></label>
                </div>
                <div>
                  <button type="button" className={`ap-btn ap-btn--secondary${busy ? " is-loading" : ""}`} disabled={busy} onClick={() => void saveContact()}>
                    Kontakt speichern
                  </button>
                </div>
              </div>
            </details>
          ) : null}
        </section>

        <section className="ap-card iv-card" style={stagger(1)}>
          <header className="iv-card-head">
            <h2 className="iv-h2">Rechnungsdaten</h2>
          </header>
          <div className="iv-grid">
            <label className="ap-field iv-wide"><span className="ap-label">Titel</span><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label className="ap-field"><span className="ap-label">Nummer</span><input className="ap-input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></label>
            <label className="ap-field"><span className="ap-label">Datum</span><input className="ap-input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></label>
            <label className="ap-field iv-wide"><span className="ap-label">Zahlbar bis (optional)</span><input className="ap-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="z. B. 31.01.2027" /></label>
          </div>
        </section>

        <section className="ap-card iv-card" style={stagger(2)}>
          <header className="iv-card-head iv-card-head--row">
            <div>
              <h2 className="iv-h2">Positionen</h2>
              <p className="iv-sub">{items.length} von max. {MAX_ITEMS}</p>
            </div>
            {items.length < MAX_ITEMS ? (
              <button type="button" className="ap-btn ap-btn--secondary ap-btn--sm" onClick={addItem}>+ Position</button>
            ) : null}
          </header>
          <div className="iv-items">
            {items.map((it, i) => {
              const line = (Number(it.qty) || 0) * parsePrice(it.price);
              return (
                <div className="iv-item" key={i}>
                  <div className="iv-item-top">
                    <span className="iv-item-no" aria-hidden="true">{i + 1}</span>
                    <input className="ap-input" placeholder="Beschreibung der Leistung" aria-label={`Beschreibung Position ${i + 1}`} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} />
                    <button type="button" className="iv-remove" aria-label={`Position ${i + 1} entfernen`} disabled={items.length <= 1} onClick={() => removeItem(i)}>×</button>
                  </div>
                  <div className="iv-item-nums">
                    <label className="iv-cell"><span className="ap-label">Anzahl</span><input className="ap-input iv-qty" inputMode="numeric" aria-label={`Anzahl Position ${i + 1}`} value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} /></label>
                    <label className="iv-cell"><span className="ap-label">Einheit</span><input className="ap-input iv-unit" placeholder="Stk." aria-label={`Einheit Position ${i + 1}`} value={it.unit} onChange={(e) => setItem(i, "unit", e.target.value)} /></label>
                    <label className="iv-cell"><span className="ap-label">Einheitspreis</span><input className="ap-input iv-amount" inputMode="decimal" placeholder="0.00" aria-label={`Einheitspreis Position ${i + 1} in CHF`} value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} /></label>
                    <div className="iv-cell iv-cell--line"><span className="ap-label">Betrag</span><span className="iv-line">{line ? chf(line) : "–"}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="iv-sum">
            <span>Total in CHF</span>
            <strong>{chf(total)}</strong>
          </div>
          <label className="ap-field">
            <span className="ap-label">Notiz (optional)</span>
            <textarea className="ap-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Erscheint unter den Positionen auf der Rechnung" />
          </label>
        </section>
      </div>

      <aside className="iv-side" aria-label="Vorschau">
        <div className="ap-card iv-preview" style={stagger(1)}>
          <header className="iv-preview-head">
            <div>
              <h2 className="iv-h2">Vorschau</h2>
              <p className="iv-sub iv-state" aria-live="polite">
                <span className={`iv-dot${previewError ? " is-err" : previewLoading ? " is-busy" : ""}`} aria-hidden="true" />
                {previewError ? "Nicht aktuell" : previewLoading ? "Wird aktualisiert…" : "Aktuell, A4"}
              </p>
            </div>
            <div className="ap-segment" role="group" aria-label="Bildschirmgrösse">
              <button type="button" className="ap-segment-btn" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Desktop</button>
              <button type="button" className="ap-segment-btn" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Handy</button>
            </div>
          </header>
          {previewError ? <p className="ap-banner ap-banner--warn" role="alert">{previewError}</p> : null}
          <div className="iv-stage">
            <div ref={frameRef} className={`iv-frame iv-frame--${device}`} style={{ height: 1123 * scale }}>
              {html ? (
                <iframe
                  title="Rechnungsvorschau"
                  srcDoc={html}
                  className="iv-iframe"
                  style={{ width: 794, height: 1123, transform: `scale(${scale})`, transformOrigin: "0 0" }}
                />
              ) : (
                <span className="ap-skel iv-frame-skel" />
              )}
            </div>
          </div>
          <footer className="iv-preview-foot">
            <div className="iv-total">
              <span className="iv-total-label">Total{filled ? ` · ${filled} ${filled === 1 ? "Position" : "Positionen"}` : ""}</span>
              <span className="iv-total-num"><small>CHF</small> <CountUp value={total} format={chf} duration={600} /></span>
            </div>
            <div className="iv-foot-actions">
              <button type="button" className={`ap-btn ap-btn--primary${busy ? " is-loading" : ""}`} disabled={!canPdf} aria-busy={busy} onClick={() => void downloadPdf()}>
                {busy ? "Erstelle…" : "PDF herunterladen"}
              </button>
              <p className="iv-why">{hint}</p>
            </div>
            {message ? (
              <p className={`ap-banner ${message.kind === "error" ? "ap-banner--error" : "ap-banner--ok"}`} role="status">{message.text}</p>
            ) : null}
          </footer>
        </div>
      </aside>
    </div>
  );
}
