import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { buildGoennerInvoicePdf, type InvoicePdfRow } from "@/lib/goenner-invoice-pdf";
import { nextInvoiceNumber } from "@/lib/goenner-mails";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const maxDuration = 60;

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

/**
 * PDF-Rechnung eines Gönners. Funktioniert mit und ohne Anmeldedatensatz:
 * Mit Anmeldung wird deren Rechnungsnummer verwendet, ohne Anmeldung die nächste freie.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data: member, error: memberError } = await supabase
    .from("goenner_members")
    .select("id,name,email,street,postal_code,city,membership_id,annual_amount_chf,inquiry_id")
    .eq("id", id)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: "Gönner nicht gefunden." }, { status: 404 });
  }

  let invoiceNumber: string | null = null;
  if (member.inquiry_id) {
    const { data: inquiry, error: inquiryError } = await supabase
      .from("goenner_inquiries")
      .select("invoice_number")
      .eq("id", member.inquiry_id)
      .maybeSingle();
    if (inquiryError) {
      return NextResponse.json({ error: inquiryError.message }, { status: 500 });
    }
    invoiceNumber = inquiry?.invoice_number ?? null;
  }
  if (!invoiceNumber) {
    try {
      invoiceNumber = await nextInvoiceNumber(supabase);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rechnungsnummer konnte nicht ermittelt werden.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const row: InvoicePdfRow = {
    id: member.id,
    membership_id: member.membership_id,
    name: member.name,
    email: member.email ?? "",
    street: member.street,
    postal_code: member.postal_code,
    city: member.city,
    payment_method: null,
    invoice_number: invoiceNumber,
    amount_chf: member.annual_amount_chf ?? null,
    created_at: new Date().toISOString(),
  };

  try {
    const { buffer, filename } = await buildGoennerInvoicePdf(row);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Rechnung.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
