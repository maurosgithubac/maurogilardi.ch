import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { renderFlexInvoiceHtml, type FlexInvoiceInput } from "@/lib/flex-invoice";

/** PDF aus der flexiblen Rechnung. Lokal über INVOICE_CHROME_PATH, auf Vercel über das mitgelieferte Chromium. */
export async function buildFlexInvoicePdf(input: FlexInvoiceInput): Promise<Buffer> {
  const html = await renderFlexInvoiceHtml(input);
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
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
