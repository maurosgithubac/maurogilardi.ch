import Link from "next/link";
import { Club100JoinButton } from "@/components/club100-join-button";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { goennerMembershipTiers } from "@/content/goennerMemberships";

const chf = new Intl.NumberFormat("de-CH");

type Props = {
  /** Link-Ziel der Anfrage-Buttons, `{id}` wird ersetzt */
  inquiryHref?: string;
  headingLevel?: "h2" | "h3";
};

/** 100er Club (rot, direkt beitreten) + Birdie/Eagle/Albatros (Anfrage). */
export function TierGrid({ inquiryHref = "/sponsoring?modell={id}#anfrage", headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const club = goennerMembershipTiers.find((t) => t.id === "hundert");
  const memberTiers = goennerMembershipTiers.filter((t) => t.id === "birdie" || t.id === "eagle" || t.id === "albatros");

  return (
    <Stagger className="mg-tiers" stagger={0.08}>
      {club ? (
        <StaggerItem className="mg-tier mg-tier--club mg-grain">
          <div className="mg-tier__top">
            <span className="mg-chip mg-chip--on-red">Beliebtester Einstieg</span>
            <Heading className="mg-tier__title">{club.title}</Heading>
            <p className="mg-tier__price">
              <span className="mg-mono">{club.priceChf}</span> CHF / Jahr
            </p>
          </div>
          <ul className="mg-tier__list">
            {club.benefits.map((b) => (
              <li key={b.text}>{b.text}</li>
            ))}
          </ul>
          <Club100JoinButton className="mg-btn mg-btn--light mg-btn--lg mg-tier__cta">
            Jetzt beitreten <span className="mg-btn__arrow" aria-hidden="true">→</span>
          </Club100JoinButton>
        </StaggerItem>
      ) : null}

      {memberTiers.map((tier) => (
        <StaggerItem key={tier.id} className={`mg-tier${tier.id === "eagle" ? " mg-tier--featured" : ""}`}>
          <div className="mg-tier__top">
            {tier.id === "eagle" ? <span className="mg-chip mg-chip--red">Empfohlen</span> : <span className="mg-tier__spacer" />}
            <Heading className="mg-tier__title">{tier.title}</Heading>
            <p className="mg-tier__price">
              <span className="mg-mono">{chf.format(tier.priceChf)}</span> CHF / Jahr
            </p>
          </div>
          <ul className="mg-tier__list">
            {tier.benefits.map((b) => (
              <li key={b.text} className={b.bold ? "is-bold" : undefined}>
                {b.text}
              </li>
            ))}
          </ul>
          <Link href={inquiryHref.replace("{id}", tier.id)} className="mg-btn mg-btn--ghost mg-tier__cta">
            {tier.title.replace(" Member", "")} anfragen
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
