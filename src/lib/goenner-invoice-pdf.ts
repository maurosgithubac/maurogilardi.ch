import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";
import { inquiryTierShort } from "@/content/goennerMemberships";
import {
  GOENNER_INVOICE_YEAR,
  buildInvoiceQrPng,
  invoicePurpose,
  mailAmountChf,
  type GoennerMailRow,
} from "@/lib/goenner-mails";
import { readInvoiceBankConfig } from "@/lib/invoice-config";

/**
 * Rechnung als PDF (A4) pro Gönner. Layout entspricht der Vorschau
 * (Logo, rote Eyebrow, Playfair Display, Positionen, Zahlungsblock mit QR-Code).
 */

export type InvoicePdfRow = GoennerMailRow & { created_at: string };

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 40;
const MARGIN_TOP = 40;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Farben aus der Website (#0b0b0b, #66625b, #d71920, #e4e1da, #34322e)
const INK = rgb(0.043, 0.043, 0.043);
const INK2 = rgb(0.204, 0.196, 0.18);
const MUTED = rgb(0.4, 0.384, 0.357);
const RED = rgb(0.843, 0.098, 0.125);
const HAIR = rgb(0.894, 0.882, 0.855);

function chfAmount(amount: number): string {
  const [int, dec] = amount.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  return `CHF ${grouped}.${dec}`;
}

function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadLogoPng(): Promise<Buffer> {
  const svgPath = path.join(process.cwd(), "public", "brand-assets", "logos", "mauro-gilardi-golf-logo.svg");
  const svg = await fs.readFile(svgPath);
  return sharp(svg, { density: 300 }).resize({ width: 800 }).png().toBuffer();
}

export async function buildGoennerInvoicePdf(row: InvoicePdfRow): Promise<{ buffer: Buffer; filename: string }> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");
  if (!row.invoice_number) throw new Error("Keine Rechnungsnummer vorhanden.");

  const amount = mailAmountChf(row);
  const purpose = invoicePurpose(row);
  const short = inquiryTierShort(row.membership_id);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Rechnung ${row.invoice_number}`);
  doc.setAuthor("Mauro Gilardi");

  const fontDir = path.join(process.cwd(), "public", "brand-assets", "fonts");
  const serif = await doc.embedFont(await fs.readFile(path.join(fontDir, "PlayfairDisplay-Regular.ttf")), { subset: true });
  const serifBold = await doc.embedFont(await fs.readFile(path.join(fontDir, "PlayfairDisplay-Bold.ttf")), { subset: true });
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  const top = (fromTop: number) => PAGE_H - fromTop; // Koordinaten von oben

  function text(
    value: string,
    x: number,
    fromTop: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) {
    page.drawText(value, {
      x,
      y: top(fromTop),
      font: opts.font ?? serif,
      size: opts.size ?? 10.5,
      color: opts.color ?? INK2,
    });
  }
  function textRight(value: string, rightX: number, fromTop: number, opts: Parameters<typeof text>[3] = {}) {
    const f = opts.font ?? serif;
    const size = opts.size ?? 10.5;
    text(value, rightX - f.widthOfTextAtSize(value, size), fromTop, opts);
  }
  function hairline(fromTop: number, color = HAIR, thickness = 0.75) {
    page.drawLine({ start: { x: MARGIN_X, y: top(fromTop) }, end: { x: PAGE_W - MARGIN_X, y: top(fromTop) }, thickness, color });
  }

  // ——— Kopf ———
  const logo: PDFImage = await doc.embedPng(await loadLogoPng());
  const logoH = 34.5;
  const logoW = logoH * (logo.width / logo.height);
  page.drawImage(logo, { x: MARGIN_X, y: top(MARGIN_TOP + logoH), width: logoW, height: logoH });
  text("SwissPGA Professional", MARGIN_X, MARGIN_TOP + logoH + 14, { size: 8.5, color: MUTED });
  text("maurogilardi.ch", MARGIN_X, MARGIN_TOP + logoH + 26, { size: 8.5, color: MUTED });

  const right = PAGE_W - MARGIN_X;
  textRight("GÖNNERVEREIN GILARDIGOLF", right, MARGIN_TOP + 8, { font: sansBold, size: 7.5, color: RED });
  textRight("Rechnung", right, MARGIN_TOP + 38, { font: serifBold, size: 30, color: INK });
  const metaTop = MARGIN_TOP + 58;
  text("Rechnungsnummer", right - 150, metaTop, { font: sans, size: 9, color: MUTED });
  textRight(row.invoice_number, right, metaTop, { font: sans, size: 9, color: INK2 });
  text("Rechnungsdatum", right - 150, metaTop + 14, { font: sans, size: 9, color: MUTED });
  textRight(formatDate(row.created_at), right, metaTop + 14, { font: sans, size: 9, color: INK2 });

  const headerBottom = MARGIN_TOP + logoH + 26 + 16;
  hairline(headerBottom, INK, 1);

  // ——— Empfänger ———
  let y = headerBottom + 30;
  text("RECHNUNG AN", MARGIN_X, y, { font: sansBold, size: 7, color: MUTED });
  y += 18;
  text(row.name, MARGIN_X, y, { font: serifBold, size: 12.75, color: INK });
  y += 16;
  if (row.street) { text(row.street, MARGIN_X, y, { size: 10.5 }); y += 15; }
  const cityLine = [row.postal_code, row.city].filter(Boolean).join(" ");
  if (cityLine) { text(cityLine, MARGIN_X, y, { size: 10.5 }); y += 15; }
  text(row.email, MARGIN_X, y, { size: 10.5 });
  y += 26;

  // ——— Einleitung ———
  const introA =
    "Danke für deine Unterstützung auf meinem Weg auf die DP World Tour. Ich freue mich, dich bald mal auf oder neben dem Golf zu sehen. Es freut mich sehr, dich in meiner Gönnervereinigung aufnehmen zu dürfen.";
  const introB = "Untenstehend findest du die Angaben und Zahlungsdaten für die Überweisung.";
  for (const line of wrap(introA, serif, 10.5, CONTENT_W)) { text(line, MARGIN_X, y, { size: 10.5 }); y += 15.5; }
  y += 15.5;
  text(introB, MARGIN_X, y, { size: 10.5 });
  y += 30;

  // ——— Positionen ———
  text("LEISTUNG", MARGIN_X, y, { font: sansBold, size: 7, color: MUTED });
  textRight("BETRAG", PAGE_W - MARGIN_X, y, { font: sansBold, size: 7, color: MUTED });
  y += 8;
  hairline(y);
  y += 22;
  text(`Gönner-Mitgliedschaft MG-${short}`, MARGIN_X, y, { font: serifBold, size: 12, color: INK });
  textRight(chfAmount(amount), PAGE_W - MARGIN_X, y, { font: serif, size: 12, color: INK });
  y += 15;
  text(`Saison ${GOENNER_INVOICE_YEAR}`, MARGIN_X, y, { size: 9.75, color: MUTED });
  y += 14;
  hairline(y);
  y += 22;
  text("TOTAL", MARGIN_X, y, { font: sansBold, size: 9, color: INK2 });
  textRight(chfAmount(amount), PAGE_W - MARGIN_X, y - 2, { font: serif, size: 16.5, color: INK });
  y += 40;

  // ——— Zahlungsblock ———
  hairline(y, INK, 1);
  const payTop = y + 22;
  const qrSize = 126;
  const qrPng = await doc.embedPng(await buildInvoiceQrPng(row));
  page.drawImage(qrPng, { x: MARGIN_X, y: top(payTop + qrSize), width: qrSize, height: qrSize });
  wrap("Mit der Banking-App scannen. Betrag und Zweck sind schon eingetragen.", sans, 7.5, qrSize).forEach((line, i) =>
    text(line, MARGIN_X, payTop + qrSize + 14 + i * 10, { font: sans, size: 7.5, color: MUTED }),
  );

  const infoX = MARGIN_X + qrSize + 21;
  const labelW = 99;
  let iy = payTop + 4;
  text("ZAHLUNGSINFORMATIONEN", infoX, iy, { font: sansBold, size: 7, color: MUTED });
  iy += 18;
  const rows: { label: string; lines: string[]; font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> }[] = [
    { label: "Zahlbar an", lines: [bank.creditorName, `${bank.creditorStreet}`, `${bank.creditorPostalCode} ${bank.creditorCity}`] },
    { label: "IBAN", lines: [formatIban(bank.iban)], font: sansBold, size: 9.5 },
    { label: "Betrag", lines: [chfAmount(amount)], font: serifBold, size: 10.5, color: INK },
    { label: "Zahlungszweck", lines: [purpose], color: RED },
  ];
  for (const r of rows) {
    text(r.label, infoX, iy, { size: 9.5, color: MUTED });
    r.lines.forEach((line, i) => {
      text(line, infoX + labelW, iy + i * 14, {
        font: r.font ?? serif,
        size: r.size ?? 10.5,
        color: r.color ?? INK,
      });
    });
    iy += r.lines.length * 14 + 10;
  }

  // ——— Dank & Fuss ———
  const after = Math.max(payTop + qrSize + 14 + 2 * 10, iy) + 30;
  text("Danke für deine Unterstützung.", MARGIN_X, after, { size: 10.5, color: INK2 });

  hairline(790, HAIR, 0.75);
  text("Mauro Gilardi · Bleikenstrasse 6d · 9630 Wattwil", MARGIN_X, 806, { font: sans, size: 8, color: MUTED });
  textRight("maurogilardi.ch", PAGE_W - MARGIN_X, 806, { font: sans, size: 8, color: MUTED });

  const bytes = await doc.save();
  const safeName = row.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return {
    buffer: Buffer.from(bytes),
    filename: `Rechnung-${row.invoice_number}-${safeName || "gönner"}.pdf`,
  };
}
