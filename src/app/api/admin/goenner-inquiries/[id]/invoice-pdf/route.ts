import { artFor } from "@/lib/goenner-mail-variants";
import { parseSeason } from "@/lib/goenner-invoice-mail";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import { buildGoennerInvoicePdf, type InvoicePdfRow } from "@/lib/goenner-invoice-pdf";

export const maxDuration = 60;

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

/** PDF-Rechnung einer Anfrage (Zahlungsart Rechnung), zum Herunterladen im Admin. */
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
  }

  const row = data as InvoicePdfRow & { payment_method: string | null };
  if (row.payment_method !== "rechnung" || !row.invoice_number) {
    return NextResponse.json(
      { error: "Für diese Anfrage gibt es keine Rechnung (Zahlungsart Rechnung fehlt)." },
      { status: 400 },
    );
  }

  try {
    const u = new URL(request.url);
    const variant = {
      art: (u.searchParams.get("art") as "goenner" | "sponsor" | "partner" | null) ?? artFor(row.membership_id, (row as { category?: string | null }).category),
      status: u.searchParams.get("status") === "bestand" ? ("bestand" as const) : ("neu" as const),
    };
    const { buffer, filename } = await buildGoennerInvoicePdf(row, parseSeason(request.url), variant);
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
