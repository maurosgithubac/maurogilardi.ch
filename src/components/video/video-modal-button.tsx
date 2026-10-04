"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";
import { Portal } from "@/components/portal";
import { trackEvent } from "@/components/analytics-events";
import { VerticalVideo } from "@/components/video/vertical-video";
import type { CampaignVideo } from "@/content/campaign-video";
import { useFocusTrap, useOverlayLock } from "@/lib/ui/use-overlay";

type Props = {
  video: CampaignVideo;
  trackLabel: string;
  className?: string;
  children: ReactNode;
};

/** Auslöser (z. B. im Hero), der das Hochformat-Video in einem Popup abspielt */
export function VideoModalButton({ video, trackLabel, className, children }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useOverlayLock(open);
  useFocusTrap(dialogRef, open, close);

  function openModal() {
    trackEvent("video_play", { label: trackLabel });
    setOpen(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={openModal}>
        {children}
      </button>
      <Portal>
        <AnimatePresence>
          {open ? (
            <motion.div
              key="video-modal"
              className="mg-modal mg-video-modal"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button type="button" className="mg-modal__backdrop" aria-label="Schliessen" tabIndex={-1} onClick={close} />
              <motion.div
                ref={dialogRef}
                className="mg-video-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-label={video.title}
                tabIndex={-1}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.5, ease: MG_EASE }}
              >
                <button type="button" className="mg-modal__close mg-video-modal__close" onClick={close} aria-label="Video schliessen">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
                <VerticalVideo video={video} autoPlay trackLabel={trackLabel} sizes="(max-width: 640px) 92vw, 26rem" />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
