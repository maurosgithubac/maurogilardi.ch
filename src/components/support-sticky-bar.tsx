"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";

const DISMISS_KEY = "mg-support-bar-dismissed";

/**
 * Schlanke Leiste "Gönner werden · ab 100 CHF" — nur mobil, erscheint nach etwas Scrollen
 * (wenn jemand wirklich liest), verschwindet vor dem Footer und lässt sich wegklicken.
 */
export function SupportStickyBar() {
  const [visible, setVisible] = useState(false);
  // Ref statt State: weggeklickt bleibt weggeklickt, auch bei weiterem Scrollen
  const dismissedRef = useRef(false);

  useEffect(() => {
    try {
      dismissedRef.current = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (dismissedRef.current) return;

    function onScroll() {
      if (dismissedRef.current) return;
      const doc = document.documentElement;
      const progress = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
      const footer = document.querySelector("footer");
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight * 1.05 : false;
      setVisible(progress > 0.3 && !nearFooter);
    }
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function dismiss() {
    dismissedRef.current = true;
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          className="mg-support-bar"
          aria-label="Unterstützen"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.45, ease: MG_EASE }}
        >
          <p className="mg-support-bar__text">
            <strong>Gönner werden</strong>
            <span>ab 100 CHF im Jahr</span>
          </p>
          <Link href="/2027" className="mg-btn mg-btn--accent mg-btn--sm" data-track="support_bar_click">
            Dabei sein
          </Link>
          <button type="button" className="mg-support-bar__close" aria-label="Leiste schliessen" onClick={dismiss}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
