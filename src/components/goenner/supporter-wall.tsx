import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";
import { getPublicWallNames, getSupporterCount } from "@/lib/public-stats";

/** Zwei gegenläufige Laufbänder. Namen kommen aus dem Admin (Schalter «Auf Website»). */
export async function SupporterWall() {
  const [count, wallNames] = await Promise.all([getSupporterCount(), getPublicWallNames()]);
  const names = wallNames.sort((a, b) => a.localeCompare(b, "de-CH", { sensitivity: "base" }));

  if (names.length === 0) return null;
  const half = Math.ceil(names.length / 2);

  return (
    <div className="mg-names">
      <div className="mg-names__head mg-container">
        <p className="mg-names__title">Merci an alle Gönnerinnen und Gönner der MG Gönnervereinigung</p>
        <Link href="/sponsoring#modelle" className="mg-names__join" data-track="wall_join_click">
          Werde Nummer {count + 1} <span className="mg-btn__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      <Marquee speed={1.6} direction={-1} aria-label="Gönnerinnen und Gönner, Teil 1">
        <ul className="mg-names__row">
          {names.slice(0, half).map((n, i) => (
            <li key={`${n}-${i}`}>{n}</li>
          ))}
        </ul>
      </Marquee>
      <Marquee speed={1.6} direction={1} aria-label="Gönnerinnen und Gönner, Teil 2">
        <ul className="mg-names__row">
          {names.slice(half).map((n, i) => (
            <li key={`${n}-${i}`}>{n}</li>
          ))}
        </ul>
      </Marquee>
    </div>
  );
}
