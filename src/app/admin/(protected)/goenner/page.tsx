import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";
import { membershipLabel, type MembershipId } from "@/content/goennerMemberships";

function labelFor(id: string): string {
  if (id === "birdie" || id === "eagle" || id === "albatros") {
    return membershipLabel(id as MembershipId);
  }
  return id;
}

export default async function AdminGoennerPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data as GoennerInquiryRow[]) ?? [];

  return (
    <div className="admin-card-stack">
      <h1 className="admin-h1">Gönner-Anfragen</h1>
      <p className="admin-muted">Mitgliedschaftsanfragen über dein Gönner-Formular.</p>
      {error ? (
        <p className="admin-muted">
          Tabelle fehlt oder keine Berechtigung. Führe{" "}
          <code className="admin-code">supabase/goenner_inquiries.sql</code> in Supabase aus.
        </p>
      ) : null}
      {!error && rows.length === 0 ? (
        <p className="admin-muted">Noch keine Anfragen.</p>
      ) : null}
      {!error && rows.length > 0 ? (
        <ul className="admin-goenner-list">
          {rows.map((row) => (
            <li key={row.id} className="admin-goenner-card">
              <div className="admin-goenner-card-head">
                <strong>{row.name}</strong>
                <time dateTime={row.created_at}>
                  {new Date(row.created_at).toLocaleString("de-CH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p className="admin-goenner-membership">{labelFor(row.membership_id)}</p>
              <p className="admin-goenner-meta">
                <a href={`mailto:${encodeURIComponent(row.email)}`}>{row.email}</a>
                {row.phone ? (
                  <>
                    {" · "}
                    <a href={`tel:${row.phone.replace(/\s/g, "")}`}>{row.phone}</a>
                  </>
                ) : null}
              </p>
              {row.message ? <p className="admin-goenner-message">{row.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
