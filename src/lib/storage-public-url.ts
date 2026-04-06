import { readEnvOptional } from "@/lib/env";

function base(): string {
  return readEnvOptional("NEXT_PUBLIC_SUPABASE_URL")?.replace(/\/$/, "") || "";
}

export function blogImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const b = base();
  if (!b) return null;
  return `${b}/storage/v1/object/public/blog-images/${path}`;
}

export function sponsorLogoUrl(path: string): string {
  const b = base();
  if (!b) return "";
  return `${b}/storage/v1/object/public/sponsor-logos/${path}`;
}
