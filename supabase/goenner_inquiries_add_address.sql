-- Run once in Supabase SQL Editor if goenner_inquiries already exists without address columns.

alter table public.goenner_inquiries add column if not exists street text;
alter table public.goenner_inquiries add column if not exists postal_code text;
alter table public.goenner_inquiries add column if not exists city text;
