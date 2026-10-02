import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/motion/count-up";
import { Marquee } from "@/components/motion/marquee";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { careerStats } from "@/content/career";
import { homeMarqueeSponsorCards } from "@/content/sponsorsSite";

export function ProofBand() {
  const sponsors = homeMarqueeSponsorCards();

  return (
    <section className="mg-proof" aria-label="Kennzahlen und Sponsoren">
      <Stagger as="ul" className="mg-proof__stats mg-container" aria-label="Kennzahlen">
        <StaggerItem as="li" className="mg-stat">
          <span className="mg-stat__value">
            <CountUp to={careerStats.pgtWins} />
          </span>
          <span className="mg-stat__label">Siege auf der Pro Golf Tour</span>
        </StaggerItem>
        <StaggerItem as="li" className="mg-stat">
          <span className="mg-stat__value">
            <CountUp to={careerStats.pgtRankingCurrent} suffix="." />
          </span>
          <span className="mg-stat__label">Rang Pro Golf Tour {careerStats.pgtRankingYear}</span>
        </StaggerItem>
        <StaggerItem as="li" className="mg-stat">
          <span className="mg-stat__value">
            <CountUp to={careerStats.supporters} />
          </span>
          <span className="mg-stat__label">Gönnerinnen &amp; Gönner im Team</span>
        </StaggerItem>
        <StaggerItem as="li" className="mg-stat">
          <span className="mg-stat__value">{careerStats.proSince}</span>
          <span className="mg-stat__label">Playing Professional seit</span>
        </StaggerItem>
      </Stagger>

      {sponsors.length > 0 ? (
        <div className="mg-proof__logos">
          <p className="mg-proof__logos-label mg-container">Getragen von</p>
          <Marquee aria-label="Sponsoren und Partner" speed={2.4}>
            <ul className="mg-logo-row">
              {sponsors.map((s) => {
                const logo = (
                  <Image src={s.logo_url} alt={s.name} width={168} height={64} sizes="168px" className="mg-logo-row__img" />
                );
                return (
                  <li key={s.id} className="mg-logo-row__item">
                    {!s.website_url ? (
                      logo
                    ) : s.website_url.startsWith("/") ? (
                      <Link href={s.website_url}>{logo}</Link>
                    ) : (
                      <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                        {logo}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </Marquee>
        </div>
      ) : null}
    </section>
  );
}
