/**
 * HTML-Vorlage der Rechnung: einseitig, A4, ruhiges Layout.
 * Wird serverseitig mit Chromium zu PDF gedruckt, siehe goenner-invoice-pdf.ts.
 */

export type InvoiceHtmlData = {
  invoiceNumber: string;
  invoiceDate: string;
  recipient: { name: string; street: string | null; cityLine: string | null; email: string | null };
  membershipLabel: string; // z. B. "MG-Eagle"
  seasonYear: number;
  amountLabel: string; // z. B. "CHF 1’000.00"
  bank: { creditorName: string; street: string; cityLine: string; iban: string };
  purpose: string; // Zahlungszweck, z. B. "GG-2027-0001 · MG-Eagle"
};

export type InvoiceHtmlAssets = {
  logoDataUri: string;
  qrDataUri: string;
  playfairRegularDataUri: string;
  playfairBoldDataUri: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderInvoiceHtml(d: InvoiceHtmlData, a: InvoiceHtmlAssets): string {
  const recipientLines = [d.recipient.street, d.recipient.cityLine, d.recipient.email]
    .filter((x): x is string => Boolean(x && x.trim()))
    .map((x) => `<div>${esc(x)}</div>`)
    .join("\n        ");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Rechnung ${esc(d.invoiceNumber)}</title>
<style>
  @font-face { font-family: "Playfair Display"; font-weight: 400; src: url(${a.playfairRegularDataUri}) format("truetype"); }
  @font-face { font-family: "Playfair Display"; font-weight: 700; src: url(${a.playfairBoldDataUri}) format("truetype"); }

  :root {
    --ink: #111111;
    --ink-2: #3a3a3a;
    --muted: #6b6b6b;
    --line: #d9d9d9;
    --accent: #d71920;
    color-scheme: light;
  }
  @page { size: A4; margin: 18mm 18mm 16mm 18mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body {
    color: var(--ink);
    font-family: Helvetica, Arial, "Liberation Sans", sans-serif;
    font-size: 10pt;
    line-height: 1.5;
  }
  .page { width: 100%; }

  /* Kopf: Logo links, Dokumentangaben rechts */
  .head {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding-bottom: 8mm;
  }
  .logo { display: block; height: 14mm; width: auto; }
  .doc { text-align: right; }
  .doc-title { font-family: "Playfair Display", Georgia, serif; font-size: 22pt; font-weight: 700; line-height: 1; margin: 0 0 3mm; }
  .doc-meta { font-size: 9.5pt; color: var(--muted); }
  .doc-meta div { margin-top: 0.6mm; }

  /* Empfänger */
  .recipient { margin-bottom: 7mm; }
  .recipient .name { font-weight: 700; font-size: 11pt; margin-bottom: 1mm; }
  .recipient div { color: var(--ink-2); }

  .subject { font-weight: 700; font-size: 12pt; margin: 0 0 4mm; }
  .intro { margin: 0 0 6mm; color: var(--ink-2); }

  /* Leistung */
  table.item { width: 100%; border-collapse: collapse; }
  table.item th {
    text-align: left; font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); padding: 0 0 2mm; border-bottom: 1px solid var(--ink);
  }
  table.item th.num, table.item td.num { text-align: right; white-space: nowrap; }
  table.item td { padding: 3.5mm 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  .item-title { font-weight: 700; }
  .item-sub { color: var(--muted); font-size: 9.5pt; }
  .amount-total { font-weight: 700; font-size: 12pt; }

  /* Zahlung: Angaben links, QR-Code rechts */
  .pay { margin-top: 7mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; }
  .pay-info { flex: 1; min-width: 0; }
  .section-label { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 3mm; }
  dl.details { display: grid; grid-template-columns: 34mm minmax(0, 1fr); gap: 2.2mm 4mm; margin: 0; }
  dl.details dt { color: var(--muted); font-size: 9.5pt; }
  dl.details dd { margin: 0; color: var(--ink); overflow-wrap: anywhere; }
  dl.details dd.iban { font-weight: 700; letter-spacing: 0.02em; }
  dl.details dd.purpose { color: var(--accent); font-weight: 700; }
  .qr { flex: none; width: 40mm; text-align: center; }
  .qr img { display: block; width: 40mm; height: 40mm; margin: 0 auto; }
  .qr-cap { margin-top: 2.5mm; font-size: 8.5pt; color: var(--muted); line-height: 1.35; }

  /* Hinweis */
  .notice { margin-top: 6mm; padding: 4mm 5mm; background: #f5f5f3; font-size: 9pt; color: var(--ink-2); line-height: 1.5; }
  .notice .section-label { margin-bottom: 2mm; }
  .notice ul { margin: 0; padding-left: 4mm; }
  .notice li { margin-bottom: 1.2mm; }
  .notice strong { color: var(--ink); }

  .thanks { margin: 8mm 0 0; color: var(--ink-2); }

  /* Fuss: eine Zeile */
  .foot {
    margin-top: 6mm; padding-top: 3mm; border-top: 1px solid var(--line);
    font-size: 8.5pt; color: var(--muted); display: flex; justify-content: space-between; gap: 6mm;
  }
</style>
</head>
<body>
<main class="page">
  <header class="head">
    <img class="logo" alt="Mauro Gilardi Golf" src="${a.logoDataUri}">
    <div class="doc">
      <h1 class="doc-title">Rechnung</h1>
      <div class="doc-meta">
        <div>Nr. ${esc(d.invoiceNumber)}</div>
        <div>${esc(d.invoiceDate)}</div>
      </div>
    </div>
  </header>

  <section class="recipient">
    <div class="name">${esc(d.recipient.name)}</div>
        ${recipientLines}
  </section>

  <p class="subject">Gönner-Mitgliedschaft ${esc(d.membershipLabel)} · Saison ${d.seasonYear}</p>
  <p class="intro">Danke für deine Unterstützung auf meinem Weg auf die DP World Tour. Es freut mich sehr, dich in meiner Gönnervereinigung aufnehmen zu dürfen.</p>

  <table class="item">
    <thead>
      <tr><th>Leistung</th><th class="num">Betrag</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-title">Gönner-Mitgliedschaft ${esc(d.membershipLabel)}</div>
          <div class="item-sub">Saison ${d.seasonYear}</div>
        </td>
        <td class="num amount-total">${esc(d.amountLabel)}</td>
      </tr>
    </tbody>
  </table>

  <section class="pay">
    <div class="pay-info">
      <div class="section-label">Zahlungsinformationen</div>
      <dl class="details">
        <dt>Zahlbar an</dt>
        <dd>${esc(d.bank.creditorName)}<br>${esc(d.bank.street)}<br>${esc(d.bank.cityLine)}</dd>
        <dt>IBAN</dt>
        <dd class="iban">${esc(d.bank.iban)}</dd>
        <dt>Betrag</dt>
        <dd>${esc(d.amountLabel)}</dd>
        <dt>Zahlungszweck</dt>
        <dd class="purpose">${esc(d.purpose)}</dd>
      </dl>
    </div>
    <div class="qr">
      <img alt="QR-Code zur Zahlung" src="${a.qrDataUri}">
      <div class="qr-cap">Mit der Banking-App scannen.<br>Betrag und Zweck sind eingetragen.</div>
    </div>
  </section>

  <section class="notice">
    <div class="section-label">Hinweis zu deiner Mitgliedschaft</div>
    <ul>
      <li>Für deine Mitgliedschaft gelten die Gönner-Bedingungen: https://www.maurogilardi.ch/goenner-bedingungen</li>
      <li><strong>Automatische Verlängerung:</strong> Die Mitgliedschaft verlängert sich für die folgende Saison, solange kein Austritt mitgeteilt wurde.</li>
      <li><strong>Keine Rückerstattung:</strong> Bezahlte Beiträge werden nicht zurückerstattet. Die Unterstützung erfolgt jeweils zu Saisonbeginn bzw. beim Beitritt für die laufende Saison.</li>
      <li>Mit der Zahlung dieser Rechnung bestätigst du die Gönner-Bedingungen.</li>
    </ul>
    <p style="margin:2mm 0 0">Fragen an: mauro.gilardi@hotmail.com</p>
  </section>


  <footer class="foot">
    <span>${esc(d.bank.creditorName)} · ${esc(d.bank.street)} · ${esc(d.bank.cityLine)}</span>
    <span>maurogilardi.ch</span>
  </footer>
</main>
</body>
</html>`;
}
