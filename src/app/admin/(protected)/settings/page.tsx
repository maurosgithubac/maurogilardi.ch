import { AdminChangePasswordForm } from "@/components/admin-change-password-form";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";

type SearchParams = Promise<{ pflicht?: string }>;

export default async function AdminSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { pflicht } = await searchParams;
  const mustChange = pflicht === "1";

  return (
    <div className="ap-page ac-page">
      <AdminPageHeader
        eyebrow="Konto"
        title={mustChange ? "Eigenes Passwort festlegen" : "Einstellungen"}
        description={
          mustChange
            ? "Dein Konto wurde mit einem Startpasswort angelegt. Danach geht es direkt weiter zur Übersicht."
            : "Passwort für den Admin-Zugang ändern. Du bleibst dabei angemeldet."
        }
      />

      {mustChange ? (
        <p className="ap-banner ap-banner--warn" role="alert">
          <strong>Bitte vergib zuerst ein eigenes Passwort.</strong> Erst danach sind die übrigen Bereiche des Admin-Portals freigeschaltet.
        </p>
      ) : null}

      <div className="ac-grid">
        <section className="dash-card ac-card" style={{ "--i": 0 } as React.CSSProperties} aria-labelledby="password-heading">
          <div className="dash-card-head">
            <div>
              <h2 id="password-heading" className="dash-h2">
                {mustChange ? "Neues Passwort" : "Passwort ändern"}
              </h2>
              <span className="dash-card-sub">Zur Sicherheit fragen wir zuerst das aktuelle Passwort ab.</span>
            </div>
          </div>
          <AdminChangePasswordForm />
        </section>

        <aside className="dash-card ac-tips" style={{ "--i": 1 } as React.CSSProperties} aria-labelledby="ac-tips-h">
          <h2 id="ac-tips-h" className="dash-h2">Ein gutes Passwort</h2>
          <ul>
            <li>Mindestens 8 Zeichen, besser 12 oder mehr.</li>
            <li>Ein ganzer Satz oder mehrere Wörter sind sicherer als ein kurzes Wort mit Zahl.</li>
            <li>Nicht auf anderen Seiten verwenden.</li>
            <li>Im Passwort-Manager speichern, damit du es nicht aufschreiben musst.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
