import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { nutzungsbedingungenSections } from "@/content/legal";
import { nutzungsbedingungenMetadata } from "@/lib/seo/page-metadata";
import { simplePageGraph } from "@/lib/seo/webpage-jsonld";

export const metadata = nutzungsbedingungenMetadata;

export default function NutzungsbedingungenPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={simplePageGraph(
          "/nutzungsbedingungen",
          "Nutzungsbedingungen — Mauro Gilardi",
          "Nutzungsbedingungen",
          nutzungsbedingungenMetadata.description ?? "Nutzungsbedingungen für maurogilardi.ch",
        )}
      />
      <LegalPageShell
        title="Nutzungsbedingungen"
        lead="Bedingungen für die Nutzung der Website maurogilardi.ch."
      >
        <LegalDocument sections={nutzungsbedingungenSections} />
      </LegalPageShell>
    </>
  );
}
