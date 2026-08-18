-- 009_goenner_inquiries_membership_hundert.sql
-- 100er Club (membership_id = 'hundert') for existing tables.
-- Fresh installs: 004_goenner_inquiries.sql already includes the full check list.

alter table public.goenner_inquiries drop constraint if exists goenner_inquiries_membership_id_check;

alter table public.goenner_inquiries
  add constraint goenner_inquiries_membership_id_check
  check (membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring'));
