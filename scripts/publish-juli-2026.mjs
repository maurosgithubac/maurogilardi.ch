/**
 * Veröffentlicht «juli-2026» in Supabase (UPSERT slug).
 * created_at = 31.07.2026 12:00 Europe/Zurich.
 * node --env-file=.env.local scripts/publish-juli-2026.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadPostFromTs() {
  const src = fs.readFileSync(path.join(process.cwd(), "src/content/juli-2026-post.ts"), "utf8");
  const slug = src.match(/JULI_2026_SLUG = "([^"]+)"/)?.[1];
  const created_at = src.match(/JULI_2026_CREATED_AT = "([^"]+)"/)?.[1];
  const title = src.match(/title: "([^"]+)"/)?.[1];
  const description = src.match(/description:\s*\n\s*"([^"]+)"/)?.[1];
  const body = src.split("body: `")[1]?.split("`\n  image_path")[0];
  const image_path = src.match(/image_path: "([^"]+)"/)?.[1];
  if (!slug || !created_at || !title || !description || !body || !image_path) {
    throw new Error("juli-2026-post.ts konnte nicht gelesen werden.");
  }
  return {
    slug,
    title,
    description,
    body,
    image_path,
    published: true,
    created_at,
  };
}

const row = loadPostFromTs();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Fehlendes NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY (z.B. aus .env.local).");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { error } = await sb.from("posts").upsert(row, { onConflict: "slug" });

if (error) {
  console.error("Supabase Upsert failed:", error.message);
  process.exit(1);
}

console.log(`OK — live seit ${row.created_at}: https://www.maurogilardi.ch/blog/${row.slug}`);
