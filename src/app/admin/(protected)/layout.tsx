import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminSession } from "@/lib/admin-auth";
import { loadInboxCounts } from "@/lib/admin-inbox";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const inbox = await loadInboxCounts(await createSupabaseUserServerClient());

  return (
    <div className="admin-app">
      <AdminShell inbox={inbox}>{children}</AdminShell>
    </div>
  );
}
