-- Run once in Supabase SQL Editor: Sponsoring-Option (membership_id = 'sponsoring') für bestehende Tabellen.
-- Neuinstallationen: goenner_inquiries.sql enthält die erweiterte check-Liste bereits.

alter table public.goenner_inquiries drop constraint if exists goenner_inquiries_membership_id_check;

alter table public.goenner_inquiries
  add constraint goenner_inquiries_membership_id_check
  check (membership_id in ('birdie', 'eagle', 'albatros', 'sponsoring'));
