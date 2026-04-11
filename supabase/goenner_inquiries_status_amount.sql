-- Run once in Supabase SQL Editor if goenner_inquiries exists without Status/Betrag.
-- Danach: Anfragen in /admin/goenner als erledigt markieren inkl. CHF-Betrag.

alter table public.goenner_inquiries add column if not exists status text default 'open';
alter table public.goenner_inquiries add column if not exists completed_at timestamptz;
alter table public.goenner_inquiries add column if not exists amount_chf numeric(10, 2);

update public.goenner_inquiries set status = 'open' where status is null;

alter table public.goenner_inquiries alter column status set default 'open';
alter table public.goenner_inquiries alter column status set not null;

alter table public.goenner_inquiries drop constraint if exists goenner_inquiries_status_check;
alter table public.goenner_inquiries
  add constraint goenner_inquiries_status_check check (status in ('open', 'completed'));

drop policy if exists "Admins update goenner inquiries" on public.goenner_inquiries;
create policy "Admins update goenner inquiries"
  on public.goenner_inquiries for update
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );
