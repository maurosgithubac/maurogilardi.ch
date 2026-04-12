import Image from "next/image";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import {
  aboutGalleryAltFromFilename,
  aboutGalleryImageSrc,
  listAboutGalleryFilenames,
} from "@/lib/about-gallery-images";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerie | Mauro Gilardi",
  description: "Impressionen von der Tour, Training und Events — Bilder aus meinem Alltag als Profigolfer.",
};

export default async function UeberMichGalleriePage() {
  const files = await listAboutGalleryFilenames();

  return (
    <AboutSubpageShell
      label="Über mich"
      title="Galerie"
      lead="Einblicke in Turniere, Training und Momente neben dem Platz — die Sammlung wächst mit der Saison."
      heroSrc="/brand-assets/images/mauro&friends-9.jpg"
      heroAlt="Mauro Gilardi auf dem Golfplatz"
    >
      <section className="about-gallery-page" aria-labelledby="about-gallery-title">
        <div className="about-gallery-inner">
          <header className="about-gallery-header">
            <p className="about-gallery-kicker">Impressionen</p>
            <h2 id="about-gallery-title">Bilder</h2>
            <p className="about-gallery-lead">
              Die Sammlung wird ergänzt, sobald neue Motive dazukommen — sortiert nach Dateiname.
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
            <ul className="about-gallery-grid">
              {files.map((file) => {
                const src = aboutGalleryImageSrc(file);
                const alt = aboutGalleryAltFromFilename(file);
                return (
                  <li key={file} className="about-gallery-item">
                    <figure className="about-gallery-figure">
                      <div className="about-gallery-aspect">
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 33vw"
                          className="about-gallery-img"
                        />
                      </div>
                    </figure>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </AboutSubpageShell>
  );
}
