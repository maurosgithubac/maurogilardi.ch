import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { datenschutzSections } from "@/content/legal";
import { datenschutzMetadata } from "@/lib/seo/page-metadata";
import { webPageJsonLd } from "@/lib/seo/webpage-jsonld";

export const metadata = datenschutzMetadata;

export default function DatenschutzPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={webPageJsonLd({
          path: "/datenschutz",
          name: "Datenschutz — Mauro Gilardi",
          description: datenschutzMetadata.description ?? "Datenschutzerklärung für maurogilardi.ch",
        })}
      />
      <LegalPageShell
        title="Datenschutz"
        lead="Informationen zur Verarbeitung personenbezogener Daten und zu Cookies auf maurogilardi.ch."
      >
        <LegalDocument sections={datenschutzSections} />
      </LegalPageShell>
    </>
  );
}
