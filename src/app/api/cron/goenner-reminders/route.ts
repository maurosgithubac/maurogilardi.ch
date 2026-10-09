import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendAdminReminder, type GoennerMailRow } from "@/lib/goenner-mails";

const REMINDER_AFTER_DAYS = 30;

/**
 * Täglicher Lauf (Vercel Cron). Schickt dir eine Info-Mail, wenn eine Rechnung
 * 30 Tage nach Versand noch nicht bezahlt ist. Pro Rechnung nur einmal.
 * Gönner bekommen nichts.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("goenner_inquiries")
    .select("id,membership_id,name,email,street,postal_code,city,payment_method,invoice_number,invoice_mail_sent_at")
    .eq("payment_method", "rechnung")
    .eq("status", "open")
    .is("reminder_sent_at", null)
    .lt("invoice_mail_sent_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const row of data ?? []) {
    try {
      await sendAdminReminder(row as GoennerMailRow & { invoice_mail_sent_at: string | null });
      await supabase
        .from("goenner_inquiries")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      sent += 1;
    } catch (reminderError) {
      console.error("goenner reminder failed", row.id, reminderError);
    }
  }

  return NextResponse.json({ checked: data?.length ?? 0, sent });
}
