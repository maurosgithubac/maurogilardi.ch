-- 016_goenner_annual_amount.sql
-- Vereinbarter Jahresbeitrag pro Gönner + Stufe "Unterstützungsbeitrag".
-- Additiv: bestehende Mitglieder/Zahlungen bleiben unverändert.
-- Setzt 010_goenner_finance.sql voraus. Im Supabase SQL Editor ausführen.

-- 1) Jahresbetrag (CHF), der beim "Als bezahlt markieren" pro Jahr verbucht wird.
--    null = Listenpreis der Stufe verwenden.
alter table public.goenner_members
  add column if not exists annual_amount_chf numeric(10, 2)
    check (annual_amount_chf is null or (annual_amount_chf >= 0 and annual_amount_chf <= 1000000));

-- 2) Stufe "unterstuetzung" (Unterstützungsbeitrag) zulassen — Mitglieder und Zahlungen.
alter table public.goenner_members
  drop constraint if exists goenner_members_membership_id_check;
alter table public.goenner_members
  add constraint goenner_members_membership_id_check
    check (membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring', 'unterstuetzung'));

alter table public.goenner_payments
  drop constraint if exists goenner_payments_membership_id_check;
alter table public.goenner_payments
  add constraint goenner_payments_membership_id_check
    check (membership_id is null or membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring', 'unterstuetzung'));
