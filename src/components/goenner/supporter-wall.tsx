import { Marquee } from "@/components/motion/marquee";
import { goennervereinigungMemberNames } from "@/content/goennervereinigungMembers";

/** Zwei gegenläufige Laufbänder mit allen Namen der MG Gönnervereinigung. */
export function SupporterWall() {
  const names = goennervereinigungMemberNames
    .map((n) => n.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de-CH", { sensitivity: "base" }));

  if (names.length === 0) return null;
  const half = Math.ceil(names.length / 2);

  return (
    <div className="mg-names">
      <p className="mg-names__title mg-container">
        Merci an {names.length} Gönnerinnen und Gönner der MG Gönnervereinigung
      </p>
      <Marquee speed={1.6} direction={-1} aria-label="Gönnerinnen und Gönner, Teil 1">
        <ul className="mg-names__row">
          {names.slice(0, half).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Marquee>
      <Marquee speed={1.6} direction={1} aria-label="Gönnerinnen und Gönner, Teil 2">
        <ul className="mg-names__row">
          {names.slice(half).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Marquee>
    </div>
  );
}
