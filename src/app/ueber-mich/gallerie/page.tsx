import { GalleryGrid } from "@/components/gallery-grid";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { Reveal } from "@/components/motion/reveal";
import { socialProfiles } from "@/content/socialProfiles";
import {
  aboutGalleryAltFromFilename,
  aboutGalleryImageSrc,
  listAboutGalleryFilenames,
} from "@/lib/about-gallery-images";
import { uebermichGallerieMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { ueberMichChildBreadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/webpage-jsonld";
import "@/styles/pages/gallery.css";

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
        <section className="mg-section mg-section--tight mg-gallery-page" aria-labelledby="gallery-title">
          <div className="mg-container">
            <Reveal as="header" y={20} className="mg-section-head mg-section-head--split mg-gallery-page__head">
              <div className="mg-gallery-page__intro">
                <p className="mg-eyebrow">Impressionen</p>
                <h2 id="gallery-title" className="mg-h3 mg-gallery-page__title">
                  Bilder von Tour, Training und Events
                </h2>
                <p className="mg-body mg-gallery-page__lead">
                  Antippen zum Vergrössern — mit den Pfeiltasten blätterst du durch die Sammlung.
                </p>
              </div>
              {files.length > 0 ? (
                <p className="mg-gallery-page__count">
                  <span className="mg-gallery-page__count-num">{files.length}</span>
                  <span className="mg-gallery-page__count-label">{files.length === 1 ? "Bild" : "Bilder"}</span>
                </p>
              ) : null}
            </Reveal>

            {files.length === 0 ? (
              <div className="mg-gallery-page__empty" role="status">
                <p className="mg-gallery-page__empty-title">Die ersten Bilder folgen bald.</p>
                <p className="mg-gallery-page__empty-text">
                  Die Saison läuft — schau wieder vorbei oder folge mir auf{" "}
                  <a href={socialProfiles.instagram.url} target="_blank" rel="noopener noreferrer">
                    Instagram
                    <span className="mg-sr-only"> (öffnet in neuem Tab)</span>
                  </a>{" "}
                  für die neusten Eindrücke.
                </p>
                {process.env.NODE_ENV !== "production" ? (
                  <p className="mg-gallery-page__empty-hint">
                    Bilder ablegen in <code>public/brand-assets/gallerie</code> (JPG, PNG, WebP, GIF, AVIF)
                  </p>
                ) : null}
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
