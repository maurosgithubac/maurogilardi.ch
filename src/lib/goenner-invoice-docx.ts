import fs from "fs/promises";
import path from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import QRCode from "qrcode";
import sharp from "sharp";
import { inquiryTierLabel } from "@/content/goennerMemberships";
import { chfFmt, type GoennerMemberRow, type GoennerPaymentRow } from "@/lib/goenner-finance";
import { buildSwissQrPayload, readInvoiceBankConfig } from "@/lib/invoice-config";
import { siteContent } from "@/content/siteContent";

function moneyWords(amount: number): string {
  return chfFmt(amount);
}

function formatAddress(member: GoennerMemberRow): string[] {
  const lines = [member.name];
  if (member.street?.trim()) lines.push(member.street.trim());
  const cityLine = [member.postal_code?.trim(), member.city?.trim()].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  return lines;
}

function invoiceDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
}

async function loadLogoPng(): Promise<Buffer> {
  const svgPath = path.join(process.cwd(), "public", "brand-assets", "logos", "mauro-gilardi-golf-logo.svg");
  const svg = await fs.readFile(svgPath);
  return sharp(svg, { density: 220 }).resize({ width: 520, withoutEnlargement: true }).png().toBuffer();
}

async function loadQrPng(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: "png",
    width: 280,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#171513", light: "#ffffff" },
  });
}

export async function buildGoennerInvoiceDocx(params: {
  member: GoennerMemberRow;
  payment: GoennerPaymentRow;
}): Promise<{ buffer: Buffer; filename: string }> {
  const { member, payment } = params;
  const amount = Number(payment.amount_chf);
  const issued = new Date().toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const addressLines = formatAddress(member);
  const tier = payment.membership_id
    ? inquiryTierLabel(payment.membership_id)
    : inquiryTierLabel(member.membership_id);

  const logoPng = await loadLogoPng();
  const bank = readInvoiceBankConfig();

  let qrImage: Buffer | null = null;
  if (bank) {
    const payload = buildSwissQrPayload({
      bank,
      amountChf: amount,
      debtorName: member.name,
      debtorStreet: member.street || undefined,
      debtorPostalCode: member.postal_code || undefined,
      debtorCity: member.city || undefined,
      message: `Gönnerbeitrag ${tier}`,
    });
    qrImage = await loadQrPng(payload);
  }

  const safeName = member.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  const filename = `Rechnung_${safeName || "Goenner"}_${payment.paid_on}.docx`;

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new ImageRun({
          type: "png",
          data: logoPng,
          transformation: { width: 180, height: 84 },
          altText: { title: "Logo", description: "Mauro Gilardi Golf Logo", name: "logo" },
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [
        new TextRun({
          text: "RECHNUNG / BEITRAGSBELEG",
          bold: true,
          size: 18,
          font: "Calibri",
          color: "D71920",
          characterSpacing: 80,
        }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Persönliche Rechnung für ${member.name}`,
          bold: true,
          size: 32,
          font: "Calibri",
          color: "171513",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Ausgestellt am: ", font: "Calibri", size: 20, color: "555555" }),
        new TextRun({ text: issued, font: "Calibri", size: 20, color: "171513" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "Bezug Zahlung vom: ", font: "Calibri", size: 20, color: "555555" }),
        new TextRun({ text: invoiceDateLabel(payment.paid_on), font: "Calibri", size: 20, color: "171513" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: "Rechnungsadresse", bold: true, size: 20, font: "Calibri", color: "D71920" })],
    }),
    ...addressLines.map(
      (line) =>
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: line, font: "Calibri", size: 22, color: "171513" })],
        }),
    ),
    ...(member.email
      ? [
          new Paragraph({
            spacing: { before: 40, after: 20 },
            children: [new TextRun({ text: member.email, font: "Calibri", size: 20, color: "555555" })],
          }),
        ]
      : []),
    ...(member.phone
      ? [
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: member.phone, font: "Calibri", size: 20, color: "555555" })],
          }),
        ]
      : []),
    new Paragraph({
      spacing: { before: 200, after: 80 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "E8E6E3", space: 12 },
      },
      children: [new TextRun({ text: "Leistungsübersicht", bold: true, size: 20, font: "Calibri", color: "D71920" })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Mitgliedschaft / Stufe: ", font: "Calibri", size: 22, color: "555555" }),
        new TextRun({ text: tier, font: "Calibri", size: 22, color: "171513", bold: true }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Betrag (letzte Einzahlung): ", font: "Calibri", size: 22, color: "555555" }),
        new TextRun({ text: moneyWords(amount), bold: true, font: "Calibri", size: 28, color: "171513" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Zahlungsmethode: ${payment.method.toUpperCase()}`,
          font: "Calibri",
          size: 20,
          color: "555555",
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text: "Danke", bold: true, size: 20, font: "Calibri", color: "D71920" })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Liebe/r ${member.name.split(/\s+/)[0] || member.name}, dein Support bedeutet mir sehr viel — er gibt mir den Rückenwind, meinen Weg als Swiss PGA Professional konsequent weiterzugehen.`,
          font: "Calibri",
          size: 22,
          color: "171513",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "Mit deinem Beitrag bist du Teil meines Teams. Danke für dein Vertrauen, deine Treue und die gemeinsame Reise — auf dem Platz und darüber hinaus.",
          font: "Calibri",
          size: 22,
          color: "171513",
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [new TextRun({ text: "Sportliche Grüsse", font: "Calibri", size: 22, color: "171513" })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: siteContent.brand.name, bold: true, font: "Calibri", size: 22, color: "171513" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${siteContent.brand.role} · ${siteContent.contact.email}`,
          font: "Calibri",
          size: 18,
          color: "555555",
        }),
      ],
    }),
  ];

  if (qrImage && bank) {
    children.push(
      new Paragraph({
        spacing: { before: 280, after: 80 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "E8E6E3", space: 14 },
        },
        children: [
          new TextRun({ text: "Zahlung per QR-Rechnung", bold: true, size: 20, font: "Calibri", color: "D71920" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `IBAN ${bank.iban} · ${bank.creditorName}${bank.creditorCity ? `, ${bank.creditorPostalCode} ${bank.creditorCity}` : ""}`,
            font: "Calibri",
            size: 18,
            color: "555555",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new ImageRun({
            type: "png",
            data: qrImage,
            transformation: { width: 160, height: 160 },
            altText: { title: "QR", description: "Swiss QR Zahlungscode", name: "qr" },
          }),
        ],
      }),
    );
  } else {
    children.push(
      new Paragraph({
        spacing: { before: 280, after: 80 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "E8E6E3", space: 14 },
        },
        children: [
          new TextRun({ text: "Zahlung / QR-Code", bold: true, size: 20, font: "Calibri", color: "D71920" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "Der QR-Code für dein Bankkonto wird ergänzt, sobald die Kontodaten hinterlegt sind (INVOICE_QR_IBAN in der Umgebung).",
            font: "Calibri",
            size: 20,
            italics: true,
            color: "777777",
          }),
        ],
      }),
    );
  }

  const doc = new Document({
    creator: "Mauro Gilardi",
    title: `Rechnung ${member.name}`,
    description: "Gönner-Beitragsbeleg",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return { buffer: Buffer.from(buffer), filename };
}
