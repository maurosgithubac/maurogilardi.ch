import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { goennerBedingungenSections } from "@/content/legal";
import { goennerBedingungenMetadata } from "@/lib/seo/page-metadata";
import { simplePageGraph } from "@/lib/seo/webpage-jsonld";

export const metadata = goennerBedingungenMetadata;

export default function GoennerBedingungenPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={simplePageGraph(
          "/goenner-bedingungen",
          "Gönner-Bedingungen — Mauro Gilardi",
          "Gönner-Bedingungen",
          goennerBedingungenMetadata.description ?? "Gönner-, Partner- und 100er-Club-Bedingungen",
        )}
      />
      <LegalPageShell
        title="Gönner-Bedingungen"
        lead="Bedingungen für Gönner, Partner und Mitglieder des 100er Clubs."
      >
        <LegalDocument sections={goennerBedingungenSections} />
      </LegalPageShell>
    </>
  );
}
