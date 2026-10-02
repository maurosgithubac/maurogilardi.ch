import { LLMS_HEADERS, buildLlmsTxt } from "@/lib/seo/llms-text";

/** /llms.txt — Kurzprofil für KI-Suchmaschinen (https://llmstxt.org) */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(buildLlmsTxt(), { headers: LLMS_HEADERS });
}
