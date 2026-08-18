-- 005_goenner_inquiries_add_address.sql
-- Run once if goenner_inquiries already exists without address columns (after 004).

alter table public.goenner_inquiries add column if not exists street text;
alter table public.goenner_inquiries add column if not exists postal_code text;
alter table public.goenner_inquiries add column if not exists city text;
