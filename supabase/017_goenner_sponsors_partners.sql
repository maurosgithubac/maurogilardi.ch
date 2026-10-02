-- 017_goenner_sponsors_partners.sql
-- Sponsoren und Partner neben Gönnern: Kategorie, Art der Leistung, Organisation.
-- Additiv: bestehende Einträge bleiben Gönner mit Geldbeitrag.
-- Setzt 016_goenner_annual_amount.sql voraus. Im Supabase SQL Editor ausführen.

alter table public.goenner_members
  add column if not exists category text not null default 'goenner'
    check (category in ('goenner', 'sponsor', 'partner'));

-- geld = Geldbeitrag, praemie = Prämien, spesen = Spesengelder,
-- material = Material/Leistungen ohne Geld, verband = Verbandsbeitrag (z. B. Investitionen, 0-Rechnung)
alter table public.goenner_members
  add column if not exists contribution_type text not null default 'geld'
    check (contribution_type in ('geld', 'praemie', 'spesen', 'material', 'verband'));

alter table public.goenner_members
  add column if not exists organization text;

create index if not exists goenner_members_category_idx on public.goenner_members (category);

-- Stufe "partner" (Partner mit Material-/Sachleistung) zulassen
alter table public.goenner_members
  drop constraint if exists goenner_members_membership_id_check;
alter table public.goenner_members
  add constraint goenner_members_membership_id_check
    check (membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring', 'unterstuetzung', 'partner'));

alter table public.goenner_payments
  drop constraint if exists goenner_payments_membership_id_check;
alter table public.goenner_payments
  add constraint goenner_payments_membership_id_check
    check (membership_id is null or membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring', 'unterstuetzung', 'partner'));
