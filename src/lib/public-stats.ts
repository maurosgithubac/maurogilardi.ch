/**
 * Öffentliche Kennzahlen aus dem Admin-Portal (nur Server-Komponenten).
 * Liest ausschliesslich Anzahlen und Summen — nie Namen oder Kontaktdaten.
 */
import { goennervereinigungMemberNames } from "@/content/goennervereinigungMembers";
import { expectedAnnualChf, type GoennerMemberRow } from "@/lib/goenner-finance";

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

/**
 * Getragene Jahresbeiträge: Summe der vereinbarten Beiträge aller aktiven Gönner und Sponsoren
 * (Material-Partner zählen nicht). Liest nur Beträge/Stufen, keine Personendaten.
 */
export async function getCommittedAnnualChf(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/goenner_members?select=annual_amount_chf,membership_id,contribution_type&active=is.true&category=in.(goenner,sponsor)`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Pick<GoennerMemberRow, "annual_amount_chf" | "membership_id" | "contribution_type">[];
    return rows.reduce((sum, r) => sum + expectedAnnualChf(r), 0);
  } catch {
    return null;
  }
}
