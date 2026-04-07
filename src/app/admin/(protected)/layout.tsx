import { redirect } from "next/navigation";
import { AdminTabNav } from "@/components/admin-tab-nav";
import { isAdminSession } from "@/lib/admin-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-app site-page">
      <SiteHeader variant="document" />
      <AdminTabNav />
      <div className="admin-body">{children}</div>
      <SiteFooter />
    </div>
  );
}
