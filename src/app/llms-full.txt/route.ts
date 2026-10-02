import { LLMS_HEADERS, buildLlmsFullTxt, loadLlmsPosts } from "@/lib/seo/llms-text";

/** /llms-full.txt — ausführliche Textfassung (Zeitstrahl, FAQ, Blog, Medien) für KI-Systeme */
export const revalidate = 3600;

export async function GET() {
  const posts = await loadLlmsPosts();
  return new Response(buildLlmsFullTxt(posts), { headers: LLMS_HEADERS });
}
