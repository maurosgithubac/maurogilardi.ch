/**
 * Admin-Konto anlegen (z. B. für die Finanzprüfung).
 * Erzeugt ein zufälliges Startpasswort, das beim ersten Login geändert werden MUSS
 * (user_metadata.must_change_password → Middleware leitet auf /admin/settings um).
 * Das Passwort wird nur hier im Terminal angezeigt — persönlich/sicher weitergeben.
 * Versendet KEINE E-Mail.
 *
 *   node --env-file=.env.local scripts/create-admin-user.mjs tina@example.ch
 */
import crypto from "node:crypto";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Bitte E-Mail angeben: node --env-file=.env.local scripts/create-admin-user.mjs name@domain.ch");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (.env.local).");
  process.exit(1);
}
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

// Gut lesbares Startpasswort (ohne verwechselbare Zeichen), 16 Zeichen
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const password = Array.from(crypto.randomBytes(16), (b) => alphabet[b % alphabet.length]).join("");

// Konto anlegen (E-Mail als bestätigt, damit kein Bestätigungsmail nötig ist)
let res = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { must_change_password: true } }),
});
let user = await res.json();

if (!res.ok) {
  // Existiert bereits → Startpasswort neu setzen und Pflicht zum Ändern aktivieren
  const list = await (await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers: H })).json();
  const existing = (list.users || []).find((u) => (u.email || "").toLowerCase() === email);
  if (!existing) {
    console.error("Konto konnte nicht angelegt werden:", user.msg || user.message || JSON.stringify(user));
    process.exit(1);
  }
  res = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
    method: "PUT",
    headers: H,
    body: JSON.stringify({ password, user_metadata: { ...(existing.user_metadata || {}), must_change_password: true } }),
  });
  if (!res.ok) {
    console.error("Passwort konnte nicht gesetzt werden:", await res.text());
    process.exit(1);
  }
  user = existing;
  console.log("Konto existierte bereits — Startpasswort neu gesetzt.");
}

// Admin-Freigabe
const grant = await fetch(`${url}/rest/v1/admin_users?on_conflict=user_id`, {
  method: "POST",
  headers: { ...H, Prefer: "resolution=ignore-duplicates" },
  body: JSON.stringify({ user_id: user.id }),
});
if (!grant.ok) {
  console.error("Admin-Freigabe fehlgeschlagen:", await grant.text());
  process.exit(1);
}

console.log("");
console.log(`Admin-Konto bereit: ${email}`);
console.log(`Startpasswort:      ${password}`);
console.log("Login: /admin/login — beim ersten Login muss ein eigenes Passwort gesetzt werden.");
console.log("Das Passwort wird nirgends gespeichert. Bitte persönlich weitergeben (nicht per Mail/Chat).");
