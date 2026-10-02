/** Root Structured Data — ein `@graph` mit Person, WebSite und verbundenen Organisationen */

import { buildRootGraph } from "@/lib/seo/person-jsonld";
import { serializeJsonLd } from "@/components/seo-page-json-ld";

export function SeoRootJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildRootGraph()) }} />;
}
