import { redirect } from "next/navigation";

/** Blog-Beiträge werden im Repo / via Cursor gepflegt, nicht mehr im Admin. */
export default function AdminPostsRedirectPage() {
  redirect("/admin");
}
