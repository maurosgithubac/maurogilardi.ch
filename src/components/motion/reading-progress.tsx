"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Dünner roter Lesefortschritt am oberen Rand (Blog-Beiträge). */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div className="mg-reading-progress" style={{ scaleX }} aria-hidden="true" />;
}
