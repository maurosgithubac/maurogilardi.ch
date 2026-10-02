"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Text "füllt sich" Wort für Wort, während man scrollt (Framer-Storytelling).
 * Der Text ist von Anfang an vollständig im DOM und lesbar (Grundopazität 0.18).
 */
export function ScrollFillText({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");

  if (reduce) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return <Word key={`${word}-${i}`} word={word} progress={scrollYProgress} range={[start, end]} last={i === words.length - 1} />;
      })}
    </p>
  );
}

function Word({
  word,
  progress,
  range,
  last,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  last: boolean;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <motion.span aria-hidden="true" style={{ opacity }}>
        {word}
      </motion.span>
      {last ? null : " "}
    </>
  );
}
