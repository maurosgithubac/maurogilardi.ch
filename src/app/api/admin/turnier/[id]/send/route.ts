import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import type { GoennerMemberRow } from "@/lib/goenner-finance";
import { sendInvitationMail } from "@/lib/tournament-mails";
import {
  isHundertMember,
  newInviteToken,
  type InviteKind,
  type TournamentInviteRow,
  type TournamentRow,
} from "@/lib/tournament";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  let body: { kind?: InviteKind; member_ids?: string[] };
  try {
    body = (await request.json()) as { kind?: InviteKind; member_ids?: string[] };
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }
  const kind = body.kind;
  const ids = (body.member_ids ?? []).filter((value) => UUID.test(value));
  if (kind !== "clinic" && kind !== "round") return NextResponse.json({ error: "Ungültige Einladung." }, { status: 400 });
  if (ids.length === 0) return NextResponse.json({ error: "Keine Personen ausgewählt." }, { status: 400 });
  if (ids.length > 200) return NextResponse.json({ error: "Zu viele Personen auf einmal." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });
  if (!tournament) return NextResponse.json({ error: "Turnier nicht gefunden." }, { status: 404 });
  if ((tournament as TournamentRow).status === "closed") {
    return NextResponse.json({ error: "Die Anmeldung ist geschlossen." }, { status: 400 });
  }

  const { data: members, error: membersError } = await supabase
    .from("goenner_members")
    .select("id,name,email,membership_id,category,active")
    .in("id", ids);
  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });

  const skipped: { name: string; reason: string }[] = [];
  const failed: { name: string; error: string }[] = [];
  let sent = 0;

  for (const member of (members ?? []) as Pick<
    GoennerMemberRow,
    "id" | "name" | "email" | "membership_id" | "category" | "active"
  >[]) {
    if (!member.active) {
      skipped.push({ name: member.name, reason: "Nicht aktiv." });
      continue;
    }
    if (isHundertMember(member)) {
      skipped.push({ name: member.name, reason: "100er Club." });
      continue;
    }
    const email = member.email?.trim().toLowerCase() || "";
    if (!email.includes("@")) {
      skipped.push({ name: member.name, reason: "Keine E-Mail." });
      continue;
    }

    const { data: existing } = await supabase
      .from("tournament_invites")
      .select("*")
      .eq("tournament_id", id)
      .eq("member_id", member.id)
      .maybeSingle();

    let invite = existing as TournamentInviteRow | null;
    if (!invite) {
      const { data: created, error: insertError } = await supabase
        .from("tournament_invites")
        .insert({
          tournament_id: id,
          member_id: member.id,
          kind,
          token: newInviteToken(),
          name: member.name,
          email,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (insertError || !created) {
        failed.push({ name: member.name, error: insertError?.message || "Speichern fehlgeschlagen." });
        continue;
      }
      invite = created as TournamentInviteRow;
    } else if (invite.kind !== kind) {
      if (invite.invited_at) {
        skipped.push({ name: member.name, reason: "Schon mit der anderen Einladung versendet." });
        continue;
      }
      const { error: kindError } = await supabase
        .from("tournament_invites")
        .update({ kind, email, name: member.name, updated_at: new Date().toISOString() })
        .eq("id", invite.id);
      if (kindError) {
        failed.push({ name: member.name, error: kindError.message });
        continue;
      }
      invite = { ...invite, kind, email, name: member.name };
    } else if (invite.email !== email || invite.name !== member.name) {
      await supabase
        .from("tournament_invites")
        .update({ email, name: member.name, updated_at: new Date().toISOString() })
        .eq("id", invite.id);
      invite = { ...invite, email, name: member.name };
    }

    try {
      await sendInvitationMail(tournament as TournamentRow, invite);
      await supabase
        .from("tournament_invites")
        .update({ invited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", invite.id);
      sent += 1;
    } catch (error) {
      failed.push({ name: member.name, error: error instanceof Error ? error.message : "Mail fehlgeschlagen." });
    }
  }

  const known = new Set((members ?? []).map((member) => member.id));
  for (const missing of ids.filter((memberId) => !known.has(memberId))) {
    skipped.push({ name: missing, reason: "Person nicht gefunden." });
  }

  return NextResponse.json({ sent, skipped, failed });
}
