import { readFileSync } from "fs";
import path from "path";
import QRCode from "qrcode";
import { buildSwissQrPayload, readInvoiceBankConfig } from "@/lib/invoice-config";

/**
 * Flexible Rechnung für den Admin: Empfänger frei wählbar, bis zu 5 Positionen.
 * Layout bleibt fest: freie Zeilen bleiben als Leerraum stehen.
 * Absender und Konto sind immer dieselben (aus der Konfiguration).
 */

export const MAX_ITEMS = 5;

export type FlexItem = { description: string; amountChf: number };

export type FlexInvoiceInput = {
  title: string;
  invoiceNumber: string;
  invoiceDate: string; // dd.mm.yyyy
  dueDate: string; // dd.mm.yyyy oder leer
  recipient: { name: string; organization: string; street: string; postalCode: string; city: string; email: string };
  items: FlexItem[];
  note: string;
};

const C = { ink: "#111111", ink2: "#3d3d3d", muted: "#8a8a85", hair: "#ebeae6", red: "#d71920" };

export function chf(amount: number): string {
  const [int, dec] = (Number.isFinite(amount) ? amount : 0).toFixed(2).split(".");
  return `CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${dec}`;
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");
}

export function flexAssets(): { logo: string; fontRegular: string; fontBold: string } {
  const base = path.join(process.cwd(), "public", "brand-assets");
  const b64 = (p: string) => readFileSync(p).toString("base64");
  return {
    logo: `data:image/svg+xml;base64,${b64(path.join(base, "logos", "mauro-gilardi-golf-logo.svg"))}`,
    fontRegular: `data:font/ttf;base64,${b64(path.join(base, "fonts", "PlayfairDisplay-Regular.ttf"))}`,
    fontBold: `data:font/ttf;base64,${b64(path.join(base, "fonts", "PlayfairDisplay-Bold.ttf"))}`,
  };
}

