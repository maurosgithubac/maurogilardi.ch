import fs from "fs/promises";
import path from "path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { inquiryTierShort } from "@/content/goennerMemberships";
import {
  GOENNER_INVOICE_YEAR,
  buildInvoiceQrPng,
  invoicePurpose,
  mailAmountChf,
  type GoennerMailRow,
} from "@/lib/goenner-mails";
import { readInvoiceBankConfig } from "@/lib/invoice-config";
import { renderInvoiceHtml, type InvoiceHtmlAssets } from "@/lib/goenner-invoice-html";

/**
 * Rechnung als PDF pro Gönner. Die Vorlage ist HTML (goenner-invoice-html.ts),
 * gedruckt wird mit Chromium, damit das Layout genau der Vorschau entspricht.
 */

export type InvoicePdfRow = GoennerMailRow & { created_at: string };

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

async function fileDataUri(relPath: string, mime: string): Promise<string> {
  const buf = await fs.readFile(path.join(process.cwd(), "public", relPath));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function loadAssets(row: InvoicePdfRow): Promise<InvoiceHtmlAssets> {
  const qr = await buildInvoiceQrPng(row);
  return {
    logoDataUri: await fileDataUri("brand-assets/logos/mauro-gilardi-golf-logo.svg", "image/svg+xml"),
    qrDataUri: `data:image/png;base64,${qr.toString("base64")}`,
    playfairRegularDataUri: await fileDataUri("brand-assets/fonts/PlayfairDisplay-Regular.ttf", "font/ttf"),
    playfairBoldDataUri: await fileDataUri("brand-assets/fonts/PlayfairDisplay-Bold.ttf", "font/ttf"),
  };
}

export async function buildGoennerInvoicePdf(row: InvoicePdfRow): Promise<{ buffer: Buffer; filename: string }> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");
  if (!row.invoice_number) throw new Error("Keine Rechnungsnummer vorhanden.");

  const amount = mailAmountChf(row);
  const html = renderInvoiceHtml(
    {
      invoiceNumber: row.invoice_number,
      invoiceDate: formatDate(row.created_at),
      recipient: {
        name: row.name,
        street: row.street,
        cityLine: [row.postal_code, row.city].filter(Boolean).join(" ") || null,
        email: row.email,
      },
      membershipLabel: `MG-${inquiryTierShort(row.membership_id)}`,
      seasonYear: GOENNER_INVOICE_YEAR,
      amountLabel: chfAmount(amount),
      bank: {
        creditorName: bank.creditorName,
        street: bank.creditorStreet,
        cityLine: `${bank.creditorPostalCode} ${bank.creditorCity}`,
        iban: formatIban(bank.iban),
      },
      purpose: invoicePurpose(row),
    },
    await loadAssets(row),
  );

  // Lokal (Windows) kann der mitgelieferte Chromium nicht laufen: INVOICE_CHROME_PATH setzen.
  const localChrome = process.env.INVOICE_CHROME_PATH?.trim();
  const browser = await puppeteer.launch({
    args: localChrome ? [] : chromium.args,
    executablePath: localChrome || (await chromium.executablePath()),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    const safeName = row.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    return {
      buffer: Buffer.from(pdf),
      filename: `Rechnung-${row.invoice_number}-${safeName || "gönner"}.pdf`,
    };
  } finally {
    await browser.close();
  }
}
