import Image from "next/image";
import Link from "next/link";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { equipmentBag, equipmentTheGolfersMalans } from "@/content/equipment";

export const metadata = {
  title: "Mein Bag | Mauro Gilardi",
  description: "Mein Bag: Schläger von Driver bis Putter — und wo ich mich beraten lasse.",
};

export default function UeberMichEquipmentPage() {
  return (
    <AboutSubpageShell
      label="Über mich"
      title="Mein Bag"
      lead="Was ich im Spiel dabei habe — und bei wem ich fitten gehe."
      heroSrc="/brand-assets/images/mauro&friends-8.jpg"
      heroAlt="Mauro Gilardi mit Team"
      heroBgClassName="about-hero-bg--focus-top"
    >
      <section className="about-equipment-page" aria-label="Equipment im Bag">
        <div className="about-equipment-page-inner about-equipment-page-inner--stream">
          <div className="about-equipment-slider-block">
            <div className="about-equipment-slider-head">
              <h2 className="about-equipment-slider-title">Im Bag</h2>
              <p className="about-equipment-slider-dek">
                Von Driver bis Putter — einfach seitlich weiterwischen oder scrollen.
              </p>
            </div>
            <ul className="about-equipment-bag-slider" aria-label="Schläger im Bag, horizontal scrollbar">
              {equipmentBag.map((item) => (
                <li key={item.id} className="about-equipment-bag-slide">
                  <div className="about-equipment-bag-slide-card">
                    <div className="about-equipment-bag-photo about-equipment-bag-photo--slide">
                      {item.imageSrc ? (
                        <Image
                          src={item.imageSrc}
                          alt={item.slot}
                          fill
                          className="about-equipment-bag-img"
                          sizes="(max-width: 680px) 72vw, (max-width: 1100px) 32vw, 320px"
                        />
                      ) : (
                        <span className="about-equipment-bag-placeholder">Foto folgt</span>
                      )}
                    </div>
                    <div className="about-equipment-bag-copy about-equipment-bag-copy--slide">
                      <span className="about-equipment-bag-slot">{item.slot}</span>
                      <p className="about-equipment-bag-head">{item.head}</p>
                      {item.shaft ? <p className="about-equipment-bag-shaft">{item.shaft}</p> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-equipment-fitter-block">
            <div className="about-equipment-fitter-layout">
              <div className="about-equipment-fitter-copy">
                <p className="about-equipment-fitter-kicker">{equipmentTheGolfersMalans.kicker}</p>
                {equipmentTheGolfersMalans.paragraphs.map((p, i) => (
                  <p key={`equipment-fitter-${i}`} className="about-equipment-fitter-body">
                    {p}
                  </p>
                ))}
                <a
                  href={equipmentTheGolfersMalans.websiteHref}
                  className="about-equipment-fitter-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {equipmentTheGolfersMalans.websiteLabel}
                </a>
              </div>
              <div className="about-equipment-fitter-media">
                <div className="about-equipment-fitter-frame">
                  <Image
                    src={equipmentTheGolfersMalans.imageSrc}
                    alt={equipmentTheGolfersMalans.imageAlt}
                    fill
                    className="about-equipment-fitter-img"
                    sizes="(max-width: 767px) 100vw, 42vw"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="about-equipment-footnote">
            Stand wie hier — nach Saison und Testing kann sich was ändern.{" "}
            <Link href="/ueber-mich/sponsoren">Zu meinen Sponsoren</Link>
          </p>
        </div>
      </section>
    </AboutSubpageShell>
  );
}
