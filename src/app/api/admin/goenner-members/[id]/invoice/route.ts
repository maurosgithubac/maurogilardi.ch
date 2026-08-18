import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { buildGoennerInvoiceDocx } from "@/lib/goenner-invoice-docx";
import type { GoennerMemberRow, GoennerPaymentRow } from "@/lib/goenner-finance";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

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
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: "Gönner nicht gefunden." }, { status: 404 });
  }

  const { data: payments, error: payError } = await supabase
    .from("goenner_payments")
    .select("*")
    .eq("member_id", id)
    .order("paid_on", { ascending: false })
    .limit(1);

  if (payError) {
    return NextResponse.json({ error: payError.message }, { status: 500 });
  }

  const payment = (payments as GoennerPaymentRow[] | null)?.[0];
  if (!payment) {
    return NextResponse.json(
      { error: "Keine Zahlung vorhanden — zuerst eine Einzahlung erfassen." },
      { status: 400 },
    );
  }

  try {
    const { buffer, filename } = await buildGoennerInvoiceDocx({
      member: member as GoennerMemberRow,
      payment,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rechnung konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
