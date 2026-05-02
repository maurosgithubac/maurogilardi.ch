import type { Metadata } from "next";
import { GoennerPageClient } from "@/components/goenner-page-client";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { sponsoringMetadataSeo, sponsoringSchema } from "@/lib/seo/page-metadata";

export const metadata: Metadata = sponsoringMetadataSeo;

export default function SponsoringPage() {
  return (
    <>
      <SeoPageJsonLd schema={sponsoringSchema} />
      <GoennerPageClient />
    </>
  );
}
