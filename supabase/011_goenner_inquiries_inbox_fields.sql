-- 011_goenner_inquiries_inbox_fields.sql
-- Extends inbox: status "exited" + optional admin_note.

alter table public.goenner_inquiries
  add column if not exists admin_note text;

alter table public.goenner_inquiries drop constraint if exists goenner_inquiries_status_check;
alter table public.goenner_inquiries
  add constraint goenner_inquiries_status_check
  check (status in ('open', 'completed', 'exited'));
