import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { isMissingTableError, parsePrizeMoneyInput, prizeMigrationHint } from "@/lib/prize-money";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

type Context = { params: Promise<{ id: string }> };

async function readId(context: Context) {
  const { id } = await context.params;
  return id && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = await readId(context);
  if (!id) return NextResponse.json({ error: "UngÃ¼ltige ID." }, { status: 400 });

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
  const { data, error } = await supabase
    .from("prize_money")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: isMissingTableError(error.message) ? prizeMigrationHint(error.message) : error.message },
      { status: 500 },
    );
  }
  if (!data) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  return NextResponse.json({ prize: data });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = await readId(context);
  if (!id) return NextResponse.json({ error: "UngÃ¼ltige ID." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("prize_money").delete().eq("id", id).select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
