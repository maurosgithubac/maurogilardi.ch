import { MediaPressExplorer } from "@/components/media-press-explorer";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { enrichAndSortPressItems, pressOutlets } from "@/content/media-press";

export const metadata = {
  title: "In den Medien | Mauro Gilardi",
  description:
    "Berichte, Interviews und Artikel über Mauro Gilardi — Swiss Golf, Golf.ch, Pro Golf Tour, Regionalmedien und mehr.",
};

export default function UeberMichMediaPage() {
  const items = enrichAndSortPressItems();

  return (
    <AboutSubpageShell
      label="Über mich"
      title="In den Medien"
      lead="Presse, Portale und Tour-Seiten — durchsuchbar nach Quelle. Ich ergänze die Liste, sobald neue Berichte erscheinen."
      heroSrc="/brand-assets/images/195.png"
      heroAlt="Mauro Gilardi im Turnier"
    >
      <section className="about-media-page" aria-label="Medienberichte und externe Artikel">
        <div className="about-media-page-inner">
          <header className="about-media-page-header">
            <p className="about-media-page-kicker">Presse & Portale</p>
            <h2 className="about-media-page-title">Berichte, Profile, Turnierseiten</h2>
            <p className="about-media-page-lead">
              Verifizierbare Links zu{" "}
              <strong>Swiss Golf</strong>, <strong>Golf.ch</strong>, <strong>Golf.de</strong>,{" "}
              <strong>Südostschweiz</strong>, <strong>Pro Golf Tour</strong>,{" "}
              <strong>Swiss PGA</strong>, <strong>Friends of Swiss Golf Talents</strong> und weiteren
              Quellen. Die <strong>Challenge Tour</strong> bzw. <strong>HotelPlanner Tour</strong> werden
              vor allem über Swiss Golf und Golf.ch begleitet; die Tour-Websites fokussieren auf
              Startlisten und Scoring.
            </p>
          </header>

          <MediaPressExplorer items={items} outlets={pressOutlets} />
        </div>
      </section>
    </AboutSubpageShell>
  );
}
