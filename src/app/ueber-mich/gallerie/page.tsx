import { GalleryGrid } from "@/components/gallery-grid";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import {
  aboutGalleryAltFromFilename,
  aboutGalleryImageSrc,
  listAboutGalleryFilenames,
} from "@/lib/about-gallery-images";
import { uebermichGallerieMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { ueberMichChildBreadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/webpage-jsonld";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/ueber-mich/gallerie";

const GALLERY_DESCRIPTION =
  "Impressionen von der Tour, Training und Events — Bilder aus meinem Alltag als Profigolfer.";

export const metadata = uebermichGallerieMetadata;

export default async function UeberMichGalleriePage() {
  const files = await listAboutGalleryFilenames();

  return (
    <>
      <SeoPageJsonLd
        schema={[
          webPageJsonLd({ path: PAGE_PATH, name: "Galerie – Impressionen", description: GALLERY_DESCRIPTION }),
          ueberMichChildBreadcrumbJsonLd("Galerie", PAGE_PATH),
        ]}
      />
      <AboutSubpageShell
      label="Über mich"
      title="Galerie"
      lead="Einblicke in Turniere, Training und Momente neben dem Platz — die Sammlung wächst mit der Saison."
      heroSrc={seoImages.golfEvent}
      heroAlt={seoImageAlts.golfEvent}
    >
      <section className="about-gallery-page" aria-labelledby="about-gallery-title">
        <div className="about-gallery-inner">
          <header className="about-gallery-header">
            <p className="about-gallery-kicker">Impressionen</p>
            <h2 id="about-gallery-title">Bilder</h2>
            <p className="about-gallery-lead">
              Antippen zum Vergrössern — mit den Pfeiltasten blätterst du durch die Sammlung.
            </p>
          </header>

          {files.length === 0 ? (
            <div className="about-gallery-empty">
              <p>Noch keine Bilder in der Galerie.</p>
              <p className="about-gallery-empty-hint">
                Bilder ablegen in{" "}
                <code className="about-gallery-code">public/brand-assets/gallerie</code>
                <span className="about-gallery-empty-formats"> (JPG, PNG, WebP, GIF, AVIF)</span>
              </p>
            </div>
          ) : (
            <GalleryGrid
              items={files.map((file) => ({ src: aboutGalleryImageSrc(file), alt: aboutGalleryAltFromFilename(file) }))}
            />
          )}
        </div>
      </section>
    </AboutSubpageShell>
    </>
  );
}
