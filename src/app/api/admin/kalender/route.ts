import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { geocodeLocation, KALENDER_TAG, parseKalenderInput } from "@/lib/kalender-events";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

/** Neuen Termin anlegen. Ohne Koordinaten wird der Ort automatisch gesucht. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const parsed = parseKalenderInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { needsGeocode, ...value } = parsed.value;
  if (needsGeocode) {
    const found = await geocodeLocation(value.location, value.country);
    if (found) {
      value.lat = found.lat;
      value.lon = found.lon;
    }
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("kalender_events").insert(value).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag(KALENDER_TAG, "max");
  revalidatePath("/kalender");
  return NextResponse.json({
    id: data.id,
    geocoded: value.lat != null && value.lon != null,
  });
}
