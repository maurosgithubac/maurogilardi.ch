import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { parseFlexInput } from "@/lib/flex-invoice";
import { buildFlexInvoicePdf } from "@/lib/flex-invoice-pdf";

export const maxDuration = 60;

/** PDF herunterladen. Es wird nichts versendet. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const parsed = parseFlexInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const pdf = await buildFlexInvoicePdf(parsed.value);
    const safe = parsed.value.invoiceNumber.replace(/[^\w.-]+/g, "-");
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Rechnung-${safe}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF konnte nicht erstellt werden." }, { status: 500 });
  }
}
