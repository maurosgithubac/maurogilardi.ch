import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { isMissingTableError, parsePrizeMoneyInput, prizeMigrationHint } from "@/lib/prize-money";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "UngÃ¼ltige JSON" }, { status: 400 });
  }

  const input = parsePrizeMoneyInput(body);
  if ("error" in input) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("prize_money").insert(input).select("*").single();

  if (error) {
    return NextResponse.json(
      { error: isMissingTableError(error.message) ? prizeMigrationHint(error.message) : error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ prize: data }, { status: 201 });
}
