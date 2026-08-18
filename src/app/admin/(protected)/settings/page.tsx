import { AdminChangePasswordForm } from "@/components/admin-change-password-form";

export default function AdminSettingsPage() {
  return (
    <div className="mgf-page">
      <header className="mgf-page-head">
        <p className="mgf-kicker">Konto</p>
        <h1 className="mgf-h1">Einstellungen</h1>
        <p className="mgf-lead">Passwort für den Admin-Zugang ändern. Du musst eingeloggt bleiben.</p>
      </header>

      <section className="mgf-panel mgf-settings-panel" aria-labelledby="password-heading">
        <div className="mgf-panel-head">
          <h2 id="password-heading" className="mgf-panel-title">
            Passwort ändern
          </h2>
        </div>
        <AdminChangePasswordForm />
      </section>
    </div>
  );
}
