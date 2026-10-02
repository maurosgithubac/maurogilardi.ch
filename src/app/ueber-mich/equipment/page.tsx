import Image from "next/image";
import Link from "next/link";
import { AboutSubpageShell } from "@/components/about-subpage-shell";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { equipmentBag, equipmentTheGolfersMalans, type EquipmentBagItem } from "@/content/equipment";
import { uebermichEquipmentMetadata } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import { ueberMichChildBreadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/webpage-jsonld";
import "@/styles/pages/equipment.css";

const PAGE_PATH = "/ueber-mich/equipment";

const EQUIPMENT_DESCRIPTION = "Mein Bag: Schläger von Driver bis Putter — und wo ich mich beraten lasse.";

export const metadata = uebermichEquipmentMetadata;

type Spec = { label: string; value: string };

/** Zerlegt «Marke Modell · Loft · Bounce» aus dem Inhalt in Marke, Modell und Spec-Zeilen. */
function toSpecSheet(item: EquipmentBagItem) {
  const [name, ...details] = item.head.split("·").map((part) => part.trim());
  const [brand, ...modelWords] = name.split(" ");
  const specs: Spec[] = [];

  for (const detail of details) {
    if (detail.includes("°")) {
      specs.push({ label: "Loft", value: detail });
    } else if (/^bounce\s/i.test(detail)) {
      specs.push({ label: "Bounce", value: detail.replace(/^bounce\s+/i, "") });
    } else {
      specs.push({ label: "Detail", value: detail });
    }
  }

  if (item.shaft) {
    specs.push({ label: item.id === "putter" ? "Ausführung" : "Schaft", value: item.shaft });
  }

  return { brand, model: modelWords.join(" ") || name, specs };
}

const bagBrands = new Set(equipmentBag.map((item) => item.head.split(" ")[0]));

export default function UeberMichEquipmentPage() {
  return (
    <>
      <SeoPageJsonLd
        schema={[
          webPageJsonLd({ path: PAGE_PATH, name: "Mein Bag – Equipment", description: EQUIPMENT_DESCRIPTION }),
          ueberMichChildBreadcrumbJsonLd("Mein Bag", PAGE_PATH),
        ]}
      />
      <AboutSubpageShell
        label="Über mich"
        title="Mein Bag"
        lead="Was ich im Spiel dabei habe — und bei wem ich fitten gehe."
        heroSrc={seoImages.golfTeam}
        heroAlt={seoImageAlts.golfTeam}
        heroBgClassName="about-hero-bg--focus-top"
      >
        <section className="mg-section mg-bag" aria-labelledby="mg-bag-title">
          <div className="mg-container">
            <header className="mg-section-head mg-section-head--split mg-bag__head">
              <Reveal className="mg-bag__head-main">
                <p className="mg-eyebrow">Im Bag</p>
                <h2 id="mg-bag-title" className="mg-h2">
                  Von Driver bis Putter.
                </h2>
              </Reveal>
              <Reveal className="mg-bag__head-aside" delay={0.1}>
                <p className="mg-lead">Kopf, Loft und Schaft — so ist mein Bag aktuell aufgebaut.</p>
                <dl className="mg-bag__stats">
                  <div className="mg-stat">
                    <dt className="mg-stat__label">Positionen im Bag</dt>
                    <dd className="mg-stat__value mg-bag__stat-value">
                      <CountUp to={equipmentBag.length} />
                    </dd>
                  </div>
                  <div className="mg-stat">
                    <dt className="mg-stat__label">Marken</dt>
                    <dd className="mg-stat__value mg-bag__stat-value">
                      <CountUp to={bagBrands.size} />
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </header>

            <Stagger as="ol" className="mg-bag__grid" stagger={0.07} aria-label="Schläger im Bag, vom Driver bis zum Putter">
              {equipmentBag.map((item, index) => {
                const { brand, model, specs } = toSpecSheet(item);
                const number = String(index + 1).padStart(2, "0");
                return (
                  <StaggerItem as="li" key={item.id} className="mg-bag__item">
                    <TiltCard className="mg-bag__card" max={3} lift={6}>
                      <article className="mg-bag__article" aria-labelledby={`mg-bag-${item.id}`}>
                        <div className="mg-bag__media">
                          {item.imageSrc ? (
                            <Image
                              src={item.imageSrc}
                              alt={`${item.slot}: ${brand} ${model}`}
                              fill
                              className="mg-bag__img"
                              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 46vw, 400px"
                            />
                          ) : (
                            <span className="mg-bag__placeholder">Foto folgt</span>
                          )}
                        </div>
                        <div className="mg-bag__body">
                          <p className="mg-bag__meta">
                            <span className="mg-bag__index" aria-hidden="true">
                              {number}
                            </span>
                            <span className="mg-bag__slot">{item.slot}</span>
                          </p>
                          <h3 id={`mg-bag-${item.id}`} className="mg-bag__model">
                            <span className="mg-bag__brand">{brand}</span>
                            <span className="mg-bag__name">{model}</span>
                          </h3>
                          {specs.length > 0 ? (
                            <dl className="mg-bag__specs">
                              {specs.map((spec) => (
                                <div key={`${item.id}-${spec.label}`} className="mg-bag__spec">
                                  <dt>{spec.label}</dt>
                                  <dd>{spec.value}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : null}
                        </div>
                      </article>
                    </TiltCard>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <Reveal as="p" className="mg-bag__footnote">
              <span className="mg-muted">Stand wie hier — nach Saison und Testing kann sich was ändern.</span>
              <Link href="/ueber-mich/sponsoren" className="mg-link-arrow">
                Zu meinen Sponsoren <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="mg-section mg-fitter" aria-labelledby="mg-fitter-title">
          <div className="mg-container mg-fitter__layout">
            <Reveal className="mg-fitter__media">
              <div className="mg-fitter__frame">
                <Image
                  src={equipmentTheGolfersMalans.imageSrc}
                  alt={equipmentTheGolfersMalans.imageAlt}
                  fill
                  className="mg-fitter__img"
                  sizes="(max-width: 959px) calc(100vw - 2rem), 600px"
                />
              </div>
            </Reveal>
            <Reveal className="mg-fitter__copy" delay={0.1}>
              <p className="mg-eyebrow">Fitting &amp; Beratung</p>
              <h2 id="mg-fitter-title" className="mg-h2 mg-fitter__title">
                {equipmentTheGolfersMalans.kicker}
              </h2>
              <div className="mg-fitter__text">
                {equipmentTheGolfersMalans.paragraphs.map((p, i) => (
                  <p key={`equipment-fitter-${i}`} className="mg-body">
                    {p}
                  </p>
                ))}
              </div>
              <a
                href={equipmentTheGolfersMalans.websiteHref}
                className="mg-btn mg-btn--ghost mg-fitter__cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                {equipmentTheGolfersMalans.websiteLabel}
                <span className="mg-btn__arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="mg-sr-only"> (öffnet in neuem Tab)</span>
              </a>
            </Reveal>
          </div>
        </section>
      </AboutSubpageShell>
    </>
  );
}
