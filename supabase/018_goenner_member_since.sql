-- 018_goenner_member_since.sql
-- Eintrittsdatum pro Gönner / Sponsor / Partner («Mitglied seit»).
-- Additiv: bestehende Einträge bleiben unverändert (null = unbekannt).
-- Setzt 017_goenner_sponsors_partners.sql voraus. Im Supabase SQL Editor ausführen.

alter table public.goenner_members
  add column if not exists member_since date;