export async function renderFlexInvoiceHtml(d: FlexInvoiceInput): Promise<string> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");
  const assets = flexAssets();

  const items = d.items.slice(0, MAX_ITEMS);
  const total = items.reduce((s, it) => s + (Number(it.amountChf) || 0), 0);
  const slots = Array.from({ length: MAX_ITEMS }, (_, i) => items[i] ?? null);

  const payload = buildSwissQrPayload({
    bank,
    amountChf: total,
    debtorName: d.recipient.name,
    debtorStreet: d.recipient.street,
    debtorPostalCode: d.recipient.postalCode,
    debtorCity: d.recipient.city,
    debtorCountry: "CH",
    message: d.invoiceNumber,
  });
  const qr = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 300 });

  const recipientLines = [d.recipient.organization, d.recipient.street, [d.recipient.postalCode, d.recipient.city].filter(Boolean).join(" "), d.recipient.email]
    .filter((x) => x && x.trim())
    .map((x) => `<div>${esc(x)}</div>`)
    .join("");

  const rows = slots
    .map((it) =>
      `<tr class="${it ? "" : "is-empty"}">
        <td class="desc">${it ? esc(it.description) : "&nbsp;"}</td>
        <td class="num">${it ? esc(chf(it.amountChf)) : "&nbsp;"}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} ${esc(d.invoiceNumber)}</title>
<style>
  @font-face { font-family: "Playfair Display"; font-weight: 400; src: url(${assets.fontRegular}) format("truetype"); }
  @font-face { font-family: "Playfair Display"; font-weight: 700; src: url(${assets.fontBold}) format("truetype"); }
  @page { size: A4; margin: 18mm 18mm 16mm 18mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { color: ${C.ink}; font-family: Helvetica, Arial, "Liberation Sans", sans-serif; font-size: 10pt; line-height: 1.5; }
  .page { width: 100%; max-width: 720px; margin: 0 auto; padding: 24px; min-height: 297mm; display: flex; flex-direction: column; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 8mm; }
  .logo { height: 14mm; width: auto; }
  .doc { text-align: right; }
  .doc-title { font-family: "Playfair Display", Georgia, serif; font-size: 22pt; font-weight: 700; line-height: 1; margin: 0 0 3mm; }
  .doc-meta { font-size: 9.5pt; color: ${C.muted}; }
  .doc-meta div { margin-top: 0.6mm; }
  .recipient { margin-bottom: 8mm; min-height: 22mm; }
  .recipient .name { font-weight: 700; font-size: 11pt; margin-bottom: 1mm; }
  .recipient div { color: ${C.ink2}; }
  .section { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; margin: 0 0 2mm; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { text-align: left; font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; padding: 0 0 2mm; border-bottom: 1px solid ${C.ink}; }
  table.items th.num, table.items td.num { text-align: right; white-space: nowrap; }
  table.items td { height: 11mm; padding: 2mm 0; border-bottom: 1px solid ${C.hair}; vertical-align: middle; }
  table.items tr.is-empty td { border-bottom-color: ${C.hair}; }
  table.items td.num { font-weight: 700; }
  .total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 3mm; padding-top: 3mm; }
  .total .label { font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; }
  .total .amount { font-family: "Playfair Display", Georgia, serif; font-size: 16pt; font-weight: 700; }
  .pay { display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; margin-top: 10mm; }
  .pay-info { flex: 1; min-width: 0; }
  dl { display: grid; grid-template-columns: 30mm minmax(0, 1fr); gap: 2mm 4mm; margin: 0; }
  dt { color: ${C.muted}; font-size: 9.5pt; }
  dd { margin: 0; color: ${C.ink}; overflow-wrap: anywhere; }
  dd.iban { font-weight: 700; }
  dd.purpose { color: ${C.red}; font-weight: 700; }
  .qr { width: 40mm; text-align: center; flex: none; }
  .qr img { width: 40mm; height: 40mm; display: block; }
  .qr-cap { margin-top: 2mm; font-size: 8.5pt; color: ${C.muted}; line-height: 1.35; }
  .note { margin-top: 8mm; color: ${C.ink2}; white-space: pre-line; min-height: 8mm; }
  .foot { margin-top: auto; padding-top: 3mm; border-top: 1px solid ${C.hair}; font-size: 8.5pt; color: ${C.muted}; display: flex; justify-content: space-between; gap: 6mm; }
</style>
</head>
<body>
<main class="page">
  <header class="head">
    <img class="logo" alt="Mauro Gilardi Golf" src="${assets.logo}">
    <div class="doc">
      <h1 class="doc-title">${esc(d.title)}</h1>
      <div class="doc-meta">
        <div>Nr. ${esc(d.invoiceNumber)}</div>
        <div>Datum ${esc(d.invoiceDate)}</div>
        ${d.dueDate ? `<div>Zahlbar bis ${esc(d.dueDate)}</div>` : ""}
      </div>
    </div>
  </header>

  <section class="recipient">
    <div class="section">Rechnung an</div>
    <div class="name">${esc(d.recipient.name || " ")}</div>
    ${recipientLines}
  </section>

  <table class="items">
    <thead><tr><th>Leistung</th><th class="num">Betrag</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total">
    <span class="label">Total</span>
    <span class="amount">${esc(chf(total))}</span>
  </div>

  <section class="pay">
    <div class="pay-info">
      <div class="section">Zahlungsinformationen</div>
      <dl>
        <dt>Zahlbar an</dt>
        <dd>${esc(bank.creditorName)}<br>${esc(bank.creditorStreet)}<br>${esc(bank.creditorPostalCode)} ${esc(bank.creditorCity)}</dd>
        <dt>IBAN</dt>
        <dd class="iban">${esc(formatIban(bank.iban))}</dd>
        <dt>Betrag</dt>
        <dd>${esc(chf(total))}</dd>
        <dt>Zahlungszweck</dt>
        <dd class="purpose">${esc(d.invoiceNumber)}</dd>
      </dl>
    </div>
    <div class="qr">
      <img alt="QR-Code zur Zahlung" src="${qr}">
      <div class="qr-cap">Mit der Banking-App scannen.<br>Betrag und Zweck sind eingetragen.</div>
    </div>
  </section>

  <div class="note">${esc(d.note)}</div>

  <footer class="foot">
    <span>${esc(bank.creditorName)} · ${esc(bank.creditorStreet)} · ${esc(bank.creditorPostalCode)} ${esc(bank.creditorCity)}</span>
    <span>maurogilardi.ch</span>
  </footer>
</main>
</body>
</html>`;
}

function str(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

/** Eingabe aus dem Formular prüfen und bereinigen. */
export function parseFlexInput(body: Record<string, unknown>): { ok: true; value: FlexInvoiceInput } | { ok: false; error: string } {
  const r = (body.recipient ?? {}) as Record<string, unknown>;
  const recipient = {
    name: str(r.name, 160),
    organization: str(r.organization, 160),
    street: str(r.street, 200),
    postalCode: str(r.postalCode, 16),
    city: str(r.city, 120),
    email: str(r.email, 200),
  };
  if (recipient.name.length < 2) return { ok: false, error: "Bitte einen Empfänger wählen." };

  const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
  const items: FlexItem[] = rawItems
    .slice(0, MAX_ITEMS)
    .map((it) => ({ description: str(it.description, 200), amountChf: Number(it.amountChf) || 0 }))
    .filter((it) => it.description || it.amountChf);
  if (items.length === 0) return { ok: false, error: "Mindestens eine Position angeben." };
  if (items.some((it) => !it.description)) return { ok: false, error: "Jede Position braucht eine Beschreibung." };

  const invoiceNumber = str(body.invoiceNumber, 60);
  if (!invoiceNumber) return { ok: false, error: "Rechnungsnummer fehlt." };

  return {
    ok: true,
    value: {
      title: str(body.title, 60) || "Rechnung",
      invoiceNumber,
      invoiceDate: str(body.invoiceDate, 20),
      dueDate: str(body.dueDate, 20),
      recipient,
      items,
      note: str(body.note, 800),
    },
  };
}
