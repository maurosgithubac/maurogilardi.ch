import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminSession } from "@/lib/admin-auth";
import { loadInboxCounts } from "@/lib/admin-inbox";
import { loadUpcomingEvents } from "@/lib/kalender-upcoming";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const [inbox, upcoming] = await Promise.all([
    createSupabaseUserServerClient().then(loadInboxCounts),
    loadUpcomingEvents(1),
  ]);

  return (
    <div className="admin-app">
      <AdminShell inbox={inbox} next={upcoming[0] ?? null}>
        {children}
      </AdminShell>
    </div>
  );
}
