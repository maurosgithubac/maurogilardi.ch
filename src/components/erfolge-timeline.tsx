"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";
import { careerPhaseLabel, type CareerEntry } from "@/content/career";

/**
 * Zeitstrahl mit scroll-gekoppelter Fortschrittslinie.
 * Layout rein per CSS-Grid (kein Messen per JS → kein Layout-Shift).
 */
export function ErfolgeTimeline({ entries }: { entries: CareerEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="mg-timeline">
      <div className="mg-timeline__rail" aria-hidden="true">
        <motion.div className="mg-timeline__progress" style={reduce ? { scaleY: 1 } : { scaleY }} />
      </div>

      <ol className="mg-timeline__list" aria-label="Werdegang als Zeitstrahl, neueste Station zuerst">
        {entries.map((entry, i) => {
          const side = i % 2 === 0 ? "left" : "right";
          return (
            <li key={entry.year} className="mg-timeline__item" data-side={side} data-phase={entry.phase}>
              <motion.span
                className="mg-timeline__dot"
                aria-hidden="true"
                initial={{ scale: 0.6, backgroundColor: "rgb(11 11 12 / 18%)" }}
                whileInView={{ scale: 1, backgroundColor: "#d71920" }}
                viewport={{ once: false, margin: "0px 0px -45% 0px" }}
                transition={{ duration: 0.4 }}
              />
              <div className="mg-timeline__year">
                <span className="mg-timeline__year-num">{entry.year}</span>
                <span className="mg-timeline__phase">{careerPhaseLabel[entry.phase]}</span>
              </div>
              <motion.article
                className="mg-timeline__card"
                initial={{ opacity: 0, x: side === "left" ? -32 : 32, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: MG_EASE }}
              >
                <h3 className="mg-timeline__title">{entry.title}</h3>
                <ul className="mg-timeline__points">
                  {entry.details.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </motion.article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
