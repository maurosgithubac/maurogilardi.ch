import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendConfirmationMail } from "@/lib/tournament-mails";
import { isInviteToken, type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!isInviteToken(token)) return NextResponse.json({ error: "Link ungültig." }, { status: 404 });

  let body: { clinic?: boolean; golf_round?: boolean; dinner?: boolean; note?: string; decline?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: invite, error } = await supabase
    .from("tournament_invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !invite) return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 });

  const row = invite as TournamentInviteRow;
  const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", row.tournament_id).maybeSingle();
  if (!tournament) return NextResponse.json({ error: "Turnier nicht gefunden." }, { status: 404 });
  if ((tournament as TournamentRow).status === "closed") {
    return NextResponse.json({ error: "Die Anmeldung ist geschlossen." }, { status: 400 });
  }

  const decline = body.decline === true;
  const clinic = row.kind === "clinic" && body.clinic === true && !decline;
  const golf_round = body.golf_round === true && !decline;
  const dinner = body.dinner === true && !decline;
  if (!decline && !clinic && !golf_round && !dinner) {
    return NextResponse.json({ error: "Wähle mindestens einen Teil des Tages, oder sage ab." }, { status: 400 });
  }
  const note = String(body.note ?? "").trim().slice(0, 500) || null;

  const { data: saved, error: saveError } = await supabase
    .from("tournament_invites")
    .update({
      clinic,
      golf_round,
      dinner,
      note,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select("*")
    .single();
  if (saveError || !saved) return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });

  let warning: string | null = null;
  try {
    await sendConfirmationMail(tournament as TournamentRow, saved as TournamentInviteRow);
  } catch (mailError) {
    warning = mailError instanceof Error ? mailError.message : "Bestätigung konnte nicht gesendet werden.";
  }

  return NextResponse.json({
    ok: true,
    warning,
    invite: {
      clinic: saved.clinic,
      golf_round: saved.golf_round,
      dinner: saved.dinner,
      note: saved.note,
      responded_at: saved.responded_at,
    },
  });
}
