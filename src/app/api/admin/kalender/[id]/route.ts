import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { geocodeLocation, KALENDER_TAG, parseKalenderInput } from "@/lib/kalender-events";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

/** Termin ändern. Ist der Ort neu oder fehlen Koordinaten, wird er erneut gesucht. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

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
  const { error } = await supabase
    .from("kalender_events")
    .update({ ...value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag(KALENDER_TAG, "max");
  revalidatePath("/kalender");
  return NextResponse.json({ ok: true, geocoded: value.lat != null && value.lon != null });
}

/** Termin löschen. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("kalender_events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag(KALENDER_TAG, "max");
  revalidatePath("/kalender");
  return NextResponse.json({ ok: true });
}
