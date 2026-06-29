"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Impeccable / taste-skill: confident ease-out-expo */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  delay?: number;
};

export function SectionReveal({
  children,
  className,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  delay = 0,
}: SectionRevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      initial={reduce ? false : { opacity: 1, y: 36, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.62, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.section>
  );
}

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const heroItem = {
  hidden: { opacity: 1, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.68, ease: EASE_OUT_EXPO },
  },
};

export function HeroCopyReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={heroContainer} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function HeroRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={heroItem}>
      {children}
    </motion.div>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  index?: number;
};

export function RevealItem({ children, className, index = 0 }: RevealItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <li className={className}>{children}</li>;
  }

  return (
    <motion.li
      className={className}
      initial={{ opacity: 1, y: 22, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.52,
        delay: Math.min(index * 0.07, 0.28),
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.li>
  );
}
