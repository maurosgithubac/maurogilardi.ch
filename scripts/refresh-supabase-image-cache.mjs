/**
 * Re-apply long Cache-Control on existing Supabase Storage objects
 * (blog-images + sponsor-logos) by downloading + upserting in place.
 *
 * UUID filenames stay the same; CDN may take up to ~60s to propagate.
 *
 * Usage: node --env-file=.env.local scripts/refresh-supabase-image-cache.mjs
 */
import { createClient } from "@supabase/supabase-js";

const CACHE_CONTROL_SECONDS = "2678400"; // 31 days
const BUCKETS = ["blog-images", "sponsor-logos"];
const PAGE_SIZE = 100;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listAll(bucket) {
  const files = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      // Skip folder placeholders
      if (item.id == null && !item.metadata) continue;
      if (item.name) files.push(item.name);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return files;
}

async function refreshObject(bucket, objectPath) {
  const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(objectPath);
  if (downloadError || !blob) {
    throw downloadError || new Error("download failed");
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const contentType = blob.type || "application/octet-stream";

  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType,
    cacheControl: CACHE_CONTROL_SECONDS,
    upsert: true,
  });
  if (uploadError) throw uploadError;
}

let updated = 0;
let failed = 0;

for (const bucket of BUCKETS) {
  console.log(`Bucket: ${bucket}`);
  let names;
  try {
    names = await listAll(bucket);
  } catch (error) {
    console.error(`  list failed:`, error.message || error);
    failed += 1;
    continue;
  }

  console.log(`  objects: ${names.length}`);
  for (const name of names) {
    try {
      await refreshObject(bucket, name);
      updated += 1;
      console.log(`  ✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${name}:`, error.message || error);
    }
  }
}

console.log("---");
console.log(`Updated: ${updated}, Failed: ${failed}`);
