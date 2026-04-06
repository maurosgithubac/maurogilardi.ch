import { redirect } from "next/navigation";
import { AdminTabNav } from "@/components/admin-tab-nav";
import { isAdminSession } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-app">
      <AdminTabNav />
      <div className="admin-body">{children}</div>
    </div>
  );
}
