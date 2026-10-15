import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { sendReminderMail } from "@/lib/tournament-mails";
import { type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  let body: { invite_ids?: string[] };
  try {
    body = (await request.json()) as { invite_ids?: string[] };
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }
  const ids = [...new Set((body.invite_ids ?? []).filter((value) => UUID.test(value)))];
  if (ids.length === 0) return NextResponse.json({ error: "Keine Personen ausgewählt." }, { status: 400 });
  if (ids.length > 200) return NextResponse.json({ error: "Zu viele Personen auf einmal." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { data: tournament, error: tournamentError } = await supabase.from("tournaments").select("*").eq("id", id).maybeSingle();
  if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });
  if (!tournament) return NextResponse.json({ error: "Turnier nicht gefunden." }, { status: 404 });
  if ((tournament as TournamentRow).status === "closed") {
    return NextResponse.json({ error: "Die Anmeldung ist geschlossen." }, { status: 400 });
  }

  const { data: invites, error: invitesError } = await supabase
    .from("tournament_invites")
    .select("*")
    .eq("tournament_id", id)
    .in("id", ids);
  if (invitesError) return NextResponse.json({ error: invitesError.message }, { status: 500 });

  const failed: { name: string; error: string }[] = [];
  let sent = 0;
  let remindedColumn = true;

  for (const invite of (invites ?? []) as TournamentInviteRow[]) {
    if (!invite.invited_at) {
      failed.push({ name: invite.name, error: "Einladung wurde noch nicht gesendet." });
      continue;
    }
    try {
      await sendReminderMail(tournament as TournamentRow, invite);
    } catch (error) {
      failed.push({ name: invite.name, error: error instanceof Error ? error.message : "Mail fehlgeschlagen." });
      continue;
    }
    sent += 1;
    if (!remindedColumn) continue;
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("tournament_invites")
      .update({ reminded_at: now, updated_at: now })
      .eq("id", invite.id);
    if (updateError && /reminded_at/i.test(updateError.message)) remindedColumn = false;
    else if (updateError) failed.push({ name: invite.name, error: `Mail raus, Status nicht gespeichert: ${updateError.message}` });
  }

  const known = new Set((invites ?? []).map((invite) => invite.id));
  for (const missing of ids.filter((inviteId) => !known.has(inviteId))) {
    failed.push({ name: missing, error: "Einladung nicht gefunden." });
  }

  return NextResponse.json({
    sent,
    failed,
    warning: remindedColumn ? null : "Reminder gesendet. In Supabase noch supabase/024_tournament_reminded_at.sql ausführen, damit das Datum gespeichert wird.",
  });
}
