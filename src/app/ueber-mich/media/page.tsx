import { MediaPressExplorer } from "@/components/media-press-explorer";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { Reveal } from "@/components/motion/reveal";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { enrichAndSortPressItems, pressOutlets, type PressOutlet } from "@/content/media-press";
import { siteContent } from "@/content/siteContent";
import { uebermichMediaMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { ueberMichChildBreadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/webpage-jsonld";
import "@/styles/pages/media.css";

const PAGE_PATH = "/ueber-mich/media";

const MEDIA_DESCRIPTION =
  "Berichte, Interviews und Artikel über Mauro Gilardi — Swiss Golf, Golf.ch, Pro Golf Tour, Regionalmedien und mehr.";

export const metadata = uebermichMediaMetadata;

export default function UeberMichMediaPage() {
  const items = enrichAndSortPressItems();

  // Alle Quellen als Filter: gepflegte Reihenfolge, fehlende ("Weitere" bleibt am Schluss) ergänzt
  const known = new Set(pressOutlets.map((o) => o.id));
  const extra: PressOutlet[] = [];
  for (const item of items) {
    if (!known.has(item.outletId)) {
      known.add(item.outletId);
      extra.push({ id: item.outletId, label: item.outletLabel, description: "" });
    }
  }
  const weitereIndex = pressOutlets.findIndex((o) => o.id === "weitere");
  const outlets =
    weitereIndex === -1
      ? [...pressOutlets, ...extra]
      : [...pressOutlets.slice(0, weitereIndex), ...extra, ...pressOutlets.slice(weitereIndex)];

  const email = siteContent.contact.email;

  return (
    <>
      <SeoPageJsonLd
        schema={[
          webPageJsonLd({ path: PAGE_PATH, name: "In den Medien – Presse", description: MEDIA_DESCRIPTION }),
          ueberMichChildBreadcrumbJsonLd("Medien", PAGE_PATH),
        ]}
      />
      <AboutSubpageShell
        label="Über mich"
        title="In den Medien"
        lead="Presse, Portale und Tour-Seiten — durchsuchbar nach Quelle. Ich ergänze die Liste, sobald neue Berichte erscheinen."
        heroSrc={seoImages.tournamentAction}
        heroAlt={seoImageAlts.tournamentAction}
      >
        <section className="mg-section mg-section--tight mg-press" aria-labelledby="press-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split mg-press__head">
              <Reveal className="mg-press__head-main">
                <p className="mg-eyebrow">Presse &amp; Portale</p>
                <h2 id="press-title" className="mg-h2">
                  Berichte, Profile, Turnierseiten
                </h2>
              </Reveal>
              <Reveal className="mg-press__head-aside" delay={0.1}>
                <p className="mg-body">
                  Verifizierbare Links — von aktuellen Tour-News bis ins <strong>Amateurlager</strong> (z. B.
                  Team-EM 2020, Q-School 2022, Spitzensport-RS). Quellen: <strong>Swiss Golf</strong>,{" "}
                  <strong>Golf.ch</strong>, <strong>Golf.de</strong>, <strong>Südostschweiz</strong>,{" "}
                  <strong>Pro Golf Tour</strong>, <strong>Swiss PGA</strong>,{" "}
                  <strong>Friends of Swiss Golf Talents</strong>, <strong>EGA</strong>, <strong>OWGR</strong> und
                  mehr. Challenge / HotelPlanner werden vor allem über Swiss Golf und Golf.ch dokumentiert.
                </p>
              </Reveal>
            </header>

            <MediaPressExplorer items={items} outlets={outlets} />
          </div>
        </section>

        <section className="mg-section mg-section--tight mg-press-contact" aria-labelledby="press-contact-title">
          <div className="mg-container">
            <Reveal className="mg-press-contact__panel">
              <div className="mg-press-contact__copy">
                <p className="mg-eyebrow">Pressekontakt</p>
                <h2 id="press-contact-title" className="mg-h3 mg-press-contact__title">
                  Anfragen von Medien
                </h2>
                <p className="mg-body">
                  Für Interviews, Bildmaterial oder einen fehlenden Bericht in dieser Liste: am einfachsten per
                  E-Mail.
                </p>
              </div>
              <div className="mg-press-contact__actions">
                <a href={`mailto:${email}`} className="mg-btn mg-btn--primary mg-press-contact__mail">
                  <span className="mg-press-contact__mail-text">{email}</span>
                  <span className="mg-btn__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </AboutSubpageShell>
    </>
  );
}
