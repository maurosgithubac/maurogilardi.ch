import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Die Liste aller Gönner, Sponsoren und Partner steht auf der Übersicht. */
export default async function AdminGoennerMembersRedirect({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const key of ["status", "year", "bereich"]) {
    const v = sp[key];
    if (typeof v === "string" && v) qs.set(key, v);
  }
  redirect(`/admin${qs.size ? `?${qs.toString()}` : ""}#liste`);
}
