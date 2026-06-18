import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { impressumSections } from "@/content/legal";
import { impressumMetadata } from "@/lib/seo/page-metadata";
import { webPageJsonLd } from "@/lib/seo/webpage-jsonld";

export const metadata = impressumMetadata;

export default function ImpressumPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={webPageJsonLd({
          path: "/impressum",
          name: "Impressum — Mauro Gilardi",
          description: impressumMetadata.description ?? "Impressum und Kontakt zu maurogilardi.ch",
        })}
      />
      <LegalPageShell
        title="Impressum"
        lead="Angaben gemäss schweizerischer Transparenzpflicht für maurogilardi.ch."
      >
        <LegalDocument sections={impressumSections} />
      </LegalPageShell>
    </>
  );
}
