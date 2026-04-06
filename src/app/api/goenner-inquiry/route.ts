import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { MembershipId } from "@/content/goennerMemberships";

const ALLOWED: MembershipId[] = ["birdie", "eagle", "albatros"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Body = {
  membership_id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  message?: string | null;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const membership_id = String(body.membership_id || "").trim() as MembershipId;
  if (!ALLOWED.includes(membership_id)) {
    return NextResponse.json({ error: "Bitte wähle eine Mitgliedschaft." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (name.length < 2 || name.length > 200) {
    return NextResponse.json({ error: "Bitte gib einen gültigen Namen ein." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail ein." }, { status: 400 });
  }

  const phone = body.phone != null ? String(body.phone).trim().slice(0, 80) : null;
  const message = body.message != null ? String(body.message).trim().slice(0, 4000) : null;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("goenner_inquiries").insert({
      membership_id,
      name,
      email,
      phone: phone || null,
      message: message || null,
    });

    if (error) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Vielen Dank! Ich melde mich bei dir." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Server-Konfiguration für Supabase fehlt." },
      { status: 500 },
    );
  }
}
