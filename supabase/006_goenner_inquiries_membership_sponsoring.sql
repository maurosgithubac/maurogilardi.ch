-- 006_goenner_inquiries_membership_sponsoring.sql
-- Sponsoring option (membership_id = 'sponsoring') for existing tables.
-- Fresh installs: 004_goenner_inquiries.sql already includes the full check list.

alter table public.goenner_inquiries drop constraint if exists goenner_inquiries_membership_id_check;

alter table public.goenner_inquiries
  add constraint goenner_inquiries_membership_id_check
  check (membership_id in ('birdie', 'eagle', 'albatros', 'sponsoring'));
