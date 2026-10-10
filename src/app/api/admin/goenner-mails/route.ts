import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { expectedAnnualChf, type GoennerMemberRow } from "@/lib/goenner-finance";
import {
  mailAmountChf,
  nextInvoiceNumber,
  sendInvoiceMail,
  sendReceiptMail,
  type GoennerMailRow,
} from "@/lib/goenner-mails";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

type MailType = "rechnung" | "twint";
type Source = "inquiry" | "member";

const UUID = /^[0-9a-f-]{36}$/i;

type Recipient = GoennerMailRow & { phone: string | null; message: string | null };

/** Standard-Mails (Rechnung mit QR / TWINT mit Paylink) manuell aus dem Admin senden. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const source = body.source as Source;
  const type = body.type as MailType;
  const id = String(body.id ?? "");
  if (!["inquiry", "member"].includes(source) || !["rechnung", "twint"].includes(type) || !UUID.test(id)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  let recipient: Recipient;

  if (source === "inquiry") {
    const { data, error } = await supabase.from("goenner_inquiries").select("*").eq("id", id).maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    recipient = {
      id: data.id,
      membership_id: data.membership_id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      street: data.street ?? null,
      postal_code: data.postal_code ?? null,
      city: data.city ?? null,
      payment_method: type,
      invoice_number: data.invoice_number ?? null,
      amount_chf: data.amount_chf != null ? Number(data.amount_chf) : null,
      message: data.message ?? null,
    };
  } else {
    const { data, error } = await supabase.from("goenner_members").select("*").eq("id", id).maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Person nicht gefunden." }, { status: 404 });
    const member = data as GoennerMemberRow;
    let invoiceNumber: string | null = null;
    if (member.inquiry_id) {
      const { data: inquiry } = await supabase
        .from("goenner_inquiries")
        .select("invoice_number")
        .eq("id", member.inquiry_id)
        .maybeSingle();
      invoiceNumber = inquiry?.invoice_number ?? null;
    }
    recipient = {
      id: member.id,
      membership_id: member.membership_id,
      name: member.name,
      email: member.email ?? "",
      phone: member.phone,
      street: member.street,
      postal_code: member.postal_code,
      city: member.city,
      payment_method: type,
      invoice_number: invoiceNumber,
      amount_chf: expectedAnnualChf(member) || null,
      message: null,
    };
  }

  if (!recipient.email.includes("@")) {
    return NextResponse.json({ error: "Keine gültige E-Mail-Adresse hinterlegt." }, { status: 400 });
  }
  if (!(mailAmountChf(recipient) > 0)) {
    return NextResponse.json(
      { error: "Kein Betrag hinterlegt — zuerst Stufe oder Jahresbetrag setzen." },
      { status: 400 },
    );
  }

  try {
    if (type === "rechnung") {
      if (source === "inquiry" && !recipient.invoice_number) {
        recipient.invoice_number = await nextInvoiceNumber(supabase);
        await supabase
          .from("goenner_inquiries")
          .update({ invoice_number: recipient.invoice_number, payment_method: "rechnung" })
          .eq("id", id);
      }
      await sendInvoiceMail(recipient);
      if (source === "inquiry") {
        await supabase
          .from("goenner_inquiries")
          .update({ invoice_mail_sent_at: new Date().toISOString() })
          .eq("id", id);
      }
    } else {
      await sendReceiptMail(recipient);
    }
  } catch (mailError) {
    console.error("admin goenner mail failed", mailError);
    return NextResponse.json(
      {
        error: `Mail konnte nicht gesendet werden: ${
          mailError instanceof Error ? mailError.message : "Unbekannter Fehler"
        }`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, email: recipient.email });
}
