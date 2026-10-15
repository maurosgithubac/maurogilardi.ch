"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inquiryTierShort, memberCategoryLabel } from "@/content/goennerMemberships";
import { AdminPageHeader, categoryOf, StatusBadge, type PayState } from "@/components/admin/admin-ui";
import { IconCopy, IconMail } from "@/components/admin/admin-icons";
import type { GoennerMemberRow } from "@/lib/goenner-finance";
import { eventDateLabel, inviteLink, zurichStamp, type InviteKind, type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";

type Person = Pick<GoennerMemberRow, "id" | "name" | "email" | "membership_id" | "category" | "active">;

type SendResult = {
  sent: number;
  skipped: { name: string; reason: string }[];
  failed: { name: string; error: string }[];
};

export function AdminTournamentClient({
  missing,
  tournaments,
  members,
  invites,
}: {
  missing: boolean;
  tournaments: TournamentRow[];
  members: Person[];
  invites: TournamentInviteRow[];
}) {
  const router = useRouter();
  const [currentId, setCurrentId] = useState(tournaments[0]?.id ?? "");
  const tournament = tournaments.find((item) => item.id === currentId) ?? null;
  const [draft, setDraft] = useState({
    title: tournament?.title ?? `Gönnerturnier ${new Date().getFullYear()}`,
    event_date: tournament?.event_date ?? "",
    place: tournament?.place ?? "Domat/Ems",
    clinic_time: tournament?.clinic_time ?? "Vormittag",
    first_flight_time: tournament?.first_flight_time ?? "12:00",
    dinner_time: tournament?.dinner_time ?? "18:30",
    intro: tournament?.intro ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [clinicPicked, setClinicPicked] = useState<string[]>([]);
  const [roundPicked, setRoundPicked] = useState<string[]>([]);
  const [reminding, setReminding] = useState<string | null>(null);

  function load(next: TournamentRow | null) {
    setCurrentId(next?.id ?? "");
    setClinicPicked([]);
    setRoundPicked([]);
    setDraft({
      title: next?.title ?? `Gönnerturnier ${new Date().getFullYear()}`,
      event_date: next?.event_date ?? "",
      place: next?.place ?? "Domat/Ems",
      clinic_time: next?.clinic_time ?? "Vormittag",
      first_flight_time: next?.first_flight_time ?? "12:00",
      dinner_time: next?.dinner_time ?? "18:30",
      intro: next?.intro ?? "",
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(tournament ? `/api/admin/turnier/${tournament.id}` : "/api/admin/turnier", {
        method: tournament ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { error?: string; tournament?: TournamentRow };
      if (!res.ok || !data.tournament) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      setNotice("Turnier gespeichert.");
      setCurrentId(data.tournament.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: "open" | "closed") {
    if (!tournament) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/turnier/${tournament.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Status fehlgeschlagen.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const mine = invites.filter((invite) => invite.tournament_id === tournament?.id);
  const byMember = new Map(mine.map((invite) => [invite.member_id, invite]));
  const clinicSentKey = mine
    .filter((invite) => invite.invited_at && invite.kind === "clinic" && invite.member_id)
    .map((invite) => invite.member_id)
    .join(",");
  const clinicSent = new Set(clinicSentKey ? clinicSentKey.split(",") : []);
  const roundSent = new Set(
    mine.filter((invite) => invite.invited_at && invite.kind === "round" && invite.member_id).map((invite) => invite.member_id as string),
  );
  const clinicPeople = members.filter((member) => !roundSent.has(member.id));
  const roundPeople = members.filter((member) => !clinicPicked.includes(member.id) && !clinicSent.has(member.id));

  useEffect(() => {
    const sent = new Set(clinicSentKey ? clinicSentKey.split(",") : []);
    setClinicPicked((prev) => {
      const next = prev.filter((id) => !sent.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [clinicSentKey]);

  const counts = useMemo(() => {
    const responded = mine.filter((invite) => invite.responded_at);
    return {
      invited: mine.filter((invite) => invite.invited_at).length,
      responded: responded.length,
      clinic: responded.filter((invite) => invite.clinic).length,
      round: responded.filter((invite) => invite.golf_round).length,
      dinner: responded.filter((invite) => invite.dinner).length,
      declined: responded.filter((invite) => !invite.clinic && !invite.golf_round && !invite.dinner).length,
    };
  }, [mine]);

  const openInvites = mine.filter((invite) => invite.invited_at && !invite.responded_at);

  async function copyLink(invite: TournamentInviteRow) {
    try {
      await navigator.clipboard.writeText(inviteLink(invite.token));
      setNotice(`Link von ${invite.name} kopiert.`);
      setError(null);
    } catch {
      setError("Link konnte nicht kopiert werden.");
    }
  }

  async function remind(ids: string[], label: string) {
    if (!tournament) return;
    if (!window.confirm(`${label}? Derselbe Link, kurze Erinnerung per Mail.`)) return;
    setReminding(ids.length === 1 ? ids[0] : "all");
    setError(null);
    try {
      const res = await fetch(`/api/admin/turnier/${tournament.id}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_ids: ids }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: { name: string; error: string }[];
        warning?: string | null;
      };
      if (!res.ok) {
        setError(data.error || "Reminder fehlgeschlagen.");
        return;
      }
      const failed = data.failed?.length ? `, ${data.failed.length} fehlgeschlagen` : "";
      setNotice(data.warning || `${data.sent ?? 0} Reminder gesendet${failed}.`);
      if (data.failed?.length) setError(data.failed.map((item) => `${item.name}: ${item.error}`).join(" "));
      router.refresh();
    } finally {
      setReminding(null);
    }
  }

  return (
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Gönnerturnier"
        title={tournament ? tournament.title : "Turnier"}
        description="Zuerst wählst du, wer die Einladung mit Klinik bekommt. Danach, wer nur Golfrunde und Abendessen bekommt. In der Liste sind alle aktiven Personen, auch ohne Status bezahlt. Der 100er Club ist nicht dabei. Ein Mail geht erst raus, wenn du die Einladung sendest."
        actions={
          tournaments.length > 0 ? (
            <label className="ap-field-inline">
              <span>Turnier</span>
              <select
                className="ap-select"
                value={currentId}
                onChange={(event) => load(tournaments.find((item) => item.id === event.target.value) ?? null)}
              >
                {tournaments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null
        }
      />

      {missing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Tabellen fehlen noch. In Supabase ausführen: <code>supabase/023_tournament.sql</code>
        </p>
      ) : null}
      {error ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="ap-banner ap-banner--ok" role="status">
          {notice}
        </p>
      ) : null}

      <form className="ap-card ap-form" onSubmit={save}>
        <div className="ap-card-head">
          <h2 className="ap-h2">{tournament ? "Angaben" : "Neues Turnier"}</h2>
          {tournament ? (
            <button
              type="button"
              className="ap-btn ap-btn--secondary ap-btn--sm"
              disabled={busy}
              onClick={() => void setStatus(tournament.status === "open" ? "closed" : "open")}
            >
              {tournament.status === "open" ? "Anmeldung schliessen" : "Anmeldung öffnen"}
            </button>
          ) : null}
        </div>
        <div className="ap-form-grid ap-form-grid--3">
          <label className="ap-field">
            <span className="ap-label">Titel</span>
            <input className="ap-input" value={draft.title} required onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="ap-field">
            <span className="ap-label">Datum</span>
            <input className="ap-input" type="date" required value={draft.event_date} onChange={(event) => setDraft({ ...draft, event_date: event.target.value })} />
          </label>
          <label className="ap-field">
            <span className="ap-label">Ort</span>
            <input className="ap-input" value={draft.place} required onChange={(event) => setDraft({ ...draft, place: event.target.value })} />
          </label>
          <label className="ap-field">
            <span className="ap-label">Klinik</span>
            <input className="ap-input" value={draft.clinic_time} onChange={(event) => setDraft({ ...draft, clinic_time: event.target.value })} />
          </label>
          <label className="ap-field">
            <span className="ap-label">Erstes Flight</span>
            <input className="ap-input" value={draft.first_flight_time} onChange={(event) => setDraft({ ...draft, first_flight_time: event.target.value })} />
          </label>
          <label className="ap-field">
            <span className="ap-label">Abendessen</span>
            <input className="ap-input" value={draft.dinner_time} onChange={(event) => setDraft({ ...draft, dinner_time: event.target.value })} />
          </label>
          <label className="ap-field ap-span-all">
            <span className="ap-label">Zusatztext in der Einladung, freiwillig</span>
            <textarea className="ap-input ap-textarea" rows={2} value={draft.intro} onChange={(event) => setDraft({ ...draft, intro: event.target.value })} />
          </label>
        </div>
        <div className="ap-form-actions">
          <button type="submit" className="ap-btn ap-btn--primary" disabled={busy || missing}>
            {busy ? "Speichern…" : tournament ? "Angaben speichern" : "Turnier anlegen"}
          </button>
          {tournament ? (
            <span className="ap-muted-sm">
              {eventDateLabel(tournament.event_date)} · {tournament.status === "open" ? "Anmeldung offen" : "Anmeldung geschlossen"}
            </span>
          ) : null}
        </div>
      </form>

      {tournament ? (
        <>
          <div className="ap-grid-2">
            <InvitePanel
              key={`${tournament.id}-clinic`}
              step="1"
              title="Mit Klinik"
              text="Du entscheidest, wer dabei ist. Die Mail enthält Klinik, Golfrunde und Abendessen."
              emptyText="Keine aktive Person."
              kind="clinic"
              people={clinicPeople}
              picked={clinicPicked}
              onPicked={(next) => {
                setClinicPicked(next);
                setRoundPicked((prev) => prev.filter((id) => !next.includes(id)));
              }}
              byMember={byMember}
              disabled={busy || tournament.status === "closed"}
              onSent={(result) => {
                setNotice(sendNotice(result));
                setError(result.failed.length ? result.failed.map((item) => `${item.name}: ${item.error}`).join(" ") : null);
                router.refresh();
              }}
              tournamentId={tournament.id}
            />
            <InvitePanel
              key={`${tournament.id}-round`}
              step="2"
              title="Nur Turnier und Abendessen"
              text="Golfrunde und Abendessen, ohne Klinik. Wer links angekreuzt ist, verschwindet hier und kommt beim Abwählen zurück."
              emptyText={
                members.length > 0 ? "Alle übrigen Personen sind bei der Klinik." : "Keine aktive Person."
              }
              kind="round"
              people={roundPeople}
              picked={roundPicked}
              onPicked={setRoundPicked}
              byMember={byMember}
              disabled={busy || tournament.status === "closed"}
              onSent={(result) => {
                if (result.failed.length === 0) setRoundPicked([]);
                setNotice(sendNotice(result));
                setError(result.failed.length ? result.failed.map((item) => `${item.name}: ${item.error}`).join(" ") : null);
                router.refresh();
              }}
              tournamentId={tournament.id}
            />
          </div>

          <section className="ap-card ap-card--flush">
            <div className="ap-card-head">
              <h2 className="ap-h2">Gesendete Einladungen</h2>
              <span className="ap-muted-sm">
                {counts.invited} eingeladen · {counts.responded} geantwortet · Klinik {counts.clinic} · Runde {counts.round} · Essen {counts.dinner} · Absage {counts.declined}
              </span>
              <button
                type="button"
                className="ap-btn ap-btn--secondary ap-btn--sm"
                disabled={busy || reminding !== null || tournament.status === "closed" || openInvites.length === 0}
                onClick={() => void remind(openInvites.map((invite) => invite.id), `Reminder an ${openInvites.length} Personen ohne Antwort senden`)}
              >
                {reminding === "all" ? "Sende…" : `Reminder an alle ohne Antwort (${openInvites.length})`}
              </button>
            </div>
            <div className="ap-table-wrap">
              <table className="ap-table ap-table--tournament">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Einladung</th>
                    <th>Klinik</th>
                    <th>Runde</th>
                    <th>Essen</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.length === 0 ? (
                    <tr className="ap-empty-row">
                      <td colSpan={6}>Noch keine Einladung versendet.</td>
                    </tr>
                  ) : (
                    mine.map((invite) => {
                      const stand = inviteStand(invite);
                      return (
                      <tr key={invite.id}>
                        <td className="ap-cell-name">
                          <span className="ap-row-title">{invite.name}</span>
                          <span className="ap-row-sub">{invite.email}</span>
                          <span className="ap-row-status">
                            <StatusBadge state={stand.state}>{stand.label}</StatusBadge>
                            {stand.detail ? <span>{stand.detail}</span> : null}
                          </span>
                          {invite.reminded_at ? <span className="ap-row-sub">Reminder {zurichStamp(invite.reminded_at)}</span> : null}
                          {invite.note ? <span className="ap-row-sub">{invite.note}</span> : null}
                        </td>
                        <td data-label="Einladung">{invite.kind === "clinic" ? "Mit Klinik" : "Nur Turnier"}</td>
                        <td data-label="Klinik">{mark(invite)}</td>
                        <td data-label="Runde">{part(invite, invite.golf_round)}</td>
                        <td data-label="Essen">{part(invite, invite.dinner)}</td>
                        <td data-label="Link">
                          <div className="ap-btn-row">
                            <button
                              type="button"
                              className="ap-icon-btn"
                              aria-label={`Link von ${invite.name} kopieren`}
                              onClick={() => void copyLink(invite)}
                            >
                              <IconCopy />
                            </button>
                            <button
                              type="button"
                              className="ap-icon-btn"
                              aria-label={`Reminder an ${invite.name} senden`}
                              disabled={!invite.invited_at || reminding !== null || tournament.status === "closed"}
                              onClick={() => void remind([invite.id], `Reminder an ${invite.name} senden`)}
                            >
                              <IconMail />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function inviteStand(invite: TournamentInviteRow): { state: PayState; label: string; detail: string } {
  if (!invite.invited_at) return { state: "none", label: "Nicht gesendet", detail: "" };
  if (!invite.responded_at) return { state: "open", label: "Offen", detail: `seit ${zurichStamp(invite.invited_at)}` };
  const yes = [
    invite.kind === "clinic" && invite.clinic ? "Klinik" : null,
    invite.golf_round ? "Runde" : null,
    invite.dinner ? "Essen" : null,
  ].filter((item): item is string => Boolean(item));
  if (yes.length === 0) return { state: "none", label: "Abgesagt", detail: zurichStamp(invite.responded_at) };
  return { state: "paid", label: "Angemeldet", detail: yes.join(", ") };
}

function mark(invite: TournamentInviteRow) {
  if (invite.kind !== "clinic") return "—";
  return part(invite, invite.clinic);
}

function part(invite: TournamentInviteRow, value: boolean | null) {
  if (!invite.responded_at) return "—";
  return value ? "Ja" : "Nein";
}

function sendNotice(result: SendResult) {
  const skipped = result.skipped.length ? `, ${result.skipped.length} übersprungen` : "";
  const failed = result.failed.length ? `, ${result.failed.length} fehlgeschlagen` : "";
  return `${result.sent} Einladungen gesendet${skipped}${failed}.`;
}

function InvitePanel({
  step,
  title,
  text,
  emptyText,
  kind,
  people,
  picked,
  onPicked,
  byMember,
  tournamentId,
  disabled,
  onSent,
}: {
  step: string;
  title: string;
  text: string;
  emptyText: string;
  kind: InviteKind;
  people: Person[];
  picked: string[];
  onPicked: (next: string[]) => void;
  byMember: Map<string | null, TournamentInviteRow>;
  tournamentId: string;
  disabled: boolean;
  onSent: (result: SendResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const visible = people.filter((person) => {
    const hay = `${person.name} ${person.email ?? ""}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  function locked(person: Person) {
    const invite = byMember.get(person.id);
    return Boolean(invite?.invited_at && invite.kind !== kind);
  }

  function selectable(person: Person) {
    return Boolean(person.email?.includes("@")) && !locked(person);
  }

  function toggle(id: string) {
    onPicked(picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id]);
  }

  async function send() {
    const count = picked.length;
    if (!window.confirm(`${count} Einladung${count === 1 ? "" : "en"} «${title}» senden?`)) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/turnier/${tournamentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, member_ids: picked }),
      });
      const data = (await res.json()) as SendResult & { error?: string };
      if (!res.ok) {
        onSent({ sent: 0, skipped: [], failed: [{ name: "Versand", error: data.error || "Fehlgeschlagen." }] });
        return;
      }
      onSent(data);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="ap-card">
      <div className="ap-card-head">
        <h2 className="ap-h2">
          {step}. {title}
        </h2>
        <span className="ap-count">{picked.length}</span>
      </div>
      <p className="ap-muted-sm">{text}</p>
      <div className="ap-form-actions">
        <button
          type="button"
          className="ap-btn ap-btn--ghost ap-btn--sm"
          onClick={() =>
            onPicked([...new Set([...picked, ...visible.filter(selectable).map((person) => person.id)])])
          }
        >
          Sichtbare auswählen
        </button>
        <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={() => onPicked([])}>
          Keine
        </button>
      </div>
      <label className="ap-field">
        <span className="sr-only">Personen suchen</span>
        <input className="ap-input" value={query} placeholder="Name oder E-Mail" onChange={(event) => setQuery(event.target.value)} />
      </label>
      <ul className="ap-pick">
        {people.length === 0 ? (
          <li className="ap-muted-sm">{emptyText}</li>
        ) : visible.length === 0 ? (
          <li className="ap-muted-sm">Keine Treffer.</li>
        ) : null}
        {visible.map((person) => {
          const invite = byMember.get(person.id);
          const blocked = locked(person);
          const hasMail = Boolean(person.email?.includes("@"));
          return (
            <li key={person.id}>
              <label className="ap-pick-row">
                <input
                  type="checkbox"
                  checked={picked.includes(person.id)}
                  disabled={!hasMail || blocked}
                  onChange={() => toggle(person.id)}
                />
                <span>
                  <strong>{person.name}</strong>
                  <span>
                    {inquiryTierShort(person.membership_id)} · {memberCategoryLabel(categoryOf(person))}
                    {person.email ? ` · ${person.email}` : " · keine E-Mail"}
                    {blocked ? " · schon in der anderen Einladung" : invite?.kind === kind && invite.invited_at ? ` · ${inviteStand(invite).label}` : ""}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="ap-form-actions">
        <button type="button" className="ap-btn ap-btn--primary" disabled={disabled || sending || picked.length === 0} onClick={() => void send()}>
          {sending ? "Sende…" : `Einladung senden (${picked.length})`}
        </button>
      </div>
    </section>
  );
}
