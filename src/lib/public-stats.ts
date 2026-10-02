/**
 * Öffentliche Kennzahlen aus dem Admin-Portal (nur Server-Komponenten).
 * Liest ausschliesslich Anzahlen — nie Namen oder Kontaktdaten.
 */
import { goennervereinigungMemberNames } from "@/content/goennervereinigungMembers";

const FALLBACK_SUPPORTERS = goennervereinigungMemberNames.filter((n) => n.trim()).length;

async function countMembers(filter: string): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/goenner_members?select=id&${filter}`, {
      method: "HEAD",
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
      // Kennzahl darf kurz gecacht sein — die Seiten revalidieren stündlich
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const total = res.headers.get("content-range")?.split("/")[1];
    const n = total ? Number(total) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Aktive Gönnerinnen und Gönner (Kategorie Gönner, ohne Sponsoren/Partner) laut Admin-Portal */
export async function getSupporterCount(): Promise<number> {
  return (await countMembers("active=is.true&category=eq.goenner")) ?? FALLBACK_SUPPORTERS;
}

/** Aktive Sponsoren und Partner laut Admin-Portal */
export async function getSponsorPartnerCount(): Promise<number | null> {
  return countMembers("active=is.true&category=in.(sponsor,partner)");
}
