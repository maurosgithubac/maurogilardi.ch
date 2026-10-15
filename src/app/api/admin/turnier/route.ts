import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function text(raw: unknown, max: number, fallback: string) {
  const value = String(raw ?? "").trim();
  if (!value) return fallback;
  return value.slice(0, max);
}

function dateOrNull(raw: unknown) {
  const value = String(raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const event_date = dateOrNull(body.event_date);
  if (!event_date) return NextResponse.json({ error: "Datum fehlt." }, { status: 400 });
  const title = text(body.title, 120, "");
  if (title.length < 2) return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      title,
      event_date,
      place: text(body.place, 120, "Domat/Ems"),
      clinic_time: text(body.clinic_time, 40, "Vormittag"),
      first_flight_time: text(body.first_flight_time, 40, "12:00"),
      dinner_time: text(body.dinner_time, 40, "18:30"),
      intro: String(body.intro ?? "").trim().slice(0, 2000) || null,
      status: "open",
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    const missing = /does not exist|schema cache|Could not find/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "Tabelle fehlt — supabase/023_tournament.sql in Supabase ausführen." : error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ tournament: data }, { status: 201 });
}
