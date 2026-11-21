import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { parseFlexInput, renderFlexInvoiceHtml } from "@/lib/flex-invoice";

/** Vorschau als HTML, wird im Admin direkt angezeigt. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const parsed = parseFlexInput(body, true);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    return NextResponse.json({ html: await renderFlexInvoiceHtml(parsed.value) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Vorschau fehlgeschlagen." }, { status: 500 });
  }
}
