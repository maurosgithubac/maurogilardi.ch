"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@/components/admin/admin-icons";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" className="ap-nav-item ap-nav-item--quiet" onClick={logout}>
      <span className="ap-nav-icon">
        <IconLogout />
      </span>
      <span className="ap-nav-label">Abmelden</span>
    </button>
  );
}
