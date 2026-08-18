import { redirect } from "next/navigation";

/** Partner-Logos werden im Repo gepflegt (`sponsorsSite.ts`), nicht mehr im Admin. */
export default function AdminSponsorsRedirectPage() {
  redirect("/admin");
}
