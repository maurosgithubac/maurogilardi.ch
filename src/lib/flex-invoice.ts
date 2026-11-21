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

export type FlexItem = { description: string; quantity: number; unit: string; unitPriceChf: number };

/** Betrag einer Position: Anzahl mal Preis pro Einheit. */
export const lineTotal = (it: FlexItem) => (Number(it.quantity) || 0) * (Number(it.unitPriceChf) || 0);

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

/** Betrag ohne Währungszeichen, z. B. 1’000.00 (für Spalten, in denen CHF schon steht). */
function num(amount: number): string {
  const [int, dec] = (Number.isFinite(amount) ? amount : 0).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${dec}`;
}

export async function renderFlexInvoiceHtml(d: FlexInvoiceInput): Promise<string> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");
  const assets = flexAssets();

  // Nur die tatsächlich erfassten Positionen werden angezeigt
  const items = d.items.slice(0, MAX_ITEMS);
  const total = items.reduce((s, it) => s + lineTotal(it), 0);

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

  const rows = items
    .map(
      (it) => `<tr>
        <td class="desc">${esc(it.description)}</td>
        <td class="cur">CHF</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${num(it.unitPriceChf)}</td>
        <td class="num strong">${num(lineTotal(it))}</td>
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
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { color: ${C.ink}; font-family: Helvetica, Arial, "Liberation Sans", sans-serif; font-size: 10pt; line-height: 1.5; }
  .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 16mm 20mm 12mm; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; background: #fff; }
  @media print { .page { margin: 0; } }

  .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 8mm; }
  .logo { height: 14mm; width: auto; }
  .doc { text-align: right; }
  .doc-title { font-family: "Playfair Display", Georgia, serif; font-size: 22pt; font-weight: 700; line-height: 1; margin: 0 0 3mm; }
  .doc-meta { font-size: 9.5pt; color: ${C.muted}; }
  .doc-meta div { margin-top: 0.6mm; }

  .recipient { margin-bottom: 9mm; }
  .recipient .name { font-weight: 700; font-size: 11pt; margin-bottom: 1mm; }
  .recipient div { color: ${C.ink2}; }
  .section { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; margin: 0 0 2mm; }

  table.items { width: 100%; border-collapse: collapse; table-layout: fixed; }
  table.items col.c-desc { width: 52%; }
  table.items col.c-cur { width: 11%; }
  table.items col.c-qty { width: 11%; }
  table.items col.c-price { width: 14%; }
  table.items col.c-total { width: 14%; }
  table.items th { text-align: left; font-size: 8pt; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; text-transform: uppercase; color: ${C.muted}; padding: 0 0 2.5mm; border-bottom: 1px solid ${C.ink}; }
  table.items th.num, table.items td.num { text-align: right; white-space: nowrap; }
  table.items td { padding: 3mm 0; border-bottom: 1px solid ${C.hair}; vertical-align: top; font-size: 10pt; }
  table.items td.desc { padding-right: 4mm; overflow-wrap: anywhere; }
  table.items td.cur { color: ${C.muted}; font-size: 9pt; }
  table.items td.strong { font-weight: 700; }

  .total { display: flex; justify-content: flex-end; align-items: baseline; gap: 6mm; margin-top: 3mm; }
  .total .label { font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.muted}; }
  .total .amount { font-family: "Playfair Display", Georgia, serif; font-size: 16pt; font-weight: 700; white-space: nowrap; }

  .spacer { flex: 1 1 auto; min-height: 6mm; }

  .note { margin: 0 0 7mm; padding-top: 3mm; border-top: 1px solid ${C.hair}; color: ${C.ink2}; white-space: pre-line; }
  .note .section { margin-bottom: 1.5mm; }

  .pay { display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; padding-top: 5mm; border-top: 1px solid ${C.ink}; }
  .pay-info { flex: 1; min-width: 0; }
  dl { display: grid; grid-template-columns: 32mm minmax(0, 1fr); gap: 1.8mm 4mm; margin: 0; }
  dt { color: ${C.muted}; font-size: 9.5pt; }
  dd { margin: 0; color: ${C.ink}; overflow-wrap: anywhere; }
  dd.iban { font-weight: 700; }
  dd.purpose { color: ${C.red}; font-weight: 700; }
  .qr { width: 40mm; text-align: center; flex: none; }
  .qr img { width: 40mm; height: 40mm; display: block; }
  .qr-cap { margin-top: 2mm; font-size: 8.5pt; color: ${C.muted}; line-height: 1.35; }

  .foot { margin-top: 7mm; padding-top: 3mm; border-top: 1px solid ${C.hair}; font-size: 8.5pt; color: ${C.muted}; display: flex; justify-content: space-between; gap: 6mm; }
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
    <colgroup><col class="c-desc"><col class="c-cur"><col class="c-qty"><col class="c-price"><col class="c-total"></colgroup>
    <thead><tr><th>Beschreibung</th><th>Währung</th><th class="num">Anzahl</th><th class="num">Stückpreis</th><th class="num">Betrag</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total">
    <span class="label">Total</span>
    <span class="amount">${esc(chf(total))}</span>
  </div>

  <div class="spacer"></div>

  ${d.note.trim() ? `<section class="note"><div class="section">Notizen</div>${esc(d.note)}</section>` : ""}

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
export function parseFlexInput(body: Record<string, unknown>, lenient = false): { ok: true; value: FlexInvoiceInput } | { ok: false; error: string } {
  const r = (body.recipient ?? {}) as Record<string, unknown>;
  const recipient = {
    name: str(r.name, 160),
    organization: str(r.organization, 160),
    street: str(r.street, 200),
    postalCode: str(r.postalCode, 16),
    city: str(r.city, 120),
    email: str(r.email, 200),
  };
  if (!lenient && recipient.name.length < 2) return { ok: false, error: "Bitte einen Empfänger wählen." };

  const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
  const items: FlexItem[] = rawItems
    .slice(0, MAX_ITEMS)
    .map((it) => ({
      description: str(it.description, 200),
      unit: str(it.unit, 20) || "Stk.",
      quantity: Math.min(Math.max(Math.round(Number(it.quantity) || 1), 1), 999),
      unitPriceChf: Number(it.unitPriceChf) || 0,
    }))
    .filter((it) => it.description || it.unitPriceChf);
  if (!lenient && items.length === 0) return { ok: false, error: "Mindestens eine Position angeben." };
  if (!lenient && items.some((it) => !it.description)) return { ok: false, error: "Jede Position braucht eine Beschreibung." };

  const invoiceNumber = str(body.invoiceNumber, 60);
  if (!lenient && !invoiceNumber) return { ok: false, error: "Rechnungsnummer fehlt." };

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
