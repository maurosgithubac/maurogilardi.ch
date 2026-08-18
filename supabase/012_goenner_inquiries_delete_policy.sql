-- 012_goenner_inquiries_delete_policy.sql
-- Allows admins to delete inbox inquiries (tests / fake signups) from the portal.

drop policy if exists "Admins delete goenner inquiries" on public.goenner_inquiries;
create policy "Admins delete goenner inquiries"
  on public.goenner_inquiries for delete
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );
