import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";
import { membershipLabel, type MembershipId } from "@/content/goennerMemberships";

function labelFor(id: string): string {
  if (id === "birdie" || id === "eagle" || id === "albatros") {
    return membershipLabel(id as MembershipId);
  }
  return id;
}

function formatPostalAddress(row: GoennerInquiryRow): string | null {
  const street = row.street?.trim();
  const plz = row.postal_code?.trim();
  const city = row.city?.trim();
  if (street && plz && city) return `${street}, ${plz} ${city}`;
  const parts = [street, plz, city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
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
      <header className="admin-page-head">
        <p className="admin-page-kicker">Gönner</p>
        <h1 className="admin-h1">Anfragen</h1>
        <p className="admin-muted admin-page-lead">
          Name, Kontakt, Adresse und Mitgliedschaft — alles auf einen Blick pro Eingang.
        </p>
      </header>

      <div className="admin-inline-kpis">
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Anfragen</span>
          <strong>{rows.length}</strong>
        </div>
      </div>

      {error ? (
        <p className="admin-muted">
          Tabelle fehlt, Spalten fehlen oder keine Berechtigung. In Supabase nacheinander ausführen:{" "}
          <code className="admin-code">supabase/goenner_inquiries.sql</code> und bei bestehender Tabelle{" "}
          <code className="admin-code">supabase/goenner_inquiries_add_address.sql</code>.
        </p>
      ) : null}

      {!error && rows.length === 0 ? <p className="admin-muted">Noch keine Anfragen.</p> : null}

      {!error && rows.length > 0 ? (
        <ul className="admin-goenner-list">
          {rows.map((row) => {
            const addressLine = formatPostalAddress(row);
            return (
              <li key={row.id}>
                <article className="admin-goenner-card">
                  <header className="admin-goenner-card-head">
                    <div className="admin-goenner-card-title">
                      <strong>{row.name}</strong>
                      <span className="admin-goenner-tier">{labelFor(row.membership_id)}</span>
                    </div>
                    <time dateTime={row.created_at}>
                      {new Date(row.created_at).toLocaleString("de-CH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </header>

                  <div className="admin-goenner-panels">
                    <section className="admin-goenner-panel" aria-label="Kontakt">
                      <h3 className="admin-goenner-panel-title">Kontakt</h3>
                      <p className="admin-goenner-panel-body">
                        <a href={`mailto:${encodeURIComponent(row.email)}`}>{row.email}</a>
                        {row.phone ? (
                          <>
                            <br />
                            <a href={`tel:${row.phone.replace(/\s/g, "")}`}>{row.phone}</a>
                          </>
                        ) : (
                          <span className="admin-goenner-dash"> · kein Telefon</span>
                        )}
                      </p>
                    </section>

                    <section className="admin-goenner-panel" aria-label="Adresse">
                      <h3 className="admin-goenner-panel-title">Adresse</h3>
                      <p className="admin-goenner-panel-body admin-goenner-panel-body--address">
                        {addressLine ?? (
                          <span className="admin-muted">— nicht erfasst (ältere Anfrage)</span>
                        )}
                      </p>
                    </section>
                  </div>

                  {row.message ? (
                    <section className="admin-goenner-note" aria-label="Nachricht">
                      <h3 className="admin-goenner-panel-title">Nachricht</h3>
                      <p className="admin-goenner-message">{row.message}</p>
                    </section>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
