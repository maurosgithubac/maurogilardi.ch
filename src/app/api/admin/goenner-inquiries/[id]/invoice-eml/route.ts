import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import { buildGoennerInvoiceEml, buildGoennerTwintEml } from "@/lib/goenner-eml";
import { buildGoennerInvoiceMailText } from "@/lib/goenner-invoice-mail";
import { buildGoennerInvoiceHtmlEml } from "@/lib/goenner-invoice-html-mail";
import type { InvoicePdfRow } from "@/lib/goenner-invoice-pdf";

export const maxDuration = 60;

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

/** Outlook-Entwurf (.eml) mit Dankesnachricht und Rechnung einer Anfrage. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_inquiries")
    .select("id,membership_id,name,email,street,postal_code,city,payment_method,invoice_number,amount_chf,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });

  const row = data as InvoicePdfRow & { payment_method: string | null };
  if (row.payment_method !== "rechnung" || !row.invoice_number) {
    return NextResponse.json(
      { error: "Für diese Anfrage gibt es keine Rechnung (Zahlungsart Rechnung fehlt)." },
      { status: 400 },
    );
  }

  if (new URL(request.url).searchParams.get("format") === "json") {
    const mail = buildGoennerInvoiceMailText(row);
    return NextResponse.json(mail);
  }

  try {
    const twint = new URL(request.url).searchParams.get("type") === "twint";
    const { buffer, filename } = twint ? buildGoennerTwintEml(row) : await buildGoennerInvoiceHtmlEml(row);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "message/rfc822",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Entwurf konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
