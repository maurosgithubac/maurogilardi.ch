"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";

type RevealTag = "div" | "section" | "li" | "article" | "header" | "ul" | "ol" | "p" | "span";

type RevealProps = {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  /** Sekunden Verzögerung (für manuelles Staffeln) */
  delay?: number;
  /** Startversatz in px */
  y?: number;
  x?: number;
  /** Anteil des Elements, der sichtbar sein muss */
  amount?: number;
} & Omit<HTMLMotionProps<"div">, "children" | "className" | "initial" | "whileInView" | "viewport">;

/**
 * Einblenden beim Scrollen — nur transform/opacity (GPU-freundlich, kein Blur).
 * Mit `MotionConfig reducedMotion="user"` fällt die Bewegung automatisch weg.
 */
export function Reveal({ as = "div", children, className, delay = 0, y = 28, x = 0, amount = 0.2, ...rest }: RevealProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: MG_EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const staggerParent = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: MG_EASE } },
};

type StaggerProps = {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  "aria-label"?: string;
};

/** Container, dessen <StaggerItem>-Kinder nacheinander erscheinen. */
export function Stagger({ as = "div", children, className, stagger = 0.08, amount = 0.15, ...rest }: StaggerProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      variants={staggerParent}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  as = "div",
  children,
  className,
}: {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} variants={staggerChild}>
      {children}
    </Comp>
  );
}
