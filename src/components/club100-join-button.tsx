"use client";

import { useState, type ReactNode } from "react";
import { Club100JoinModal } from "@/components/club100-join-modal";

/** Button, der das 100er-Club-Modal öffnet — einsetzbar in Server-Komponenten. */
export function Club100JoinButton({ className, children, track }: { className?: string; children: ReactNode; track?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog" data-track={track}>
        {children}
      </button>
      <Club100JoinModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
