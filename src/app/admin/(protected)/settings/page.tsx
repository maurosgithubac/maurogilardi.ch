import { AdminChangePasswordForm } from "@/components/admin-change-password-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

type SearchParams = Promise<{ pflicht?: string }>;

export default async function AdminSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { pflicht } = await searchParams;
  const mustChange = pflicht === "1";

  return (
    <div className="ap-page ap-page--narrow">
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
        <p className="ap-banner ap-banner--warn ap-banner--strong" role="alert">
          <strong>Bitte vergib zuerst ein eigenes Passwort.</strong> Erst danach sind die übrigen Bereiche
          des Admin-Portals freigeschaltet.
        </p>
      ) : null}

      <section className="ap-card" aria-labelledby="password-heading">
        <div className="ap-card-head">
          <h2 id="password-heading" className="ap-h2">
            {mustChange ? "Neues Passwort" : "Passwort ändern"}
          </h2>
        </div>
        <AdminChangePasswordForm />
      </section>
    </div>
  );
}
