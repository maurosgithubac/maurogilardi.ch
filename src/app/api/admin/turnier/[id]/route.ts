import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const UUID = /^[0-9a-f-]{36}$/i;

function text(raw: unknown, max: number) {
  const value = String(raw ?? "").trim();
  return value ? value.slice(0, max) : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ("title" in body) {
    const title = text(body.title, 120);
    if (!title || title.length < 2) return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });
    patch.title = title;
  }
  if ("event_date" in body) {
    const date = String(body.event_date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Datum fehlt." }, { status: 400 });
    patch.event_date = date;
  }
  if ("place" in body) patch.place = text(body.place, 120) || "Domat/Ems";
  if ("clinic_time" in body) patch.clinic_time = text(body.clinic_time, 40) || "Vormittag";
  if ("first_flight_time" in body) patch.first_flight_time = text(body.first_flight_time, 40) || "12:00";
  if ("dinner_time" in body) patch.dinner_time = text(body.dinner_time, 40) || "18:30";
  if ("intro" in body) patch.intro = text(body.intro, 2000);
  if ("status" in body) {
    if (body.status !== "open" && body.status !== "closed") {
      return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
    }
    patch.status = body.status;
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("tournaments").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Turnier nicht gefunden." }, { status: 404 });
  return NextResponse.json({ tournament: data });
}
