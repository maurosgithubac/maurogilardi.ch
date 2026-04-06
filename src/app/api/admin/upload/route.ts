import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { readEnv } from "@/lib/env";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const ALLOWED_BUCKETS = ["blog-images", "sponsor-logos"] as const;

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const bucket = String(formData.get("bucket") || "");
  if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
    return NextResponse.json({ error: "Ungültiger Bucket." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Datei fehlt." }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Max. 8 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
  const path = `${randomUUID()}.${safeExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message || "Upload fehlgeschlagen." }, { status: 500 });
  }

  const base = readEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const publicUrl = `${base}/storage/v1/object/public/${bucket}/${path}`;

  return NextResponse.json({ path, publicUrl, bucket });
}
