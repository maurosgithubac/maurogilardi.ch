import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteForm } from "@/components/tournament/invite-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { eventDateLabel, isInviteToken, type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";
import "./tournament.css";

export const metadata: Metadata = {
  title: "Anmeldung",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TournamentInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isInviteToken(token)) notFound();

  const supabase = createSupabaseServerClient();
  const { data: invite } = await supabase.from("tournament_invites").select("*").eq("token", token).maybeSingle();
  if (!invite) notFound();
  const row = invite as TournamentInviteRow;
  const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", row.tournament_id).maybeSingle();
  if (!tournament) notFound();
  const event = tournament as TournamentRow;

  return (
    <main className="tn">
      <article className="tn-card">
        <p className="tn-kicker">Gönnerturnier</p>
        <h1>{event.title}</h1>
        <p className="tn-when">
          {eventDateLabel(event.event_date)} · {event.place}
        </p>
        <p className="tn-hello">Hallo {row.name.split(/\s+/)[0]}</p>
        {event.intro ? <p className="tn-intro">{event.intro}</p> : null}
        <p>
          Dein persönlicher Link. Name und E-Mail sind schon ausgefüllt. Du wählst, bei welchen Teilen des Tages du
          dabei bist, und kannst die Auswahl später über denselben Link ändern.
        </p>
        <InviteForm
          token={token}
          kind={row.kind}
          name={row.name}
          email={row.email}
          closed={event.status === "closed"}
          clinicTime={event.clinic_time}
          flightTime={event.first_flight_time}
          dinnerTime={event.dinner_time}
          initial={{
            clinic: row.clinic === true,
            golf_round: row.golf_round === true,
            dinner: row.dinner === true,
            note: row.note ?? "",
            responded: Boolean(row.responded_at),
          }}
        />
      </article>
    </main>
  );
}
