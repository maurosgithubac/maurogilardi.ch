"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  id?: string;
  /** Start-Verzögerung in Sekunden */
  delay?: number;
  /** Abstand zwischen Wörtern in Sekunden */
  stagger?: number;
  /** Beim Laden animieren (Hero) statt beim Hineinscrollen */
  onMount?: boolean;
};

/**
 * Wort-für-Wort-Reveal (Framer-Klassiker): jedes Wort gleitet aus einer Maske nach oben.
 * Screenreader lesen den ganzen Satz über aria-label; die Einzelwörter sind versteckt.
 */
export function SplitText({ text, as = "h2", className, id, delay = 0, stagger = 0.06, onMount = false }: Props) {
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } };

  return (
    <Tag
      id={id}
      className={className}
      aria-label={text}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="mg-split-mask" aria-hidden="true">
            <motion.span
              className="mg-split-word"
              variants={{
                hidden: { y: "105%" },
                show: { y: "0%", transition: { duration: 0.9, ease: MG_EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
