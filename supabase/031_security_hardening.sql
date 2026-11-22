-- 031_security_hardening.sql
-- Assumes 001–030 are already applied.
--
-- Ziel: Der öffentliche anon-Key (steht zwangsläufig im Browser) darf keine Daten lesen,
-- schreiben oder löschen. Admins greifen über ihr Login (JWT + admin_users) zu,
-- der Website-Code über den Service-Role-Key auf dem Server. Beide Wege umgehen
-- bzw. erfüllen die Regeln unten; anonyme Zugriffe laufen ins Leere.
--
-- Ausführen: Supabase → SQL Editor → ganzes Skript einfügen → Run.
-- Das Skript ist idempotent (mehrfach ausführbar).

-- ---------------------------------------------------------------------------
-- 0. Sicherheitscheck: Storage-Buckets müssen öffentlich sein, sonst brechen Bild-URLs.
--    Schlägt dieser Block fehl, wird NICHTS geändert. Dann zuerst den Bucket im
--    Dashboard auf „Public“ stellen (Storage → Bucket → Edit) und neu starten.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from storage.buckets
    where id in ('blog-images', 'sponsor-logos') and public = false
  ) then
    raise exception 'Storage-Bucket blog-images oder sponsor-logos ist nicht öffentlich. Migration abgebrochen.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1. newsletter_subscribers: hatte KEIN RLS. Jeder mit dem anon-Key konnte alle
--    E-Mail-Adressen auslesen. Jetzt: nur Admins lesen, nur der Server schreibt.
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Admins read newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins read newsletter subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

-- Bewusst KEINE insert/update/delete-Policy: Anmeldungen laufen über den Server
-- (Service-Role). Ein direkter Schreibzugriff von aussen ist damit gesperrt.

-- ---------------------------------------------------------------------------
-- 2. Tabellenrechte für die anonyme Rolle entziehen (Verteidigung in der Tiefe,
--    zusätzlich zu RLS). Die Website nutzt anon nicht für Datenzugriffe.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- Neue Tabellen sollen ebenfalls nicht automatisch für anon offen sein.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- ---------------------------------------------------------------------------
-- 3. Storage: Bilder bleiben über ihre öffentliche URL erreichbar (öffentlicher Bucket),
--    aber niemand kann mehr ALLE Dateien eines Buckets per API auflisten.
--    Upload bleibt nur für Admins (Policies aus 003).
-- ---------------------------------------------------------------------------
drop policy if exists "Public read blog images" on storage.objects;
drop policy if exists "Public read sponsor logos" on storage.objects;

-- ---------------------------------------------------------------------------
-- 4. Kontrolle: Alle Tabellen im Schema public sollten rowsecurity = true zeigen.
--    Ausgabe ansehen; jede Zeile mit false ist ein Risiko.
-- ---------------------------------------------------------------------------
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
