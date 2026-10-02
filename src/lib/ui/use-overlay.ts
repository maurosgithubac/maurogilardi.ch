"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Gemeinsames Register für Overlays (Menü, Modals, Quiz):
 * - sperrt das Scrollen, solange mindestens ein Overlay offen ist (zählt mit, statt sich gegenseitig zurückzusetzen)
 * - andere Popups können prüfen, ob gerade etwas offen ist (`isOverlayOpen`)
 */
const ATTR = "data-mg-overlays";

function readCount(): number {
  return Number(document.documentElement.getAttribute(ATTR) || "0");
}

function writeCount(n: number) {
  const root = document.documentElement;
  if (n <= 0) {
    root.removeAttribute(ATTR);
    document.body.style.overflow = "";
  } else {
    root.setAttribute(ATTR, String(n));
    document.body.style.overflow = "hidden";
  }
}

export function isOverlayOpen(): boolean {
  if (typeof document === "undefined") return false;
  return readCount() > 0;
}

export function useOverlayLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    writeCount(readCount() + 1);
    return () => writeCount(readCount() - 1);
  }, [active]);
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
]
  .map((sel) => `${sel}:not([tabindex="-1"])`)
  .join(", ");

/**
 * Hält den Tastaturfokus im Container, schliesst mit Escape und
 * gibt den Fokus beim Schliessen an das auslösende Element zurück.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  // In einer Ref halten, damit neue Callback-Instanzen den Fokus nicht neu setzen
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const previous = document.activeElement as HTMLElement | null;

    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? container).focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && escapeRef.current) {
        event.stopPropagation();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
