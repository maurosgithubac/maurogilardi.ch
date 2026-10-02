"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IconMore } from "@/components/admin/admin-icons";

export type RowMenuItem =
  | { kind: "link"; label: string; href: string; icon?: React.ReactNode }
  | { kind: "action"; label: string; onSelect: () => void; icon?: React.ReactNode; danger?: boolean; disabled?: boolean };

/** Overflow-Menü («…») für sekundäre Zeilenaktionen. Tastatur: Enter/Space öffnet, Pfeile wählen, Esc schliesst. */
export function AdminRowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const first = wrapRef.current?.querySelector<HTMLElement>("[role=menuitem]:not([disabled])");
    first?.focus();
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function onMenuKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const nodes = [...(wrapRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([disabled])") ?? [])];
    const idx = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(idx + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(idx - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="ap-menu" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="ap-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        title="Weitere Aktionen"
        onClick={() => setOpen((v) => !v)}
      >
        <IconMore />
      </button>
      {open ? (
        <div className="ap-menu-pop" role="menu" id={menuId} aria-label={label} onKeyDown={onMenuKey}>
          {items.map((item) =>
            item.kind === "link" ? (
              <Link key={item.label} href={item.href} role="menuitem" className="ap-menu-item">
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`ap-menu-item${item.danger ? " ap-menu-item--danger" : ""}`}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
