/**
 * HTML-Vorlage der Rechnung (gleiches Layout wie die freigegebene Vorschau).
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
  const addressLines = [d.recipient.street, d.recipient.cityLine, d.recipient.email]
    .filter((x): x is string => Boolean(x && x.trim()))
    .map((x) => `<div class="to-addr">${esc(x)}</div>`)
    .join("\n    ");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Rechnung ${esc(d.invoiceNumber)}</title>
<style>
  @font-face { font-family: "Playfair Display"; font-weight: 400; src: url(${a.playfairRegularDataUri}) format("truetype"); }
  @font-face { font-family: "Playfair Display"; font-weight: 700; src: url(${a.playfairBoldDataUri}) format("truetype"); }

  :root {
    --paper: #faf9f6;
    --white: #ffffff;
    --ink: #0b0b0b;
    --ink-2: #34322e;
    --muted: #66625b;
    --hair: #e4e1da;
    --red: #d71920;
    color-scheme: light;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--white); }
  body {
    color: var(--ink);
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: 14px;
    line-height: 1.5;
  }
  .sans { font-family: Helvetica, Arial, "Liberation Sans", sans-serif; }
  .sheet { max-width: 720px; margin: 0 auto; padding: 0; }

  .head {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
    padding-bottom: 26px; border-bottom: 1px solid var(--ink);
  }
  .brand { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
  .logo { display: block; height: 46px; width: auto; max-width: 150px; flex: none; }
  .brand-sub { font-size: 12px; color: var(--muted); }
  .doc { text-align: right; }
  .eyebrow {
    display: block; font-family: Helvetica, Arial, sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--red); margin-bottom: 6px;
  }
  .title { font-size: 40px; font-weight: 700; line-height: 1; margin: 0; letter-spacing: -0.01em; }
  .meta { margin-top: 12px; font-size: 13px; color: var(--ink-2); }
  .meta div { display: flex; justify-content: flex-end; gap: 14px; }
  .meta span:first-child { color: var(--muted); }

  .to { margin-top: 30px; }
  .label {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px;
  }
  .to-name { font-size: 17px; font-weight: 600; }
  .to-addr { color: var(--ink-2); }

  .intro { margin: 26px 0 0; color: var(--ink-2); font-size: 14px; line-height: 1.6; }

  table.items { width: 100%; border-collapse: collapse; margin-top: 30px; }
  table.items th {
    text-align: left; font-family: Helvetica, Arial, sans-serif;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted); padding: 0 0 8px; border-bottom: 1px solid var(--hair);
  }
  table.items th.num, table.items td.num { text-align: right; white-space: nowrap; }
  table.items td { padding: 16px 0; border-bottom: 1px solid var(--hair); vertical-align: top; }
  .item-title { font-weight: 600; font-size: 16px; }
  .item-sub { font-size: 13px; color: var(--muted); }
  .total-row td { border-bottom: none; padding-top: 14px; }
  .total-row .total-label { font-family: Helvetica, Arial, sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; }
  .total-row .total-amount { font-weight: 700; font-size: 22px; font-variant-numeric: tabular-nums; }

  .pay {
    margin-top: 34px; border-top: 1px solid var(--ink); padding-top: 22px;
    display: flex; gap: 28px; align-items: flex-start;
  }
  .pay-qr { flex: none; width: 168px; }
  .pay-qr img { display: block; width: 168px; height: 168px; }
  .pay-qr .qr-cap { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: var(--muted); margin-top: 8px; line-height: 1.4; }
  .pay-info { flex: 1; min-width: 0; }
  .pay-info dl { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 9px 14px; margin: 0; }
  .pay-info dt { color: var(--muted); font-size: 13px; }
  .pay-info dd { margin: 0; font-size: 14px; color: var(--ink); overflow-wrap: anywhere; }
  .pay-info dd.iban { font-variant-numeric: tabular-nums; letter-spacing: 0.02em; font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 13px; }
  .pay-info dd.amount { font-weight: 700; font-variant-numeric: tabular-nums; }
  .pay-info .red { color: var(--red); }

  .thanks { margin: 30px 0 0; font-size: 14px; color: var(--ink-2); }
  .foot {
    margin-top: 30px; padding-top: 14px; border-top: 1px solid var(--hair);
    font-family: Helvetica, Arial, sans-serif;
    font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; gap: 18px;
  }

  @page { size: A4; margin: 16mm 18mm 14mm; }
  @media print {
    html, body { background: var(--white); }
  }
</style>
</head>
<body>
<main class="sheet">
  <header class="head">
    <div class="brand">
      <img class="logo" alt="Mauro Gilardi Golf" src="${a.logoDataUri}">
      <div>
        <div class="brand-sub">SwissPGA Professional</div>
        <div class="brand-sub">maurogilardi.ch</div>
      </div>
    </div>
    <div class="doc">
      <span class="eyebrow">Gönnerverein GilardiGolf</span>
      <h1 class="title">Rechnung</h1>
      <div class="meta sans">
        <div><span>Rechnungsnummer</span><span>${esc(d.invoiceNumber)}</span></div>
        <div><span>Rechnungsdatum</span><span>${esc(d.invoiceDate)}</span></div>
      </div>
    </div>
  </header>

  <section class="to">
    <div class="label">Rechnung an</div>
    <div class="to-name">${esc(d.recipient.name)}</div>
    ${addressLines}
  </section>

  <p class="intro">Danke für deine Unterstützung auf meinem Weg auf die DP World Tour. Ich freue mich, dich bald mal auf oder neben dem Golf zu sehen. Es freut mich sehr, dich in meiner Gönnervereinigung aufnehmen zu dürfen.<br><br>Untenstehend findest du die Angaben und Zahlungsdaten für die Überweisung.</p>

  <table class="items">
    <thead>
      <tr><th>Leistung</th><th class="num">Betrag</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-title">Gönner-Mitgliedschaft ${esc(d.membershipLabel)}</div>
          <div class="item-sub">Saison ${d.seasonYear}</div>
        </td>
        <td class="num">${esc(d.amountLabel)}</td>
      </tr>
      <tr class="total-row">
        <td class="total-label sans">Total</td>
        <td class="num total-amount">${esc(d.amountLabel)}</td>
      </tr>
    </tbody>
  </table>

  <section class="pay">
    <div class="pay-qr">
      <img alt="QR-Code zur Zahlung" src="${a.qrDataUri}">
      <div class="qr-cap">Mit der Banking-App scannen. Betrag und Zweck sind schon eingetragen.</div>
    </div>
    <div class="pay-info">
      <div class="label">Zahlungsinformationen</div>
      <dl>
        <dt>Zahlbar an</dt>
        <dd>${esc(d.bank.creditorName)}<br>${esc(d.bank.street)}<br>${esc(d.bank.cityLine)}</dd>
        <dt>IBAN</dt>
        <dd class="iban">${esc(d.bank.iban)}</dd>
        <dt>Betrag</dt>
        <dd class="amount">${esc(d.amountLabel)}</dd>
        <dt>Zahlungszweck</dt>
        <dd class="red">${esc(d.purpose)}</dd>
      </dl>
    </div>
  </section>

  <p class="thanks">Danke für deine Unterstützung.</p>

  <footer class="foot">
    <span>${esc(d.bank.creditorName)} · ${esc(d.bank.street)} · ${esc(d.bank.cityLine)}</span>
    <span>maurogilardi.ch</span>
  </footer>
</main>
</body>
</html>`;
}
