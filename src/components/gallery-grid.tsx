"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";
import { Portal } from "@/components/portal";
import { useFocusTrap, useOverlayLock } from "@/lib/ui/use-overlay";

type Item = { src: string; alt: string };

/**
 * Galerie mit Lightbox: das angeklickte Bild "fliegt" per shared layout ins Vollbild.
 * Pfeiltasten blättern, Escape schliesst, Fokus bleibt im Dialog.
 */
export function GalleryGrid({
  items,
  dense = false,
  mono = false,
}: {
  items: Item[];
  /** kleine, gleich grosse Kacheln */
  dense?: boolean;
  /** Schwarzweiss (für farbige Originale) */
  mono?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActive(null), []);
  const open = active !== null;

  useOverlayLock(open);
  useFocusTrap(dialogRef, open, close);

  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) =>
        i === null ? i : (i + dir + items.length) % items.length,
      ),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = active !== null ? items[active] : null;

  return (
    <>
      <ul className={["mg-gallery", dense ? "mg-gallery--dense" : "", mono ? "mg-gallery--mono" : ""].filter(Boolean).join(" ")}>
        {items.map((item, i) => (
          <li key={item.src} className="mg-gallery__item">
            <button
              type="button"
              className="mg-gallery__btn"
              onClick={() => setActive(i)}
              aria-label={`Bild vergrössern: ${item.alt}`}
            >
              <motion.div
                layoutId={`gallery-${item.src}`}
                className="mg-gallery__frame"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={dense ? "(max-width: 640px) 34vw, (max-width: 960px) 25vw, 17vw" : "(max-width: 640px) 50vw, (max-width: 960px) 33vw, 25vw"}
                  className="mg-cover mg-gallery__img"
                />
              </motion.div>
            </button>
          </li>
        ))}
      </ul>

      <Portal>
        <AnimatePresence>
          {current && active !== null ? (
            <motion.div
              key="lightbox"
              ref={dialogRef}
              className={mono ? "mg-lightbox mg-lightbox--mono" : "mg-lightbox"}
              role="dialog"
              aria-modal="true"
              aria-label={`Bild ${active + 1} von ${items.length}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="mg-lightbox__backdrop"
                aria-label="Schliessen"
                tabIndex={-1}
                onClick={close}
              />
              <motion.div
                layoutId={`gallery-${current.src}`}
                className="mg-lightbox__frame"
                transition={{ duration: 0.55, ease: MG_EASE }}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="mg-lightbox__img"
                  priority
                />
              </motion.div>
              <div className="mg-lightbox__bar">
                <button
                  type="button"
                  className="mg-btn mg-btn--glass mg-btn--sm"
                  onClick={() => step(-1)}
                  aria-label="Vorheriges Bild"
                >
                  ←
                </button>
                <span className="mg-lightbox__count mg-mono">
                  {active + 1} / {items.length}
                </span>
                <button
                  type="button"
                  className="mg-btn mg-btn--glass mg-btn--sm"
                  onClick={() => step(1)}
                  aria-label="Nächstes Bild"
                >
                  →
                </button>
                <button
                  type="button"
                  className="mg-btn mg-btn--light mg-btn--sm"
                  onClick={close}
                >
                  Schliessen
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
